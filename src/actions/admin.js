'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from './auth';

/**
 * Get all participants with their enrolled classes and purchases
 */
export async function getParticipantsWithDetails() {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        const participantsSnapshot = await adminDb.collection('participants').get();
        
        const participants = [];
        for (const docSnap of participantsSnapshot.docs) {
            const data = docSnap.data();
            const participantId = docSnap.id;

            // Get enrolled classes
            const enrolledClasses = data.enrolledClasses || [];
            
            // Get completed classes
            const completedClasses = data.completedClasses || [];

            // Get invoices for this participant
            const invoicesSnapshot = await adminDb
                .collection('invoices')
                .where('client.email', '==', data.email || '')
                .get();

            const purchases = [];
            invoicesSnapshot.forEach(invDoc => {
                const invData = invDoc.data();
                purchases.push({
                    id: invDoc.id,
                    invoiceNumber: invData.invoiceNumber,
                    items: invData.items || [],
                    grandTotal: invData.grandTotal,
                    status: invData.status,
                    issueDate: invData.issueDate?.toDate?.()?.toISOString() || null,
                });
            });

            // Serialize enrolled classes and completed classes (convert any Date/Timestamp objects)
            const serializedEnrolledClasses = enrolledClasses.map(cls => {
                const serialized = { ...cls };
                if (cls.purchaseDate) {
                    serialized.purchaseDate = cls.purchaseDate?.toDate ? cls.purchaseDate.toDate().toISOString() : 
                                              (cls.purchaseDate instanceof Date ? cls.purchaseDate.toISOString() : cls.purchaseDate);
                }
                return serialized;
            });
            
            const serializedCompletedClasses = completedClasses.map(cls => {
                const serialized = { ...cls };
                if (cls.completedDate) {
                    serialized.completedDate = cls.completedDate?.toDate ? cls.completedDate.toDate().toISOString() : 
                                               (cls.completedDate instanceof Date ? cls.completedDate.toISOString() : cls.completedDate);
                }
                return serialized;
            });
            
            participants.push({
                id: participantId,
                name: data.name || data.displayName || 'Unknown',
                email: data.email || '',
                phone: data.phone || data.phoneNumber || '',
                enrolledClasses: enrolledClasses.length,
                enrolledClassesDetails: serializedEnrolledClasses,
                completedClasses: completedClasses.length,
                completedClassesDetails: serializedCompletedClasses,
                purchases: purchases.length,
                purchasesDetails: purchases,
                certificates: data.certificates?.length || 0,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : 
                           (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt) || null,
            });
        }

        return { participants };
    } catch (error) {
        console.error('Error fetching participants with details:', error);
        return { error: error.message };
    }
}

/**
 * Get participant detail by ID (for admin view)
 */
export async function getParticipantDetailForAdmin(participantId) {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        const participantDoc = await adminDb.collection('participants').doc(participantId).get();
        if (!participantDoc.exists) {
            return { error: 'Participant not found' };
        }

        const data = participantDoc.data();
        
        // Get enrolled classes with details
        const enrolledClasses = data.enrolledClasses || [];
        
        // Get completed classes
        const completedClasses = data.completedClasses || [];

        // Get all invoices
        const invoicesSnapshot = await adminDb
            .collection('invoices')
            .where('client.email', '==', data.email || '')
            .orderBy('issueDate', 'desc')
            .get();

        const invoices = [];
        invoicesSnapshot.forEach(invDoc => {
            const invData = invDoc.data();
            invoices.push({
                id: invDoc.id,
                invoiceNumber: invData.invoiceNumber,
                items: invData.items || [],
                grandTotal: invData.grandTotal,
                status: invData.status,
                issueDate: invData.issueDate?.toDate?.()?.toISOString() || null,
                dueDate: invData.dueDate?.toDate?.()?.toISOString() || null,
            });
        });

        // Get certificates (serialize Date objects)
        const certificates = (data.certificates || []).map(cert => {
            const serialized = { ...cert };
            if (cert.issueDate) {
                serialized.issueDate = cert.issueDate?.toDate ? cert.issueDate.toDate().toISOString() : 
                                       (cert.issueDate instanceof Date ? cert.issueDate.toISOString() : cert.issueDate);
            }
            return serialized;
        });

        // Get attendance history (serialize Date objects)
        const attendanceHistory = (data.attendanceHistory || []).map(att => {
            const serialized = { ...att };
            if (att.date) {
                serialized.date = att.date?.toDate ? att.date.toDate().toISOString() : 
                                 (att.date instanceof Date ? att.date.toISOString() : att.date);
            }
            return serialized;
        });
        
        // Serialize enrolled classes
        const serializedEnrolledClasses = (enrolledClasses || []).map(cls => {
            const serialized = { ...cls };
            if (cls.purchaseDate) {
                serialized.purchaseDate = cls.purchaseDate?.toDate ? cls.purchaseDate.toDate().toISOString() : 
                                          (cls.purchaseDate instanceof Date ? cls.purchaseDate.toISOString() : cls.purchaseDate);
            }
            return serialized;
        });
        
        // Serialize completed classes
        const serializedCompletedClasses = (completedClasses || []).map(cls => {
            const serialized = { ...cls };
            if (cls.completedDate) {
                serialized.completedDate = cls.completedDate?.toDate ? cls.completedDate.toDate().toISOString() : 
                                           (cls.completedDate instanceof Date ? cls.completedDate.toISOString() : cls.completedDate);
            }
            return serialized;
        });

        return {
            participant: {
                id: participantDoc.id,
                name: data.name || data.displayName || 'Unknown',
                email: data.email || '',
                phone: data.phone || data.phoneNumber || '',
                address: data.address || data.location || '',
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            },
            enrolledClasses: serializedEnrolledClasses,
            completedClasses: serializedCompletedClasses,
            invoices,
            certificates,
            attendanceHistory,
        };
    } catch (error) {
        console.error('Error fetching participant detail:', error);
        return { error: error.message };
    }
}

/**
 * Get admin dashboard stats
 */
export async function getAdminDashboardStats() {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        // Total participants
        const participantsSnapshot = await adminDb.collection('participants').count().get();
        const totalParticipants = participantsSnapshot.data().count;

        // Total enrolled classes across all participants
        const allParticipants = await adminDb.collection('participants').get();
        let totalEnrolledClasses = 0;
        allParticipants.forEach(doc => {
            const data = doc.data();
            totalEnrolledClasses += (data.enrolledClasses?.length || 0);
        });

        // Total revenue from paid invoices
        const invoicesSnapshot = await adminDb.collection('invoices').get();
        let totalRevenue = 0;
        let totalUnpaid = 0;
        invoicesSnapshot.forEach(doc => {
            const data = doc.data();
            const grandTotal = parseFloat(data.grandTotal) || 0;
            if (data.status === 'paid') {
                totalRevenue += grandTotal;
            } else if (['pending', 'unpaid', 'overdue'].includes(data.status)) {
                totalUnpaid += grandTotal;
            }
        });

        return {
            totalParticipants,
            totalEnrolledClasses,
            totalRevenue: totalRevenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
            totalUnpaid: totalUnpaid.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
        };
    } catch (error) {
        console.error('Error fetching admin dashboard stats:', error);
        return { error: error.message };
    }
}

