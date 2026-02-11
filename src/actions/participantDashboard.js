'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from './auth';

/** Serialize one enrolled-class item so it's safe to pass to Client Components (no Timestamp/Date/class). */
function serializeEnrolledClass(item) {
    if (!item || typeof item !== 'object') return item;
    const toIso = (v) => {
        if (v == null) return null;
        if (typeof v?.toDate === 'function') return v.toDate().toISOString();
        if (v instanceof Date) return v.toISOString();
        if (typeof v === 'string') return v;
        return null;
    };
    return {
        id: item.id ?? item.serviceId,
        serviceId: item.serviceId ?? item.id,
        name: item.name ?? item.title ?? '',
        title: item.title ?? item.name ?? '',
        purchaseDate: toIso(item.purchaseDate) ?? null,
        status: item.status ?? 'enrolled',
        invoiceId: item.invoiceId ?? null,
        invoiceNumber: item.invoiceNumber ?? null,
    };
}

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

        // Get enrolled classes from participant
        let enrolledClasses = Array.isArray(participantData?.enrolledClasses) ? participantData.enrolledClasses : [];

        // Get invoices for this participant (untuk recent invoices + fallback kelas dari invoice yang sudah dibayar)
        let invoices = [];
        let paidInvoicesForClasses = [];
        try {
            const invoicesSnapshot = await adminDb
                .collection('invoices')
                .where('client.email', '==', user.email)
                .get();

            const toIssueTime = (data) => {
                const d = data.issueDate;
                if (!d) return 0;
                if (d.toDate && typeof d.toDate === 'function') return d.toDate().getTime();
                return new Date(d).getTime();
            };
            const docs = invoicesSnapshot.docs
                .sort((a, b) => toIssueTime(b.data()) - toIssueTime(a.data()))
                .slice(0, 20);

            docs.forEach((docSnap) => {
                const data = docSnap.data();
                const inv = {
                    id: docSnap.id,
                    invoiceNumber: data.invoiceNumber,
                    grandTotal: data.grandTotal,
                    status: data.status,
                    issueDate: data.issueDate?.toDate?.()?.toISOString() || null,
                    dueDate: data.dueDate?.toDate?.()?.toISOString() || null,
                };
                invoices.push(inv);
                if (data.status === 'paid' && (data.serviceId || (data.items && data.items.length > 0))) {
                    paidInvoicesForClasses.push({ ...data, id: docSnap.id });
                }
            });
        } catch (error) {
            console.error('Error fetching invoices:', error);
        }

        // Fallback: jika Kelas Saya kosong tapi user punya invoice paid yang berisi kelas, ambil dari invoice
        if (enrolledClasses.length === 0 && paidInvoicesForClasses.length > 0) {
            const seenIds = new Set();
            for (const inv of paidInvoicesForClasses) {
                const serviceId = inv.serviceId || inv.items?.[0]?.id;
                const name = inv.items?.[0]?.name || 'Kelas';
                if (!serviceId || seenIds.has(serviceId)) continue;
                seenIds.add(serviceId);
                let serviceName = name;
                try {
                    const serviceDoc = await adminDb.collection('services').doc(serviceId).get();
                    if (serviceDoc.exists && serviceDoc.data()?.name) {
                        serviceName = serviceDoc.data().name;
                    }
                } catch (_) {}
                enrolledClasses.push({
                    id: serviceId,
                    serviceId,
                    name: serviceName,
                    title: serviceName,
                    purchaseDate: inv.paidDate?.toDate?.()?.toISOString?.() || inv.issueDate?.toDate?.()?.toISOString?.() || new Date().toISOString(),
                    status: 'enrolled',
                    invoiceId: inv.id,
                    invoiceNumber: inv.invoiceNumber,
                });
            }
            // Sync ke dokumen participant supaya "Kelas Saya" di profil / client baca juga dapat data real
            if (enrolledClasses.length > 0 && participantDoc.exists) {
                try {
                    await adminDb.collection('participants').doc(user.uid).update({
                        enrolledClasses,
                        updatedAt: new Date(),
                    });
                } catch (e) {
                    console.error('Error syncing enrolledClasses to participant:', e);
                }
            }
        }

        // Calculate stats
        const totalPaid = invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + parseFloat(inv.grandTotal || 0), 0);

        const totalUnpaid = invoices
            .filter(inv => ['pending', 'unpaid', 'overdue'].includes(inv.status))
            .reduce((sum, inv) => sum + parseFloat(inv.grandTotal || 0), 0);

        const toIso = (v) => (v?.toDate ? v.toDate().toISOString() : (v instanceof Date ? v.toISOString() : v));
        const membership = participantData?.membership
            ? {
                typeId: participantData.membership.typeId,
                typeName: participantData.membership.typeName || 'Membership',
                endDate: toIso(participantData.membership.endDate),
                status: participantData.membership.status || 'active',
            }
            : null;

        return {
            participant: {
                name: participantData?.name || user.displayName || user.email?.split('@')[0] || 'User',
                email: participantData?.email || user.email || '',
                phone: participantData?.phone || participantData?.phoneNumber || '',
                enrolledClasses: enrolledClasses.length,
                certificates: participantData?.certificates?.length || 0,
            },
            membership,
            stats: {
                totalClasses: enrolledClasses.length,
                completedClasses: participantData?.completedClasses?.length || 0,
                certificates: participantData?.certificates?.length || 0,
                totalPaid: totalPaid.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
                totalUnpaid: totalUnpaid.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }),
            },
            recentInvoices: invoices.slice(0, 5),
            enrolledClasses: enrolledClasses.map(serializeEnrolledClass),
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
            membership: null,
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
