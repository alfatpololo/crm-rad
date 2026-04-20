'use server';

import { adminDb } from '@/lib/firebase/admin';

export async function getDashboardStats() {
    try {
        if (!adminDb) return {
            revenue: 0,
            unpaid: 0,
            participants: 0,
            totalClasses: 0,
            totalInvoices: 0,
            pendingPayments: 0
        };

        // 1. Total Participants
        const participantsSnapshot = await adminDb.collection('participants').count().get();
        const participantsCount = participantsSnapshot.data().count;

        // 2. Total Classes/Services
        const servicesSnapshot = await adminDb.collection('services').count().get();
        const totalClasses = servicesSnapshot.data().count;

        // 3. Invoices Stats (Revenue, Unpaid, Total, Pending)
        const invoicesSnapshot = await adminDb.collection('invoices').get();
        let totalRevenue = 0;
        let totalUnpaid = 0;
        let pendingPayments = 0;
        const totalInvoices = invoicesSnapshot.size;

        invoicesSnapshot.forEach(doc => {
            const data = doc.data();
            const grandTotal = parseFloat(data.grandTotal) || 0;

            if (data.status === 'paid') {
                totalRevenue += grandTotal;
            } else if (data.status === 'pending') {
                pendingPayments += grandTotal;
                totalUnpaid += grandTotal;
            } else if (['overdue', 'unpaid'].includes(data.status)) {
                totalUnpaid += grandTotal;
            }
        });

        return {
            revenue: totalRevenue,
            unpaid: totalUnpaid,
            participants: participantsCount,
            totalClasses: totalClasses,
            totalInvoices: totalInvoices,
            pendingPayments: pendingPayments
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            revenue: 0,
            unpaid: 0,
            participants: 0,
            totalClasses: 0,
            totalInvoices: 0,
            pendingPayments: 0
        };
    }
}
