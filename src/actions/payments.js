'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from './auth';
import { checkMidtransPaymentStatus as checkPaymentStatusFromMidtrans } from './midtrans';
import { revalidatePath } from 'next/cache';

/**
 * Check payment status and update invoice/class enrollment
 */
export async function checkMidtransPaymentStatus(orderId) {
    try {
        const result = await checkPaymentStatusFromMidtrans(orderId);
        return result;
    } catch (error) {
        console.error('Error checking payment status:', error);
        return { success: false, error: error.message };
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

        // Get invoice by orderId
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

        // Verify payment status
        const { checkMidtransPaymentStatus: checkPayment } = await import('./midtrans');
        const paymentStatus = await checkPayment(orderId);
        
        if (!paymentStatus.success) {
            return { success: false, error: 'Failed to verify payment status' };
        }

        // Only proceed if payment is successful
        if (paymentStatus.transactionStatus !== 'settlement' && paymentStatus.transactionStatus !== 'capture') {
            return { 
                success: false, 
                error: `Payment status is ${paymentStatus.transactionStatus}, not completed yet` 
            };
        }

        // Get participant document
        const participantRef = adminDb.collection('participants').doc(user.uid);
        const participantDoc = await participantRef.get();

        if (!participantDoc.exists) {
            return { success: false, error: 'Participant not found' };
        }

        const participantData = participantDoc.data();
        const enrolledClasses = participantData.enrolledClasses || [];

        // Only add to enrolledClasses for class/service purchases (not product/merch)
        const serviceId = invoiceData.serviceId;
        const isAlreadyEnrolled = serviceId && enrolledClasses.some(cls => cls.id === serviceId);

        if (serviceId && !isAlreadyEnrolled) {
            // Get service data
            let serviceData = null;
            const serviceDoc = await adminDb.collection('services').doc(serviceId).get();
            if (serviceDoc.exists) {
                serviceData = serviceDoc.data();
            }

            // Helper function to remove undefined values
            const removeUndefined = (obj) => {
                const cleaned = {};
                Object.keys(obj).forEach(key => {
                    if (obj[key] !== undefined) {
                        cleaned[key] = obj[key];
                    }
                });
                return cleaned;
            };

            // Build enrolled class object
            const classData = {
                id: serviceId,
                name: serviceData?.name || invoiceData.items?.[0]?.name || 'Kelas',
                title: serviceData?.name || invoiceData.items?.[0]?.name || 'Kelas',
                price: parseFloat(invoiceData.grandTotal || 0),
                purchaseDate: new Date().toISOString(),
                invoiceId: invoiceDoc.id,
                invoiceNumber: invoiceData.invoiceNumber,
                orderId: orderId,
                status: 'enrolled',
            };

            // Add optional fields if they exist
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
            const updatedEnrolledClasses = [...enrolledClasses, newEnrolledClass];

            // Update participant document
            await participantRef.update({
                enrolledClasses: updatedEnrolledClasses,
                updatedAt: new Date(),
            });
        }

        // Apply membership if invoice is for membership purchase/renewal
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
                    if (end > baseDate) baseDate = end; // perpanjang dari akhir periode saat ini
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

        // Update invoice status to 'paid'
        await adminDb.collection('invoices').doc(invoiceDoc.id).update({
            status: 'paid',
            paidDate: new Date(),
            paymentStatus: paymentStatus.transactionStatus,
            paymentMethod: 'midtrans',
            updatedAt: new Date(),
        });

        revalidatePath('/');
        revalidatePath('/services');
        revalidatePath('/profile');
        revalidatePath('/payments-history');

        return { success: true, message: 'Purchase completed successfully' };
    } catch (error) {
        console.error('Error completing purchase:', error);
        return { success: false, error: error.message || 'Failed to complete purchase' };
    }
}

/**
 * Get payment history for profile tab with real status from Midtrans.
 * For invoices with orderId, fetches current transaction status from Midtrans and syncs to Firestore.
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
        const { checkMidtransPaymentStatus: checkMidtrans } = await import('./midtrans');

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
            let status = data.status;
            let paymentStatus = data.paymentStatus || null;

            // Ambil status real dari Midtrans untuk invoice yang punya orderId (terutama yang masih pending)
            if (data.orderId) {
                const needsRefresh = !paymentStatus || status === 'pending' || status === 'unpaid';
                if (needsRefresh) {
                    const result = await checkMidtrans(data.orderId);
                    if (result.success && result.transactionStatus) {
                        paymentStatus = result.transactionStatus;
                        if (paymentStatus === 'settlement' || paymentStatus === 'capture') {
                            status = 'paid';
                            const completeResult = await completePurchase(data.orderId);
                            if (!completeResult.success) {
                                await adminDb.collection('invoices').doc(doc.id).update({
                                    status: 'paid',
                                    paymentStatus: paymentStatus,
                                    paidDate: new Date(),
                                    updatedAt: new Date(),
                                });
                            }
                        } else if (paymentStatus === 'deny' || paymentStatus === 'cancel' || paymentStatus === 'expire') {
                            status = status || 'failed';
                            await adminDb.collection('invoices').doc(doc.id).update({
                                paymentStatus: paymentStatus,
                                updatedAt: new Date(),
                            });
                        } else {
                            await adminDb.collection('invoices').doc(doc.id).update({
                                paymentStatus: paymentStatus,
                                updatedAt: new Date(),
                            });
                        }
                    }
                }
            }

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
                paymentMethod: data.paymentMethod || 'midtrans',
                createdAt,
                issueDate: data.issueDate?.toDate?.()?.toISOString?.() || null,
                dueDate: data.dueDate?.toDate?.()?.toISOString?.() || null,
                paidDate: data.paidDate?.toDate?.()?.toISOString?.() || null,
                client: data.client,
            });
        }

        return { success: true, payments };
    } catch (error) {
        console.error('Error getPaymentHistoryForProfile:', error);
        return { success: false, error: error.message, payments: [] };
    }
}

