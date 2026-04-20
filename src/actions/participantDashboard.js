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

/**
 * @param {import('firebase-admin/auth').DecodedIdToken | null} [sessionUser] — jika sudah ada dari getSessionUser() di halaman yang sama, kirim agar tidak verify session cookie dua kali (lebih cepat di dev & prod).
 */
export async function getParticipantDashboard(sessionUser = null) {
    try {
        const user = sessionUser ?? (await getSessionUser());
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
                    totalPaid: 0,
                    totalUnpaid: 0,
                },
                recentInvoices: [],
                enrolledClasses: [],
            };
        }

        const participantRef = adminDb.collection('participants').doc(user.uid);
        /** Tanpa limit, query bisa memuat ratusan dokumen → navigasi ke dashboard terasa lama. */
        const invoicesQuery = adminDb
            .collection('invoices')
            .where('client.email', '==', user.email)
            .limit(200);

        const [participantDoc, invoicesSnapshot] = await Promise.all([
            participantRef.get(),
            invoicesQuery.get().catch((err) => {
                console.error('Error fetching invoices:', err);
                return { docs: [] };
            }),
        ]);

        let participantData = null;
        if (participantDoc.exists) {
            participantData = participantDoc.data();
        }

        let enrolledClasses = Array.isArray(participantData?.enrolledClasses) ? participantData.enrolledClasses : [];

        let invoices = [];
        let paidInvoicesForClasses = [];
        try {

            const toIssueTime = (data) => {
                const d = data.issueDate;
                if (!d) return 0;
                if (d.toDate && typeof d.toDate === 'function') return d.toDate().getTime();
                return new Date(d).getTime();
            };
            const docs = (invoicesSnapshot.docs || [])
                .sort((a, b) => toIssueTime(b.data()) - toIssueTime(a.data()))
                .slice(0, 20);

            docs.forEach((docSnap) => {
                const data = docSnap.data();
                const inv = {
                    id: docSnap.id,
                    invoiceNumber: data.invoiceNumber,
                    grandTotal: data.grandTotal,
                    status: data.status,
                    serviceId: data.serviceId || null,
                    issueDate: data.issueDate?.toDate?.()?.toISOString() || null,
                    dueDate: data.dueDate?.toDate?.()?.toISOString() || null,
                };
                invoices.push(inv);
                if (data.status === 'paid' && (data.serviceId || (data.items && data.items.length > 0))) {
                    paidInvoicesForClasses.push({ ...data, id: docSnap.id });
                }
            });
        } catch (error) {
            console.error('Error processing invoices:', error);
        }

        // Fallback: jika Kelas Saya kosong tapi user punya invoice paid yang berisi kelas, ambil dari invoice
        if (enrolledClasses.length === 0 && paidInvoicesForClasses.length > 0) {
            const seenIds = new Set();
            const pendingRows = [];
            for (const inv of paidInvoicesForClasses) {
                const serviceId = inv.serviceId || inv.items?.[0]?.id;
                const name = inv.items?.[0]?.name || 'Kelas';
                if (!serviceId || seenIds.has(serviceId)) continue;
                seenIds.add(serviceId);
                pendingRows.push({ serviceId, name, inv });
            }
            const serviceIds = pendingRows.map((r) => r.serviceId);
            const serviceSnaps = await Promise.all(
                serviceIds.map((id) =>
                    adminDb.collection('services').doc(id).get().catch(() => ({ exists: false }))
                )
            );
            const nameByServiceId = new Map();
            serviceSnaps.forEach((snap, i) => {
                const sid = serviceIds[i];
                if (snap.exists && snap.data()?.name) {
                    nameByServiceId.set(sid, snap.data().name);
                }
            });
            for (const row of pendingRows) {
                const serviceName = nameByServiceId.get(row.serviceId) || row.name;
                enrolledClasses.push({
                    id: row.serviceId,
                    serviceId: row.serviceId,
                    name: serviceName,
                    title: serviceName,
                    purchaseDate: row.inv.paidDate?.toDate?.()?.toISOString?.() || row.inv.issueDate?.toDate?.()?.toISOString?.() || new Date().toISOString(),
                    status: 'enrolled',
                    invoiceId: row.inv.id,
                    invoiceNumber: row.inv.invoiceNumber,
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

        const hasClassInvoice = invoices.some(inv => inv.serviceId && ['paid', 'pending'].includes(inv.status));
        let documentsNeeded = false;
        if (hasClassInvoice) {
            const { getRequiredDocumentTypes } = await import('./documentTypes');
            const { types: reqTypes } = await getRequiredDocumentTypes();
            const typeIds = reqTypes.map(t => t.id);
            const classDocs = participantData.classDocuments || {};
            const serviceIdsNeedingDocs = new Set();
            invoices.forEach(inv => {
                const sid = inv.serviceId;
                if (!sid || !['paid', 'pending'].includes(inv.status)) return;
                const hasAll = typeIds.every(id => classDocs[sid] && classDocs[sid][id]);
                if (!hasAll) serviceIdsNeedingDocs.add(sid);
            });
            const legacyDone = serviceIdsNeedingDocs.size === 0 && !Object.keys(classDocs).length && participantData.cvUrl && participantData.ijazahUrl && invoices.filter(i => i.serviceId && ['paid', 'pending'].includes(i.status)).length === 1;
            documentsNeeded = serviceIdsNeedingDocs.size > 0 && !legacyDone;
        }

        return {
            participant: {
                name: participantData?.name || user.displayName || user.name || user.email?.split('@')[0] || 'User',
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
                totalPaid: totalPaid,
                totalUnpaid: totalUnpaid,
            },
            recentInvoices: invoices.slice(0, 5),
            enrolledClasses: enrolledClasses.map(serializeEnrolledClass),
            documentsNeeded,
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
                totalPaid: 0,
                totalUnpaid: 0,
            },
            recentInvoices: [],
            enrolledClasses: [],
            documentsNeeded: false,
        };
    }
}
