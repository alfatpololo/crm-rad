'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from './auth';

/**
 * Get current user profile data
 */
export async function getCurrentUserProfile() {
    try {
        const user = await getSessionUser();
        if (!user) return null;

        // Try to get from users collection first
        let userDoc = await adminDb.collection('users').doc(user.uid).get();
        
        // If not found in users, try participants collection
        if (!userDoc.exists && user.role === 'participant') {
            userDoc = await adminDb.collection('participants').doc(user.uid).get();
        }

        if (!userDoc.exists) {
            // Return basic auth data if no Firestore data
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                photoURL: user.photoURL || null,
                phoneNumber: user.phoneNumber || null,
                emailVerified: user.emailVerified || false,
            };
        }

        const data = userDoc.data();
        return {
            uid: user.uid,
            email: user.email || data.email,
            displayName: data.name || data.displayName || user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: data.photoURL || data.avatar || user.photoURL || null,
            phoneNumber: data.phoneNumber || data.phone || user.phoneNumber || null,
            emailVerified: user.emailVerified || false,
            location: data.location || data.address || null,
            bio: data.bio || data.about || null,
            company: data.company || null,
            position: data.position || data.role || null,
            website: data.website || null,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            // Social media links if available
            socialMedia: data.socialMedia || {},
        };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}






