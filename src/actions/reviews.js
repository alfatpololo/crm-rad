'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from './auth';
import { revalidatePath } from 'next/cache';

/**
 * Helper function to serialize Firestore data
 */
function serializeFirestoreData(data) {
    if (data === null || data === undefined) return data;
    
    if (data.toDate && typeof data.toDate === 'function') {
        return data.toDate().toISOString();
    }
    
    if (data instanceof Date) {
        return data.toISOString();
    }
    
    if (Array.isArray(data)) {
        return data.map(item => serializeFirestoreData(item));
    }
    
    if (typeof data === 'object' && data.constructor === Object) {
        const serialized = {};
        for (const [key, value] of Object.entries(data)) {
            serialized[key] = serializeFirestoreData(value);
        }
        return serialized;
    }
    
    return data;
}

/**
 * Get reviews/ratings for a service
 */
export async function getServiceReviews(serviceId) {
    try {
        let reviewsSnapshot;
        try {
            reviewsSnapshot = await adminDb
                .collection('reviews')
                .where('serviceId', '==', serviceId)
                .orderBy('createdAt', 'desc')
                .get();
        } catch (queryError) {
            // Fallback when composite index is not created yet in Firestore.
            if (queryError?.code !== 9) {
                throw queryError;
            }

            reviewsSnapshot = await adminDb
                .collection('reviews')
                .where('serviceId', '==', serviceId)
                .get();
        }

        const reviews = [];
        
        for (const docSnap of reviewsSnapshot.docs) {
            const data = docSnap.data();
            
            // Get participant info
            let participantData = null;
            if (data.participantId) {
                const participantDoc = await adminDb.collection('participants').doc(data.participantId).get();
                if (participantDoc.exists) {
                    const pData = participantDoc.data();
                    participantData = {
                        name: pData.name || pData.displayName || 'Anonymous',
                        email: pData.email || '',
                        photoURL: pData.photoURL || null,
                    };
                }
            }

            reviews.push({
                id: docSnap.id,
                serviceId: data.serviceId,
                participantId: data.participantId,
                participant: participantData,
                rating: data.rating || 0,
                comment: data.comment || '',
                createdAt: serializeFirestoreData(data.createdAt),
                updatedAt: serializeFirestoreData(data.updatedAt),
            });
        }

        reviews.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        });

        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        const ratingCount = reviews.length;

        // Count ratings by star
        const ratingDistribution = {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length,
        };

        return {
            reviews,
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
            ratingCount,
            ratingDistribution,
        };
    } catch (error) {
        console.error('Error fetching service reviews:', error);
        return { reviews: [], averageRating: 0, ratingCount: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }
}

/**
 * Get user's review for a service (if exists)
 */
export async function getUserReview(serviceId) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return null;
        }

        const reviewsSnapshot = await adminDb
            .collection('reviews')
            .where('serviceId', '==', serviceId)
            .where('participantId', '==', user.uid)
            .limit(1)
            .get();

        if (reviewsSnapshot.empty) {
            return null;
        }

        const docSnap = reviewsSnapshot.docs[0];
        const data = docSnap.data();

        return {
            id: docSnap.id,
            serviceId: data.serviceId,
            participantId: data.participantId,
            rating: data.rating || 0,
            comment: data.comment || '',
            createdAt: serializeFirestoreData(data.createdAt),
            updatedAt: serializeFirestoreData(data.updatedAt),
        };
    } catch (error) {
        console.error('Error fetching user review:', error);
        return null;
    }
}

/**
 * Create or update a review
 */
export async function saveReview(serviceId, rating, comment) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return { success: false, error: 'Rating harus antara 1-5' };
        }

        // Check if user is enrolled in this service
        const participantDoc = await adminDb.collection('participants').doc(user.uid).get();
        if (!participantDoc.exists) {
            return { success: false, error: 'Anda belum terdaftar di kelas ini' };
        }

        const participantData = participantDoc.data();
        const enrolledClasses = participantData.enrolledClasses || [];
        const isEnrolled = enrolledClasses.some(cls => cls.id === serviceId);

        if (!isEnrolled) {
            return { success: false, error: 'Anda harus terdaftar di kelas ini untuk memberikan review' };
        }

        // Check if review already exists
        const existingReviewSnapshot = await adminDb
            .collection('reviews')
            .where('serviceId', '==', serviceId)
            .where('participantId', '==', user.uid)
            .limit(1)
            .get();

        if (!existingReviewSnapshot.empty) {
            // Update existing review
            const existingDoc = existingReviewSnapshot.docs[0];
            await existingDoc.ref.update({
                rating,
                comment: comment || '',
                updatedAt: new Date(),
            });
        } else {
            // Create new review
            await adminDb.collection('reviews').add({
                serviceId,
                participantId: user.uid,
                rating,
                comment: comment || '',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        revalidatePath(`/services/view/${serviceId}`);
        return { success: true };
    } catch (error) {
        console.error('Error saving review:', error);
        return { success: false, error: error.message || 'Gagal menyimpan review' };
    }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const reviewDoc = await adminDb.collection('reviews').doc(reviewId).get();
        if (!reviewDoc.exists) {
            return { success: false, error: 'Review tidak ditemukan' };
        }

        const reviewData = reviewDoc.data();
        if (reviewData.participantId !== user.uid) {
            return { success: false, error: 'Anda tidak memiliki izin untuk menghapus review ini' };
        }

        await reviewDoc.ref.delete();
        
        revalidatePath(`/services/view/${reviewData.serviceId}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting review:', error);
        return { success: false, error: error.message || 'Gagal menghapus review' };
    }
}



