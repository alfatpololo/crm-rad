'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from './auth';
import { revalidatePath } from 'next/cache';

function dokuStatusIsPaid(transactionStatus) {
    const s = (transactionStatus || '').toUpperCase();
    return s === 'SUCCESS' || s === 'SETTLEMENT' || s === 'PAID';
}

/**
 * Check payment status by orderId. For Doku: resolves invoice then checks Doku order status.
 * Returns { success, transactionStatus } where transactionStatus 'settlement'|'capture' = paid.
 */
export async function checkMidtransPaymentStatus(orderId) {
    try {
        const user = await getSessionUser();
        if (!user) return { success: false, error: 'User not authenticated' };
        const invoicesSnapshot = await adminDb
            .collection('invoices')
            .where('orderId', '==', orderId)
            .where('client.email', '==', user.email)
            .limit(1)
            .get();
        if (invoicesSnapshot.empty) return { success: false, error: 'Invoice not found' };
        const invoiceData = invoicesSnapshot.docs[0].data();
        if (invoiceData.paymentMethod !== 'doku') {
            return { success: false, error: 'Metode pembayaran tidak dikonfigurasi.' };
        }
        const { checkDokuOrderStatus } = await import('./doku');
        const result = await checkDokuOrderStatus(invoiceData.invoiceNumber);
        if (!result.success) return { success: false, error: result.error };
        const status = (result.transactionStatus || '').toUpperCase();
        const paid = dokuStatusIsPaid(result.transactionStatus);
        return {
            success: true,
            transactionStatus: paid ? 'settlement' : status || 'pending',
        };
    } catch (err) {
        console.error('checkMidtransPaymentStatus:', err);
        return { success: false, error: err?.message || 'Gagal cek status pembayaran.' };
    }
}

/**
 * Complete purchase after payment confirmation
 * This will add class to enrolledClasses and update invoice status
 */
