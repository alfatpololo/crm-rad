'use server';

import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function createSession(idToken) {
    try {
        // Check if adminAuth is initialized
        if (!adminAuth) {
            const errorMsg = 'Firebase Admin not initialized. ' +
                'Please check if FIREBASE_SERVICE_ACCOUNT_KEY is set correctly in Vercel Environment Variables. ' +
                'Get it from: https://console.firebase.google.com/project/crm-pt-rad/settings/serviceaccounts/adminsdk';
            console.error('❌ Create Session Error:', errorMsg);
            return { success: false, error: errorMsg };
        }

        // Validate idToken
        if (!idToken || typeof idToken !== 'string') {
            const errorMsg = 'Invalid idToken provided';
            console.error('❌ Create Session Error:', errorMsg);
            return { success: false, error: errorMsg };
        }

        // 5 days
        const expiresIn = 60 * 60 * 24 * 5 * 1000;

        console.log('🔄 Creating session cookie...');
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const cookieStore = cookies();
        cookieStore.set('session', sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
            maxAge: expiresIn / 1000,
            path: '/',
            sameSite: 'lax',
        });

        console.log('✅ Session created successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Create Session Error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        return { success: false, error: error.message || 'Failed to create session' };
    }
}

export async function removeSession() {
    try {
        const cookieStore = cookies();
        cookieStore.delete('session');
        console.log('✅ Session removed');
    } catch (error) {
        console.error('❌ Error removing session:', error);
    }
}

export async function getSessionUser() {
    try {
        const cookieStore = cookies();
        const sessionCookie = cookieStore.get('session')?.value;
        
        if (!sessionCookie) {
            console.warn('⚠️ No session cookie found');
            return null;
        }

        if (!adminAuth) {
            console.error('❌ adminAuth not initialized in getSessionUser. Check FIREBASE_SERVICE_ACCOUNT_KEY.');
            return null;
        }

        try {
            const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
            console.log('✅ Session user verified:', decodedClaims.email);
            return decodedClaims;
        } catch (error) {
            console.error('❌ Error verifying session cookie:', error.message);
            // If cookie is invalid, delete it
            try {
                cookieStore.delete('session');
            } catch (e) {
                // Ignore delete errors
            }
            return null;
        }
    } catch (error) {
        console.error('❌ Error in getSessionUser:', error);
        return null;
    }
}

/**
 * Create user document in Firestore after registration
 * This is called after user successfully registers
 */
export async function createUserDocument(uid, email, displayName, role = 'participant') {
    try {
        if (!adminDb) throw new Error('Database not initialized');

        // Determine role based on email
        const userRole = email === 'admin@mail.com' ? 'admin' : role;

        // If admin, create in users collection
        if (userRole === 'admin') {
            const userDoc = {
                email: email,
                displayName: displayName || email.split('@')[0],
                role: 'admin',
                createdAt: new Date(),
                status: 'active',
            };
            await adminDb.collection('users').doc(uid).set(userDoc);
        } else {
            // If participant, create in participants collection
            const participantDoc = {
                name: displayName || email.split('@')[0],
                email: email,
                role: 'participant',
                status: 'active',
                enrolledClasses: [],
                completedClasses: [],
                certificates: [],
                createdAt: new Date(),
            };
            await adminDb.collection('participants').doc(uid).set(participantDoc);
        }

        return { success: true };
    } catch (error) {
        console.error('Error creating user document:', error);
        return { success: false, error: error.message };
    }
}
