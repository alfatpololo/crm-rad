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

        // Check if already enrolled (prevent duplicate)
        const serviceId = invoiceData.serviceId;
        const isAlreadyEnrolled = enrolledClasses.some(cls => cls.id === serviceId);

        if (!isAlreadyEnrolled) {
            // Get service data
            let serviceData = null;
            if (serviceId) {
                const serviceDoc = await adminDb.collection('services').doc(serviceId).get();
                if (serviceDoc.exists) {
                    serviceData = serviceDoc.data();
                }
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