export async function completePurchase(orderId) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const invoicesSnapshot = await adminDb
            .collection('invoices')
            .where('orderId', '==', orderId)
            .where('client.email', '==', user.email)
            .limit(1)
            .get();

        if (invoicesSnapshot.empty) {
            return { success: false, error: 'Invoice not found' };
        }

        const invoiceDoc = invoicesSnapshot.docs[0];
        const invoiceData = invoiceDoc.data();
        const wasAlreadyPaid = invoiceData.status === 'paid';

        if (!wasAlreadyPaid) {
            if (invoiceData.paymentMethod === 'doku') {
                const { checkDokuOrderStatus } = await import('./doku');
                const statusResult = await checkDokuOrderStatus(invoiceData.invoiceNumber);
                if (!statusResult.success) {
                    return { success: false, error: statusResult.error || 'Gagal verifikasi pembayaran.' };
                }
                if (!dokuStatusIsPaid(statusResult.transactionStatus)) {
                    return { success: false, error: 'Pembayaran belum selesai atau gagal.' };
                }
            } else {
                return { success: false, error: 'Verifikasi pembayaran tidak tersedia. Hubungi admin untuk konfirmasi pembayaran.' };
            }
        }

        const participantRef = adminDb.collection('participants').doc(user.uid);
        const participantDoc = await participantRef.get();

        if (!participantDoc.exists) {
            return { success: false, error: 'Participant not found' };
        }

        const participantData = participantDoc.data();
        const enrolledClasses = participantData.enrolledClasses || [];
        const serviceId = invoiceData.serviceId;
        const isAlreadyEnrolled = serviceId && enrolledClasses.some(cls => cls.id === serviceId);
        const isMilestone = !!(invoiceData.isMilestoneInvoice && invoiceData.classPurchaseOrderId && serviceId);

        if (wasAlreadyPaid) {
            if (isMilestone) {
                const ordSnap = await adminDb.collection('classPurchaseOrders').doc(invoiceData.classPurchaseOrderId).get();
                if (!ordSnap.exists) {
                    return { success: false, error: 'Data pembayaran bertahap tidak ditemukan.' };
                }
                const ord = ordSnap.data();
                const paid = ord.paidMilestoneCount || 0;
                const mc = ord.milestoneCount || 1;
                return {
                    success: true,
                    alreadyProcessed: true,
                    milestonePartial: ord.status === 'in_progress' && paid < mc,
                    paidMilestoneCount: paid,
                    milestoneCount: mc,
                    purchaseOrderId: invoiceData.classPurchaseOrderId,
                    message:
                        paid >= mc
                            ? 'Pembayaran kelas sudah selesai sebelumnya.'
                            : `Status: ${paid} dari ${mc} tahap sudah dibayar.`,
                };
            }
            return { success: true, alreadyProcessed: true, message: 'Transaksi sudah selesai.' };
        }

        const removeUndefined = (obj) => {
            const cleaned = {};
            Object.keys(obj).forEach((key) => {
                if (obj[key] !== undefined) {
                    cleaned[key] = obj[key];
                }
            });
            return cleaned;
        };

        const revalidatePurchasePaths = () => {
            revalidatePath('/');
            revalidatePath('/services');
            revalidatePath('/profile');
            revalidatePath('/payments-history');
        };

        const sendPaidWa = async (body) => {
            const clientPhone = invoiceData.client?.phone || participantData.phone || participantData.phoneNumber;
            if (!clientPhone) return;
            try {
                const { sendMekariWhatsApp } = await import('@/lib/mekariWa');
                await sendMekariWhatsApp(clientPhone, body);
            } catch (e) {
                console.warn('Mekari WA notif pembayaran:', e?.message || e);
            }
        };

        if (isMilestone) {
            const orderRef = adminDb.collection('classPurchaseOrders').doc(invoiceData.classPurchaseOrderId);
            const orderSnap = await orderRef.get();
            if (!orderSnap.exists) {
                return { success: false, error: 'Data order pembayaran bertahap tidak ditemukan.' };
            }
            const order = orderSnap.data();
            const expected = (order.paidMilestoneCount || 0) + 1;
            if (invoiceData.milestoneIndex !== expected) {
                return { success: false, error: 'Urutan pembayaran tidak valid. Hubungi admin.' };
            }
            const newPaid = expected;
            const mc = order.milestoneCount || 1;
            const fullPrice = parseFloat(order.totalPrice ?? invoiceData.classFullPrice ?? invoiceData.grandTotal ?? 0);

            await adminDb.collection('invoices').doc(invoiceDoc.id).update({
                status: 'paid',
                paidDate: new Date(),
                paymentStatus: invoiceData.paymentMethod === 'doku' ? 'SUCCESS' : 'manual',
                paymentMethod: invoiceData.paymentMethod || '',
                updatedAt: new Date(),
            });

            if (newPaid < mc) {
                await orderRef.update({
                    paidMilestoneCount: newPaid,
                    updatedAt: new Date(),
                });
                await sendPaidWa(
                    `Pembayaran tahap ${newPaid}/${mc} berhasil.\n\n*${order.serviceName || 'Kelas'}*\nInvoice: ${invoiceData.invoiceNumber || invoiceDoc.id}\nSelesaikan sisa pembayaran untuk akses kelas.`
                );
                revalidatePurchasePaths();
                return {
                    success: true,
                    milestonePartial: true,
                    paidMilestoneCount: newPaid,
                    milestoneCount: mc,
                    purchaseOrderId: invoiceData.classPurchaseOrderId,
                    message: `Pembayaran tahap ${newPaid} dari ${mc} berhasil. Selesaikan ${mc - newPaid} tahap lagi untuk akses kelas.`,
                };
            }

            await orderRef.update({
                paidMilestoneCount: newPaid,
                status: 'completed',
                updatedAt: new Date(),
            });

            if (serviceId && !isAlreadyEnrolled) {
                let serviceData = null;
                const serviceDoc = await adminDb.collection('services').doc(serviceId).get();
                if (serviceDoc.exists) {
                    serviceData = serviceDoc.data();
                }

                const classData = {
                    id: serviceId,
                    name: serviceData?.name || invoiceData.items?.[0]?.name || 'Kelas',
                    title: serviceData?.name || invoiceData.items?.[0]?.name || 'Kelas',
                    price: fullPrice,
                    purchaseDate: new Date().toISOString(),
                    invoiceId: invoiceDoc.id,
                    invoiceNumber: invoiceData.invoiceNumber,
                    orderId,
                    status: 'enrolled',
                };

                if (serviceData) {
                    if (serviceData.description) classData.description = serviceData.description;
                    if (serviceData.category) classData.category = serviceData.category;
                    if (serviceData.duration) classData.duration = serviceData.duration;
                    if (serviceData.instructor) classData.instructor = serviceData.instructor;
                    if (serviceData.capacity) classData.capacity = serviceData.capacity;
                    if (serviceData.startDate) classData.startDate = serviceData.startDate;
                    if (serviceData.endDate) classData.endDate = serviceData.endDate;
                    if (serviceData.imageUrl) classData.imageUrl = serviceData.imageUrl;
                }

                const newEnrolledClass = removeUndefined(classData);
                await participantRef.update({
                    enrolledClasses: [...enrolledClasses, newEnrolledClass],
                    updatedAt: new Date(),
                });
            }

            await sendPaidWa(
                `Semua tahap lunas. Kelas dapat diakses.\n\n*${order.serviceName || 'Kelas'}*\nInvoice: ${invoiceData.invoiceNumber || invoiceDoc.id}\nTerima kasih.`
            );
            revalidatePurchasePaths();
            return {
                success: true,
                milestonePartial: false,
                message: 'Semua pembayaran selesai. Kelas sekarang dapat Anda akses.',
            };
        }

        if (serviceId && !isAlreadyEnrolled) {
            let serviceData = null;
            const serviceDoc = await adminDb.collection('services').doc(serviceId).get();
            if (serviceDoc.exists) {
                serviceData = serviceDoc.data();
            }

            const classData = {
                id: serviceId,
                name: serviceData?.name || invoiceData.items?.[0]?.name || 'Kelas',
                title: serviceData?.name || invoiceData.items?.[0]?.name || 'Kelas',
                price: parseFloat(invoiceData.grandTotal || 0),
                purchaseDate: new Date().toISOString(),
                invoiceId: invoiceDoc.id,
                invoiceNumber: invoiceData.invoiceNumber,
                orderId,
                status: 'enrolled',
            };

            if (serviceData) {
                if (serviceData.description) classData.description = serviceData.description;
                if (serviceData.category) classData.category = serviceData.category;
                if (serviceData.duration) classData.duration = serviceData.duration;
                if (serviceData.instructor) classData.instructor = serviceData.instructor;
                if (serviceData.capacity) classData.capacity = serviceData.capacity;
                if (serviceData.startDate) classData.startDate = serviceData.startDate;
                if (serviceData.endDate) classData.endDate = serviceData.endDate;
                if (serviceData.imageUrl) classData.imageUrl = serviceData.imageUrl;
            }

            const newEnrolledClass = removeUndefined(classData);
            await participantRef.update({
                enrolledClasses: [...enrolledClasses, newEnrolledClass],
                updatedAt: new Date(),
            });
        }

        const membershipTypeId = invoiceData.membershipTypeId;
        if (membershipTypeId) {
            const typeDoc = await adminDb.collection('membershipTypes').doc(membershipTypeId).get();
            if (typeDoc.exists) {
                const typeData = typeDoc.data();
                const durationMonths = parseInt(typeData.durationMonths, 10) || 1;
                const participantSnapshot = await participantRef.get();
                const currentData = participantSnapshot.exists ? participantSnapshot.data() : {};
                const currentMembership = currentData.membership || {};
                let baseDate = new Date();
                const currentEnd = currentMembership.endDate;
                if (currentEnd) {
                    const end = currentEnd?.toDate ? currentEnd.toDate() : new Date(currentEnd);
                    if (end > baseDate) baseDate = end;
                }
                const newEnd = new Date(baseDate);
                newEnd.setMonth(newEnd.getMonth() + durationMonths);
                const membership = {
                    typeId: membershipTypeId,
                    typeName: typeData.name || 'Membership',
                    endDate: newEnd,
                    status: 'active',
                };
                await participantRef.update({
                    membership,
                    updatedAt: new Date(),
                });
            }
        }

        await adminDb.collection('invoices').doc(invoiceDoc.id).update({
            status: 'paid',
            paidDate: new Date(),
            paymentStatus: invoiceData.paymentMethod === 'doku' ? 'SUCCESS' : 'manual',
            paymentMethod: invoiceData.paymentMethod || '',
            updatedAt: new Date(),
        });

        await sendPaidWa(
            `Pembayaran Anda telah berhasil.\n\n*${invoiceData.items?.[0]?.name || invoiceData.note || 'Pembelian'}*\nInvoice: ${invoiceData.invoiceNumber || invoiceDoc.id}\nTerima kasih.`
        );

        revalidatePurchasePaths();

        return { success: true, message: 'Purchase completed successfully' };
    } catch (error) {
        console.error('Error completing purchase:', error);
        return { success: false, error: error.message || 'Failed to complete purchase' };
    }
}

