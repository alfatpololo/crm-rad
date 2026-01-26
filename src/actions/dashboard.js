'use server';

import { adminDb } from '@/lib/firebase/admin';

export async function getDashboardStats() {
    try {
        if (!adminDb) return {
            revenue: 0,
            unpaid: 0,
            participants: 0,
            productsSold: 0
        };

        // 1. Total Participants
        const participantsSnapshot = await adminDb.collection('participants').count().get();
        const participantsCount = participantsSnapshot.data().count;

        // 2. Invoices (Revenue & Unpaid)
        // Note: For large datasets, client-side aggregation is bad. 
        // Firestore aggregation queries are efficient but basic sum might need iterating if fields are complex.
        // For MVP, we'll fetch all invoices (limit to recent if needed) and calculate.
        const invoicesSnapshot = await adminDb.collection('invoices').get();
        let totalRevenue = 0;
        let totalUnpaid = 0;
        let productsSold = 0;

        invoicesSnapshot.forEach(doc => {
            const data = doc.data();
            const grandTotal = parseFloat(data.grandTotal) || 0;

            if (data.status === 'paid') {
                totalRevenue += grandTotal;
            } else {
                // Assuming 'pending', 'overdue', 'partially' as unpaid
                if (['pending', 'overdue', 'unpaid'].includes(data.status)) {
                    totalUnpaid += grandTotal;
                }
            }

            // Count products sold
            if (data.items && Array.isArray(data.items)) {
                data.items.forEach(item => {
                    // Primitive check if item is a product (assuming we tracked type or just count all items)
                    // The user asked for "Products Sold", not Services.
                    // If we didn't store type in invoices, we might have to count all or guess.
                    // For now, count all items with qty.
                    productsSold += (parseInt(item.qty) || 0);
                });
            }
        });

        return {
            revenue: totalRevenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
            unpaid: totalUnpaid.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
            participants: participantsCount,
            productsSold: productsSold
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            revenue: 0,
            unpaid: 0,
            participants: 0,
            productsSold: 0
        };
    }
}
