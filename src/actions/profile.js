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

/**
 * Update profile peserta (hanya untuk user yang login, update dokumen participants)
 */
export async function updateParticipantProfile(data) {
    try {
        const user = await getSessionUser();
        if (!user) return { success: false, error: 'Tidak ada sesi. Silakan login ulang.' };

        const participantRef = adminDb.collection('participants').doc(user.uid);
        const docSnap = await participantRef.get();

        const updates = {
            updatedAt: new Date(),
        };
        if (data.name != null && String(data.name).trim() !== '') updates.name = String(data.name).trim();
        if (data.displayName != null) updates.displayName = String(data.displayName).trim() || updates.name;
        if (data.phone != null) updates.phone = String(data.phone).trim() || null;
        if (data.phoneNumber != null) updates.phoneNumber = String(data.phoneNumber).trim() || null;
        if (data.address != null) updates.address = String(data.address).trim() || null;
        if (data.location != null) updates.location = String(data.location).trim() || null;

        if (docSnap.exists) {
            await participantRef.update(updates);
        } else {
            await participantRef.set({
                name: updates.name || user.displayName || user.email?.split('@')[0] || 'User',
                displayName: updates.displayName || updates.name || user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email,
                phone: updates.phone ?? updates.phoneNumber ?? null,
                phoneNumber: updates.phoneNumber ?? updates.phone ?? null,
                address: updates.address ?? updates.location ?? null,
                location: updates.location ?? updates.address ?? null,
                enrolledClasses: [],
                completedClasses: [],
                certificates: [],
                attendanceHistory: [],
                role: 'participant',
                createdAt: new Date(),
                updatedAt: new Date(),
            }, { merge: true });
        }

        return { success: true, message: 'Profil berhasil diperbarui.' };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { success: false, error: error.message || 'Gagal memperbarui profil.' };
    }
}