/**
 * Get payment history for profile tab (status from Firestore).
 * @param {string} [clientEmail] - Email dari client (useAuth) sebagai fallback jika session kosong
 */
export async function getPaymentHistoryForProfile(clientEmail) {
    try {
        const user = await getSessionUser();
        const email = user?.email || clientEmail || null;
        if (!email) {
            return { success: false, error: 'Not authenticated', payments: [] };
        }

        let invoicesSnapshot;
        try {
            invoicesSnapshot = await adminDb
                .collection('invoices')
                .where('client.email', '==', email)
                .orderBy('createdAt', 'desc')
                .limit(50)
                .get();
        } catch (indexError) {
            try {
                invoicesSnapshot = await adminDb
                    .collection('invoices')
                    .where('client.email', '==', email)
                    .orderBy('issueDate', 'desc')
                    .limit(50)
                    .get();
            } catch (indexError2) {
                // Tanpa orderBy (tidak butuh composite index), sort di memory
                invoicesSnapshot = await adminDb
                    .collection('invoices')
                    .where('client.email', '==', email)
                    .limit(100)
                    .get();
            }
        }

        const payments = [];
        const docs = [...invoicesSnapshot.docs].sort((a, b) => {
            const aData = a.data();
            const bData = b.data();
            const aTime = aData.createdAt?.toDate?.()?.getTime?.() ?? aData.issueDate?.toDate?.()?.getTime?.() ?? 0;
            const bTime = bData.createdAt?.toDate?.()?.getTime?.() ?? bData.issueDate?.toDate?.()?.getTime?.() ?? 0;
            return bTime - aTime;
        });

        for (const doc of docs) {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate?.()?.toISOString?.() || data.issueDate?.toDate?.()?.toISOString?.() || null;
            const status = data.status;
            const paymentStatus = data.paymentStatus || null;

            payments.push({
                id: doc.id,
                invoiceNumber: data.invoiceNumber,
                orderId: data.orderId,
                serviceId: data.serviceId,
                serviceName: data.items?.[0]?.name || data.serviceName || data.itemName,
                items: data.items,
                grandTotal: data.grandTotal,
                amount: data.amount,
                status,
                paymentStatus,
                paymentMethod: data.paymentMethod || '',
                createdAt,
                issueDate: data.issueDate?.toDate?.()?.toISOString?.() || null,
                dueDate: data.dueDate?.toDate?.()?.toISOString?.() || null,
                paidDate: data.paidDate?.toDate?.()?.toISOString?.() || null,
                client: data.client,
                isMilestoneInvoice: !!data.isMilestoneInvoice,
                classPurchaseOrderId: data.classPurchaseOrderId || null,
                milestoneIndex: data.milestoneIndex ?? null,
                milestoneTotalCount: data.milestoneTotalCount ?? null,
                classFullPrice: data.classFullPrice ?? null,
            });
        }

        return { success: true, payments };
    } catch (error) {
        console.error('Error getPaymentHistoryForProfile:', error);
        return { success: false, error: error.message, payments: [] };
    }
}

