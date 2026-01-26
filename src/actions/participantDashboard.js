'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from './auth';

export async function getParticipantDashboard() {
    try {
        const user = await getSessionUser();
        if (!user) {
            // Return default structure if no user
            return {
                participant: {
                    name: 'User',
                    email: '',
                    phone: '',
                    enrolledClasses: 0,
                    certificates: 0,
                },
                stats: {
                    totalClasses: 0,
                    completedClasses: 0,
                    certificates: 0,
                    totalPaid: 'Rp 0',
                    totalUnpaid: 'Rp 0',
                },
                recentInvoices: [],
                enrolledClasses: [],
            };
        }

        // Get participant data
        const participantDoc = await adminDb.collection('participants').doc(user.uid).get();
        
        let participantData = null;
        if (participantDoc.exists) {
            participantData = participantDoc.data();
        }

        // Get enrolled classes/services
        const enrolledClasses = participantData?.enrolledClasses || [];

        // Get invoices for this participant
        let invoices = [];
        try {
            const invoicesSnapshot = await adminDb
                .collection('invoices')
                .where('client.email', '==', user.email)
                .orderBy('issueDate', 'desc')
                .limit(5)
                .get();

            invoicesSnapshot.forEach(doc => {
                const data = doc.data();
                invoices.push({
                    id: doc.id,
                    invoiceNumber: data.invoiceNumber,
                    grandTotal: data.grandTotal,
                    status: data.status,
                    issueDate: data.issueDate?.toDate?.()?.toISOString() || null,
                    dueDate: data.dueDate?.toDate?.()?.toISOString() || null,
                });
            });
        } catch (error) {
            console.error('Error fetching invoices:', error);
            // Continue with empty invoices array
        }

        // Calculate stats
        const totalPaid = invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + parseFloat(inv.grandTotal || 0), 0);

        const totalUnpaid = invoices
            .filter(inv => ['pending', 'unpaid', 'overdue'].includes(inv.status))
            .reduce((sum, inv) => sum + parseFloat(inv.grandTotal || 0), 0);

        return {
            participant: {
                name: participantData?.name || user.displayName || user.email?.split('@')[0] || 'User',
                email: participantData?.email || user.email || '',
                phone: participantData?.phone || participantData?.phoneNumber || '',
                enrolledClasses: enrolledClasses.length,
                certificates: participantData?.certificates?.length || 0,
            },
            stats: {
                totalClasses: enrolledClasses.length,
                completedClasses: participantData?.completedClasses?.length || 0,
                certificates: participantData?.certificates?.length || 0,
                totalPaid: totalPaid.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
                totalUnpaid: totalUnpaid.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
            },
            recentInvoices: invoices,
            enrolledClasses: enrolledClasses,
        };

    } catch (error) {
        console.error('Error fetching participant dashboard:', error);
        // Return default structure on error instead of null
        return {
            participant: {
                name: 'User',
                email: '',
                phone: '',
                enrolledClasses: 0,
                certificates: 0,
            },
            stats: {
                totalClasses: 0,
                completedClasses: 0,
                certificates: 0,
                totalPaid: 'Rp 0',
                totalUnpaid: 'Rp 0',
            },
            recentInvoices: [],
            enrolledClasses: [],
        };
    }
}
