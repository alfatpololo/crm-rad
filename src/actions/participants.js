'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from './auth';
import { createInvoice } from './invoices';
import { revalidatePath } from 'next/cache';
import { getServerAppBaseUrl } from '@/lib/appBaseUrl';
import { normalizePaymentMilestoneCount, splitTotalIntoMilestoneAmounts } from '@/lib/milestonePayment';

async function findInProgressMilestoneOrder(participantUid, serviceId) {
    const snap = await adminDb.collection('classPurchaseOrders').where('participantUid', '==', participantUid).get();
    for (const doc of snap.docs) {
        const d = doc.data();
        if (d.serviceId === serviceId && d.status === 'in_progress') {
            return { id: doc.id, ...d };
        }
    }
    return null;
}

/**
 * Helper function to remove undefined values from object
 */
function removeUndefined(obj) {
    const cleaned = {};
    Object.keys(obj).forEach(key => {
        if (obj[key] !== undefined) {
            cleaned[key] = obj[key];
        }
    });
    return cleaned;
}

/**
 * Purchase a class/service for participant
 * @param {string} serviceId
 * @param {Object} serviceData - Service object (from list or getService)
 * @param {Object} [options] - { promoCode?: string, paymentMilestoneCount?: 1|3 } — pembeli memilih lunas (1) atau cicilan 3× (3)
 */
export async function purchaseClass(serviceId, serviceData, options = {}) {
    try {
        const user = await getSessionUser();
        if (!user) {
            console.error('❌ Purchase failed: User not authenticated. Session cookie might be missing.');
            return { 
                success: false, 
                error: 'User not authenticated. Silakan login ulang.' 
            };
        }

        console.log('✅ Purchase initiated by user:', user.email);

        // Check if participant exists, create if not
        const participantRef = adminDb.collection('participants').doc(user.uid);
        const participantDoc = await participantRef.get();

        if (!participantDoc.exists) {
            // Create participant document if doesn't exist
            await participantRef.set({
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email,
                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                photoURL: user.photoURL || null,
                enrolledClasses: [],
                completedClasses: [],
                certificates: [],
                attendanceHistory: [],
                extensionRequests: [],
                role: 'participant',
                createdAt: new Date(),
            });
        }

        const participantData = participantDoc.exists ? participantDoc.data() : {
            enrolledClasses: [],
            completedClasses: [],
        };

        // Check if already enrolled
        const enrolledClasses = participantData.enrolledClasses || [];
        const isAlreadyEnrolled = enrolledClasses.some(cls => cls.id === serviceId);

        if (isAlreadyEnrolled) {
            return { success: false, error: 'Anda sudah terdaftar di kelas ini' };
        }

        const { getApplicablePriceTier, getPromoDiscount } = await import('@/utils/servicePrice');
        const tier = getApplicablePriceTier(serviceData, new Date());
        const isFree = tier.isFree;
        let servicePrice = tier.price;
        const promoResult = getPromoDiscount(serviceData, servicePrice, options.promoCode || '', new Date());
        if (promoResult.applied) {
            servicePrice = promoResult.finalPrice;
        }
        let installmentTerms = tier.installmentTerms && tier.installmentTerms.length ? tier.installmentTerms : null;
        if (!installmentTerms?.length && serviceData.installmentTerms != null) {
            const raw = serviceData.installmentTerms;
            installmentTerms = Array.isArray(raw) ? raw : (typeof raw === 'string' ? raw.split(/[,;\s]+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n) && n >= 2) : []);
        }
        if (!installmentTerms?.length) installmentTerms = [3, 4, 6, 12];
        let minDp = tier.minDp;
        if ((minDp == null || minDp === '') && serviceData.minDp != null && serviceData.minDp !== '') {
            minDp = parseFloat(serviceData.minDp);
        }

        // If free, bypass payment and directly enroll
        if (isFree) {
            console.log('✅ Free class detected, bypassing payment...');
            
            // Generate QR Code data for attendance
            const { generateQRCodeData } = await import('@/utils/qrCode');
            const qrCodeData = generateQRCodeData(serviceId, user.uid, new Date());

            // Create class data for enrollment
            const classData = {
                id: serviceId,
                name: serviceData.name || 'Kelas',
                type: serviceData.type || 'class',
                price: 0,
                purchaseDate: new Date(),
                status: 'enrolled',
                qrCodeData: qrCodeData, // QR Code for attendance
            };

            if (serviceData.startDate) {
                classData.startDate = serviceData.startDate;
            }
            if (serviceData.endDate) {
                classData.endDate = serviceData.endDate;
            }
            if (serviceData.expiryDate) {
                classData.expiryDate = serviceData.expiryDate;
            }

            const newEnrolledClass = removeUndefined(classData);
            const updatedEnrolledClasses = [...enrolledClasses, newEnrolledClass];

            // Update participant document
            await participantRef.update({
                enrolledClasses: updatedEnrolledClasses,
                updatedAt: new Date(),
            });

            revalidatePath('/');
            revalidatePath('/services');
            revalidatePath('/payments-history');

            return {
                success: true,
                message: 'Kelas gratis berhasil didaftarkan!',
                isFree: true,
            };
        }

        const adminMilestoneCount = tier.paymentMilestoneCount ?? normalizePaymentMilestoneCount(serviceData.paymentMilestoneCount, isFree);
        const rawBuyer = options.paymentMilestoneCount;
        const buyerPick = rawBuyer === 1 || rawBuyer === 3 ? rawBuyer : rawBuyer === '1' || rawBuyer === '3' ? parseInt(rawBuyer, 10) : null;
        const milestoneCount =
            !isFree && buyerPick != null && (buyerPick === 1 || buyerPick === 3)
                ? buyerPick
                : adminMilestoneCount;

        if (!isFree && milestoneCount >= 2 && servicePrice > 0) {
            const existing = await findInProgressMilestoneOrder(user.uid, serviceId);
            if (existing) {
                const resumed = await continueMilestonePurchase(existing.id, options);
                if (resumed.success && resumed.redirectUrl && resumed.orderId) {
                    return {
                        success: true,
                        invoiceNumber: resumed.invoiceNumber,
                        orderId: resumed.orderId,
                        redirectUrl: resumed.redirectUrl,
                        message:
                            resumed.message ||
                            'Lanjutkan pembayaran tahap berikutnya di payment gateway.',
                        milestoneMode: true,
                        milestoneResumed: true,
                        purchaseOrderId: existing.id,
                        milestonePaid: existing.paidMilestoneCount ?? 0,
                        milestoneTotal: existing.milestoneCount ?? milestoneCount,
                    };
                }
                return {
                    success: false,
                    error:
                        resumed.error ||
                        'Tidak dapat melanjutkan pembayaran. Cek tab Pembayaran di profil atau riwayat pembayaran.',
                    code: 'MILESTONE_IN_PROGRESS',
                    purchaseOrderId: existing.id,
                };
            }

            const milestoneAmounts = splitTotalIntoMilestoneAmounts(servicePrice, milestoneCount);
            const firstAmount = milestoneAmounts[0];
            const orderRef = await adminDb.collection('classPurchaseOrders').add({
                participantUid: user.uid,
                clientEmail: user.email || '',
                serviceId,
                serviceName: serviceData.name || 'Kelas',
                totalPrice: servicePrice,
                milestoneCount,
                milestoneAmounts,
                paidMilestoneCount: 0,
                status: 'in_progress',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const classPurchaseOrderId = orderRef.id;

            const invoiceNumber = `INV${Date.now()}${Math.random().toString(36).slice(2, 11)}`.toUpperCase().slice(0, 64);
            const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            const invoiceData = {
                invoiceNumber,
                orderId,
                serviceId,
                classPurchaseOrderId,
                milestoneIndex: 1,
                milestoneTotalCount: milestoneCount,
                isMilestoneInvoice: true,
                classFullPrice: servicePrice,
                client: {
                    name: user.displayName || user.email?.split('@')[0] || 'User',
                    email: user.email || '',
                    phone: participantData.phone || '',
                    address: participantData.address || '',
                },
                sender: {
                    name: 'LMS Training Center',
                    email: 'admin@mail.com',
                    phone: '',
                    address: '',
                },
                items: [
                    {
                        id: 1,
                        name: `${serviceData.name || 'Kelas'} (pembayaran 1/${milestoneCount})`,
                        product: serviceData.name || 'Kelas',
                        qty: 1,
                        price: firstAmount,
                        total: firstAmount,
                    },
                ],
                subTotal: firstAmount,
                tax: 0,
                grandTotal: firstAmount,
                status: 'pending',
                issueDate: new Date(),
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                note: `Pembayaran milestone 1/${milestoneCount}: ${serviceData.name}`,
                paymentMethod: 'doku',
            };

            const invoiceResult = await createInvoice(invoiceData);
            if (!invoiceResult.success) {
                await adminDb.collection('classPurchaseOrders').doc(classPurchaseOrderId).delete().catch(() => {});
                return { success: false, error: 'Gagal membuat invoice: ' + invoiceResult.error };
            }

            const baseUrl = (options?.baseUrl || getServerAppBaseUrl() || '').replace(/\/$/, '');
            const callbackUrl = baseUrl ? `${baseUrl}/payments/status?orderId=${encodeURIComponent(orderId)}` : undefined;
            const { createDokuPayment } = await import('./doku');
            const dokuResult = await createDokuPayment({
                invoiceNumber,
                amount: firstAmount,
                paymentDueMinutes: Math.min(7 * 24 * 60, 999999),
                callbackUrl,
                customer: {
                    name: invoiceData.client.name,
                    email: invoiceData.client.email,
                    phone: invoiceData.client.phone,
                },
                lineItems: [
                    {
                        id: String(serviceId).slice(0, 64),
                        name: `${(serviceData.name || 'Kelas').slice(0, 200)} (1/${milestoneCount})`.slice(0, 255),
                        quantity: 1,
                        price: Math.round(Number(firstAmount)),
                    },
                ],
            });

            if (dokuResult.success && dokuResult.paymentUrl) {
                await adminDb.collection('invoices').doc(invoiceResult.id).update({
                    dokuPaymentUrl: dokuResult.paymentUrl,
                });
                return {
                    success: true,
                    invoiceId: invoiceResult.id,
                    invoiceNumber,
                    orderId,
                    redirectUrl: dokuResult.paymentUrl,
                    message: `Pembayaran tahap 1 dari ${milestoneCount}. Setelah semua tahap lunas, akses kelas akan dibuka.`,
                    milestoneMode: true,
                    milestonePaid: 0,
                    milestoneTotal: milestoneCount,
                    purchaseOrderId: classPurchaseOrderId,
                };
            }

            await adminDb.collection('invoices').doc(invoiceResult.id).update({ paymentMethod: '' });
            if (dokuResult.error && !dokuResult.error.includes('belum dikonfigurasi')) {
                return { success: false, error: 'Pembayaran Doku gagal: ' + dokuResult.error };
            }
            return {
                success: true,
                invoiceId: invoiceResult.id,
                invoiceNumber,
                orderId,
                message: 'Invoice tahap 1 dibuat. Silakan hubungi admin untuk pembayaran.',
                milestoneMode: true,
                milestonePaid: 0,
                milestoneTotal: milestoneCount,
                purchaseOrderId: classPurchaseOrderId,
            };
        }

        // Generate invoice number and order ID (paid classes — lunas sekaligus)
        // Tanpa simbol di invoice_number (syarat beberapa channel Doku / KKI)
        const invoiceNumber = `INV${Date.now()}${Math.random().toString(36).slice(2, 11)}`.toUpperCase().slice(0, 64);
        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create invoice with status 'pending' (will be updated after payment)
        const invoiceData = {
            invoiceNumber: invoiceNumber,
            orderId: orderId,
            serviceId: serviceId,
            client: {
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                phone: participantData.phone || '',
                address: participantData.address || '',
            },
            sender: {
                name: 'LMS Training Center',
                email: 'admin@mail.com',
                phone: '',
                address: '',
            },
            items: [
                {
                    id: 1,
                    name: serviceData.name || 'Kelas',
                    product: serviceData.name || 'Kelas',
                    qty: 1,
                    price: servicePrice,
                    total: servicePrice,
                }
            ],
            subTotal: servicePrice,
            tax: 0,
            grandTotal: servicePrice,
            status: 'pending', // Will be updated to 'paid' after payment success
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            note: `Pembelian kelas: ${serviceData.name}`,
            paymentMethod: 'doku',
        };

        const invoiceResult = await createInvoice(invoiceData);

        if (!invoiceResult.success) {
            return { success: false, error: 'Gagal membuat invoice: ' + invoiceResult.error };
        }

        const baseUrl = (options?.baseUrl || getServerAppBaseUrl() || '').replace(/\/$/, '');
        const callbackUrl = baseUrl ? `${baseUrl}/payments/status?orderId=${encodeURIComponent(orderId)}` : undefined;
        const { createDokuPayment } = await import('./doku');
        const dokuResult = await createDokuPayment({
            invoiceNumber,
            amount: servicePrice,
            paymentDueMinutes: Math.min(7 * 24 * 60, 999999),
            callbackUrl,
            customer: {
                name: invoiceData.client.name,
                email: invoiceData.client.email,
                phone: invoiceData.client.phone,
            },
            lineItems: [
                {
                    id: String(serviceId).slice(0, 64),
                    name: (serviceData.name || 'Kelas').slice(0, 255),
                    quantity: 1,
                    price: Math.round(Number(servicePrice)),
                },
            ],
        });

        if (dokuResult.success && dokuResult.paymentUrl) {
            await adminDb.collection('invoices').doc(invoiceResult.id).update({
                dokuPaymentUrl: dokuResult.paymentUrl,
            });
            return {
                success: true,
                invoiceId: invoiceResult.id,
                invoiceNumber,
                orderId,
                redirectUrl: dokuResult.paymentUrl,
                message: 'Silakan selesaikan pembayaran di halaman Doku.',
            };
        }

        await adminDb.collection('invoices').doc(invoiceResult.id).update({ paymentMethod: '' });
        if (dokuResult.error && !dokuResult.error.includes('belum dikonfigurasi')) {
            return { success: false, error: 'Pembayaran Doku gagal: ' + dokuResult.error };
        }
        return {
            success: true,
            invoiceId: invoiceResult.id,
            invoiceNumber,
            orderId,
            message: 'Invoice berhasil dibuat. Silakan hubungi admin untuk pembayaran.',
        };

        // NOTE: Class will be added to enrolledClasses after payment is confirmed via webhook or status check
        // Generate QR Code data for attendance
        const { generateQRCodeData } = await import('@/utils/qrCode');
        const qrCodeData = generateQRCodeData(serviceId, user.uid, new Date());

        // Build enrolled class object - only include fields that have values
        const classData = {
            id: serviceId,
            name: serviceData.name || 'Kelas',
            title: serviceData.name || 'Kelas',
            price: parseFloat(serviceData.price || 0),
            purchaseDate: new Date().toISOString(),
            invoiceId: invoiceResult.id || null,
            invoiceNumber: invoiceNumber,
            status: 'enrolled', // SIMULASI: langsung enrolled (bisa diakses)
            qrCodeData: qrCodeData, // QR Code for attendance
        };

        // Only add optional fields if they exist and are not undefined
        if (serviceData.description !== undefined && serviceData.description !== null) {
            classData.description = serviceData.description;
        }
        if (serviceData.category !== undefined && serviceData.category !== null) {
            classData.category = serviceData.category;
        }
        if (serviceData.duration !== undefined && serviceData.duration !== null) {
            classData.duration = serviceData.duration;
        }
        if (serviceData.instructor !== undefined && serviceData.instructor !== null) {
            classData.instructor = serviceData.instructor;
        }
        if (serviceData.capacity !== undefined && serviceData.capacity !== null) {
            classData.capacity = serviceData.capacity;
        }
        if (serviceData.startDate !== undefined && serviceData.startDate !== null) {
            classData.startDate = serviceData.startDate;
        }
        if (serviceData.endDate !== undefined && serviceData.endDate !== null) {
            classData.endDate = serviceData.endDate;
        }
        if (serviceData.expiryDate !== undefined && serviceData.expiryDate !== null) {
            classData.expiryDate = serviceData.expiryDate;
        }

        const newEnrolledClass = removeUndefined(classData);

        const updatedEnrolledClasses = [...enrolledClasses, newEnrolledClass];

        // Update participant document
        await participantRef.update({
            enrolledClasses: updatedEnrolledClasses,
            updatedAt: new Date(),
        });

        revalidatePath('/');
        revalidatePath('/services');
        revalidatePath('/payments-history');

        return {
            success: true,
            invoiceId: invoiceResult.id,
            invoiceNumber: invoiceNumber,
            message: 'Kelas berhasil dibeli dan dapat diakses sekarang!', // SIMULASI: langsung bisa diakses
        };
    } catch (error) {
        console.error('Error purchasing class:', error);
        return { success: false, error: error.message || 'Gagal membeli kelas' };
    }
}

/**
 * Buat invoice + Doku untuk tahap milestone berikutnya (setelah tahap sebelumnya lunas).
 * @param {string} classPurchaseOrderId
 * @param {Object} [options] - { baseUrl?: string }
 */
export async function continueMilestonePurchase(classPurchaseOrderId, options = {}) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return { success: false, error: 'User not authenticated. Silakan login ulang.' };
        }
        if (!classPurchaseOrderId) {
            return { success: false, error: 'Order tidak valid.' };
        }

        const orderRef = adminDb.collection('classPurchaseOrders').doc(classPurchaseOrderId);
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) {
            return { success: false, error: 'Data pembayaran bertahap tidak ditemukan.' };
        }
        const order = orderSnap.data();
        if (order.participantUid !== user.uid) {
            return { success: false, error: 'Tidak diizinkan.' };
        }
        if (order.status !== 'in_progress') {
            return { success: false, error: 'Pembayaran bertahap ini sudah selesai atau tidak aktif.' };
        }

        const paid = order.paidMilestoneCount || 0;
        const total = order.milestoneCount || 1;
        if (paid >= total) {
            return { success: false, error: 'Semua tahap sudah dibayar.' };
        }

        const nextIdx = paid + 1;
        const amounts = order.milestoneAmounts || [];
        const amount = amounts[paid];
        if (amount == null || amount <= 0) {
            return { success: false, error: 'Nominal tahap tidak valid.' };
        }

        const pendingSnap = await adminDb
            .collection('invoices')
            .where('classPurchaseOrderId', '==', classPurchaseOrderId)
            .get();

        const pendingDoc = pendingSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .find((inv) => inv.milestoneIndex === nextIdx && inv.status === 'pending');

        if (pendingDoc?.dokuPaymentUrl) {
            return {
                success: true,
                orderId: pendingDoc.orderId,
                redirectUrl: pendingDoc.dokuPaymentUrl,
                invoiceNumber: pendingDoc.invoiceNumber,
                message: `Lanjutkan pembayaran tahap ${nextIdx}/${total}.`,
            };
        }

        const participantRef = adminDb.collection('participants').doc(user.uid);
        const participantDoc = await participantRef.get();
        const participantData = participantDoc.exists ? participantDoc.data() : {};

        const invoiceNumber = `INV${Date.now()}${Math.random().toString(36).slice(2, 11)}`.toUpperCase().slice(0, 64);
        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const serviceId = order.serviceId;
        const serviceName = order.serviceName || 'Kelas';

        const invoiceData = {
            invoiceNumber,
            orderId,
            serviceId,
            classPurchaseOrderId,
            milestoneIndex: nextIdx,
            milestoneTotalCount: total,
            isMilestoneInvoice: true,
            classFullPrice: order.totalPrice,
            client: {
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                phone: participantData.phone || '',
                address: participantData.address || '',
            },
            sender: {
                name: 'LMS Training Center',
                email: 'admin@mail.com',
                phone: '',
                address: '',
            },
            items: [
                {
                    id: 1,
                    name: `${serviceName} (pembayaran ${nextIdx}/${total})`,
                    product: serviceName,
                    qty: 1,
                    price: amount,
                    total: amount,
                },
            ],
            subTotal: amount,
            tax: 0,
            grandTotal: amount,
            status: 'pending',
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            note: `Pembayaran milestone ${nextIdx}/${total}: ${serviceName}`,
            paymentMethod: 'doku',
        };

        const invoiceResult = await createInvoice(invoiceData);
        if (!invoiceResult.success) {
            return { success: false, error: 'Gagal membuat invoice: ' + invoiceResult.error };
        }

        const baseUrl = (options?.baseUrl || getServerAppBaseUrl() || '').replace(/\/$/, '');
        const callbackUrl = baseUrl ? `${baseUrl}/payments/status?orderId=${encodeURIComponent(orderId)}` : undefined;
        const { createDokuPayment } = await import('./doku');
        const dokuResult = await createDokuPayment({
            invoiceNumber,
            amount,
            paymentDueMinutes: Math.min(7 * 24 * 60, 999999),
            callbackUrl,
            customer: {
                name: invoiceData.client.name,
                email: invoiceData.client.email,
                phone: invoiceData.client.phone,
            },
            lineItems: [
                {
                    id: String(serviceId).slice(0, 64),
                    name: `${serviceName.slice(0, 200)} (${nextIdx}/${total})`.slice(0, 255),
                    quantity: 1,
                    price: Math.round(Number(amount)),
                },
            ],
        });

        if (dokuResult.success && dokuResult.paymentUrl) {
            await adminDb.collection('invoices').doc(invoiceResult.id).update({
                dokuPaymentUrl: dokuResult.paymentUrl,
            });
            return {
                success: true,
                invoiceId: invoiceResult.id,
                invoiceNumber,
                orderId,
                redirectUrl: dokuResult.paymentUrl,
                message: `Silakan bayar tahap ${nextIdx} dari ${total}.`,
                milestoneMode: true,
                milestonePaid: paid,
                milestoneTotal: total,
                purchaseOrderId: classPurchaseOrderId,
            };
        }

        await adminDb.collection('invoices').doc(invoiceResult.id).update({ paymentMethod: '' });
        if (dokuResult.error && !dokuResult.error.includes('belum dikonfigurasi')) {
            return { success: false, error: 'Pembayaran Doku gagal: ' + dokuResult.error };
        }
        return {
            success: true,
            invoiceId: invoiceResult.id,
            invoiceNumber,
            orderId,
            message: 'Invoice dibuat. Silakan hubungi admin untuk pembayaran.',
            milestoneMode: true,
            purchaseOrderId: classPurchaseOrderId,
        };
    } catch (error) {
        console.error('continueMilestonePurchase:', error);
        return { success: false, error: error.message || 'Gagal melanjutkan pembayaran.' };
    }
}

/**
 * Profil / dashboard: cicilan kelas yang masih berjalan (belum semua tahap lunas).
 */
export async function listMyInProgressMilestoneOrders() {
    try {
        const user = await getSessionUser();
        if (!user) {
            return { success: false, orders: [], error: 'Belum login.' };
        }
        const snap = await adminDb.collection('classPurchaseOrders').where('participantUid', '==', user.uid).get();
        const orders = snap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((o) => o.status === 'in_progress')
            .map((o) => ({
                id: o.id,
                serviceId: o.serviceId,
                serviceName: o.serviceName || 'Kelas',
                milestoneCount: o.milestoneCount || 1,
                paidMilestoneCount: o.paidMilestoneCount ?? 0,
                totalPrice: o.totalPrice,
            }));
        return { success: true, orders };
    } catch (error) {
        console.error('listMyInProgressMilestoneOrders:', error);
        return { success: false, orders: [], error: error.message || 'Gagal memuat data cicilan.' };
    }
}

/**
 * Purchase a physical product (merch) for participant
 * @param {string} productId
 * @param {Object} productData - Product object (name, price, etc.)
 * @param {Object} [options] - { quantity?: number }
 */
export async function purchaseProduct(productId, productData, options = {}) {
    try {
        const user = await getSessionUser();
        if (!user) {
            return { success: false, error: 'User not authenticated. Silakan login ulang.' };
        }

        const participantRef = adminDb.collection('participants').doc(user.uid);
        const participantDoc = await participantRef.get();
        if (!participantDoc.exists) {
            await participantRef.set({
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email,
                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                photoURL: user.photoURL || null,
                enrolledClasses: [],
                completedClasses: [],
                certificates: [],
                attendanceHistory: [],
                extensionRequests: [],
                role: 'participant',
                createdAt: new Date(),
            });
        }

        const participantData = participantDoc.exists ? participantDoc.data() : {};
        const qty = Math.max(1, parseInt(options.quantity, 10) || 1);
        const unitPrice = parseFloat(productData.price) || 0;
        if (unitPrice <= 0) {
            return { success: false, error: 'Harga produk tidak valid.' };
        }
        const totalPrice = unitPrice * qty;

        const stock = productData.stock != null ? parseInt(productData.stock, 10) : null;
        if (stock !== null && stock < qty) {
            return { success: false, error: `Stok tidak cukup. Tersedia: ${stock}` };
        }

        // Tanpa simbol di invoice_number (syarat beberapa channel Doku / KKI)
        const invoiceNumber = `INV${Date.now()}${Math.random().toString(36).slice(2, 11)}`.toUpperCase().slice(0, 64);
        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const invoiceData = {
            invoiceNumber,
            orderId,
            productId,
            client: {
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                phone: participantData.phone || '',
                address: participantData.address || '',
            },
            sender: {
                name: 'LMS Training Center',
                email: 'admin@mail.com',
                phone: '',
                address: '',
            },
            items: [
                {
                    id: 1,
                    name: productData.name || 'Produk',
                    product: productData.name || 'Produk',
                    qty,
                    price: unitPrice,
                    total: totalPrice,
                },
            ],
            subTotal: totalPrice,
            tax: 0,
            grandTotal: totalPrice,
            status: 'pending',
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            note: `Pembelian merch: ${productData.name} x${qty}`,
            paymentMethod: 'doku',
        };

        const invoiceResult = await createInvoice(invoiceData);
        if (!invoiceResult.success) {
            return { success: false, error: 'Gagal membuat invoice: ' + invoiceResult.error };
        }

        const baseUrl = (options?.baseUrl || getServerAppBaseUrl() || '').replace(/\/$/, '');
        const callbackUrl = baseUrl ? `${baseUrl}/payments/status?orderId=${encodeURIComponent(orderId)}` : undefined;
        const { createDokuPayment } = await import('./doku');
        const dokuResult = await createDokuPayment({
            invoiceNumber,
            amount: totalPrice,
            paymentDueMinutes: Math.min(7 * 24 * 60, 999999),
            callbackUrl,
            customer: {
                name: invoiceData.client.name,
                email: invoiceData.client.email,
                phone: invoiceData.client.phone,
            },
            lineItems: [
                {
                    id: String(productId).slice(0, 64),
                    name: (productData.name || 'Produk').slice(0, 255),
                    quantity: qty,
                    price: Math.round(Number(unitPrice)),
                },
            ],
        });

        if (dokuResult.success && dokuResult.paymentUrl) {
            await adminDb.collection('invoices').doc(invoiceResult.id).update({
                dokuPaymentUrl: dokuResult.paymentUrl,
            });
            return {
                success: true,
                invoiceId: invoiceResult.id,
                invoiceNumber,
                orderId,
                redirectUrl: dokuResult.paymentUrl,
                message: 'Silakan selesaikan pembayaran di halaman Doku.',
            };
        }

        await adminDb.collection('invoices').doc(invoiceResult.id).update({ paymentMethod: '' });
        if (dokuResult.error && !dokuResult.error.includes('belum dikonfigurasi')) {
            return { success: false, error: 'Pembayaran Doku gagal: ' + dokuResult.error };
        }
        return {
            success: true,
            invoiceId: invoiceResult.id,
            invoiceNumber,
            orderId,
            message: 'Invoice berhasil dibuat. Silakan hubungi admin untuk pembayaran.',
        };
    } catch (error) {
        console.error('Error purchasing product:', error);
        return { success: false, error: error.message || 'Gagal membeli produk' };
    }
}

/**
 * Purchase or renew membership
 * @param {string} membershipTypeId
 * @param {Object} typeData - { name, price, durationMonths }
 * @param {Object} options - { baseUrl }
 */
export async function purchaseMembership(membershipTypeId, typeData, options = {}) {
    try {
        const user = await getSessionUser();
        if (!user) return { success: false, error: 'User not authenticated. Silakan login ulang.' };

        const participantRef = adminDb.collection('participants').doc(user.uid);
        const participantDoc = await participantRef.get();
        if (!participantDoc.exists) {
            await participantRef.set({
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email,
                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                photoURL: user.photoURL || null,
                enrolledClasses: [],
                completedClasses: [],
                certificates: [],
                attendanceHistory: [],
                extensionRequests: [],
                role: 'participant',
                createdAt: new Date(),
            });
        }

        const participantData = participantDoc.exists ? participantDoc.data() : {};
        const price = parseFloat(typeData.price) || 0;
        if (price <= 0) return { success: false, error: 'Harga membership tidak valid.' };

        // Tanpa simbol di invoice_number (syarat beberapa channel Doku / KKI)
        const invoiceNumber = `INV${Date.now()}${Math.random().toString(36).slice(2, 11)}`.toUpperCase().slice(0, 64);
        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const invoiceData = {
            invoiceNumber,
            orderId,
            membershipTypeId,
            client: {
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                phone: participantData.phone || '',
                address: participantData.address || '',
            },
            sender: {
                name: 'LMS Training Center',
                email: 'admin@mail.com',
                phone: '',
                address: '',
            },
            items: [
                { id: 1, name: typeData.name || 'Membership', product: typeData.name || 'Membership', qty: 1, price, total: price },
            ],
            subTotal: price,
            tax: 0,
            grandTotal: price,
            status: 'pending',
            issueDate: new Date(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            note: `Membership: ${typeData.name}`,
            paymentMethod: 'doku',
        };

        const invoiceResult = await createInvoice(invoiceData);
        if (!invoiceResult.success) return { success: false, error: 'Gagal membuat invoice: ' + invoiceResult.error };

        const baseUrl = (options?.baseUrl || getServerAppBaseUrl() || '').replace(/\/$/, '');
        const callbackUrl = baseUrl ? `${baseUrl}/payments/status?orderId=${encodeURIComponent(orderId)}` : undefined;
        const { createDokuPayment } = await import('./doku');
        const dokuResult = await createDokuPayment({
            invoiceNumber,
            amount: price,
            paymentDueMinutes: Math.min(7 * 24 * 60, 999999),
            callbackUrl,
            customer: {
                name: invoiceData.client.name,
                email: invoiceData.client.email,
                phone: invoiceData.client.phone,
            },
            lineItems: [
                {
                    id: String(membershipTypeId).slice(0, 64),
                    name: (typeData.name || 'Membership').slice(0, 255),
                    quantity: 1,
                    price: Math.round(Number(price)),
                },
            ],
        });

        if (dokuResult.success && dokuResult.paymentUrl) {
            await adminDb.collection('invoices').doc(invoiceResult.id).update({
                dokuPaymentUrl: dokuResult.paymentUrl,
            });
            return {
                success: true,
                invoiceId: invoiceResult.id,
                invoiceNumber,
                orderId,
                redirectUrl: dokuResult.paymentUrl,
                message: 'Silakan selesaikan pembayaran di halaman Doku.',
            };
        }

        await adminDb.collection('invoices').doc(invoiceResult.id).update({ paymentMethod: '' });
        if (dokuResult.error && !dokuResult.error.includes('belum dikonfigurasi')) {
            return { success: false, error: 'Pembayaran Doku gagal: ' + dokuResult.error };
        }
        return {
            success: true,
            invoiceId: invoiceResult.id,
            invoiceNumber,
            orderId,
            message: 'Invoice berhasil dibuat. Silakan hubungi admin untuk pembayaran.',
        };
    } catch (error) {
        console.error('Error purchasing membership:', error);
        return { success: false, error: error.message || 'Gagal membeli membership' };
    }
}

/**
 * Get participant's enrolled classes
 */
export async function getParticipantEnrolledClasses() {
    try {
        const user = await getSessionUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const participantDoc = await adminDb.collection('participants').doc(user.uid).get();
        
        if (!participantDoc.exists) {
            return { success: true, classes: [] };
        }

        const data = participantDoc.data();
        return {
            success: true,
            classes: data.enrolledClasses || [],
        };
    } catch (error) {
        console.error('Error fetching enrolled classes:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all participants (for admin)
 */
export async function getParticipants() {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return [];
        }

        const participantsSnapshot = await adminDb.collection('participants').get();
        
        return participantsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || data.displayName || 'Unknown',
                email: data.email || '',
                phone: data.phone || '',
                address: data.address || '',
                status: data.status || 'active',
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
                photoURL: data.photoURL || null,
            };
        });
    } catch (error) {
        console.error('Error fetching participants:', error);
        return [];
    }
}

/**
 * Create a new participant (for admin)
 */
export async function createParticipant(data) {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { success: false, error: 'Unauthorized' };
        }

        const participantData = removeUndefined({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || null,
            address: data.address || null,
            company: data.company || null,
            designation: data.designation || null,
            website: data.website || null,
            vat: data.vat || null,
            description: data.description || null,
            country: data.country || null,
            state: data.state || null,
            city: data.city || null,
            status: data.status || 'active',
            role: 'participant',
            enrolledClasses: [],
            completedClasses: [],
            certificates: [],
            attendanceHistory: [],
            extensionRequests: [],
            createdAt: new Date(),
        });

        await adminDb.collection('participants').add(participantData);

        revalidatePath('/customers/list');
        return { success: true };
    } catch (error) {
        console.error('Error creating participant:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Import multiple participants (for admin)
 */
export async function importParticipants(participantsData) {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { success: false, error: 'Unauthorized' };
        }

        const batch = adminDb.batch();
        let count = 0;

        participantsData.forEach((data) => {
            const participantRef = adminDb.collection('participants').doc();
            const participantData = {
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || null,
                role: 'participant',
                status: 'active',
                enrolledClasses: [],
                completedClasses: [],
                certificates: [],
                attendanceHistory: [],
                extensionRequests: [],
                createdAt: new Date(),
            };
            batch.set(participantRef, participantData);
            count++;
        });

        await batch.commit();
        revalidatePath('/customers/list');
        return { success: true, count };
    } catch (error) {
        console.error('Error importing participants:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Submit dokumen peserta. Bisa per kelas (serviceId + documents) atau legacy (cvUrl, ijazahUrl).
 * @param {string} [serviceId] - Jika ada: simpan ke classDocuments[serviceId]
 * @param {Object} [documents] - { [docTypeId]: url } untuk per-kelas
 * @param {string} [cvUrl] - Legacy
 * @param {string} [ijazahUrl] - Legacy
 */
export async function submitParticipantDocuments(cvUrl, ijazahUrl, serviceId = null, documents = null) {
    try {
        const user = await getSessionUser();
        if (!user) return { success: false, error: 'User not authenticated' };

        const participantRef = adminDb.collection('participants').doc(user.uid);

        if (serviceId && documents && typeof documents === 'object') {
            const urls = Object.fromEntries(
                Object.entries(documents).filter(([, v]) => v && typeof v === 'string')
            );
            if (Object.keys(urls).length === 0) return { success: false, error: 'Minimal satu dokumen diupload' };

            const participantDoc = await participantRef.get();
            const participantData = participantDoc.exists ? participantDoc.data() : {};
            const classDocuments = { ...(participantData.classDocuments || {}) };
            classDocuments[serviceId] = {
                ...urls,
                submittedAt: new Date(),
            };
            await participantRef.set({ classDocuments, updatedAt: new Date() }, { merge: true });
        } else {
            if (!cvUrl || !ijazahUrl) return { success: false, error: 'CV dan Ijazah wajib diupload (PDF)' };
            await participantRef.set({
                cvUrl,
                ijazahUrl,
                documentsSubmittedAt: new Date(),
                updatedAt: new Date(),
            }, { merge: true });
        }

        revalidatePath('/documents');
        revalidatePath('/dashboard');
        return { success: true, message: 'Dokumen berhasil disimpan' };
    } catch (error) {
        console.error('Error submitting documents:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Cek apakah user perlu upload dokumen per kelas (punya invoice paid/pending, belum lengkap per kelas).
 * Mengembalikan daftar kelas yang butuh dokumen + tipe dokumen wajib dari config admin.
 */
export async function getParticipantDocumentsStatus() {
    try {
        const user = await getSessionUser();
        if (!user) {
            return { needsUpload: false, classesNeedingDocs: [], requiredDocumentTypes: [], cvUrl: null, ijazahUrl: null, submittedAt: null };
        }

        const { getRequiredDocumentTypes } = await import('./documentTypes');
        const { types: requiredTypes } = await getRequiredDocumentTypes();
        const typeIds = requiredTypes.map(t => t.id);

        const participantRef = adminDb.collection('participants').doc(user.uid);
        const participantDoc = await participantRef.get();
        const participantData = participantDoc.exists ? participantDoc.data() : {};
        const classDocuments = participantData.classDocuments || {};
        const cvUrl = participantData.cvUrl || null;
        const ijazahUrl = participantData.ijazahUrl || null;
        const submittedAt = participantData.documentsSubmittedAt?.toDate?.()?.toISOString?.() || participantData.documentsSubmittedAt || null;

        const invoicesSnap = await adminDb.collection('invoices')
            .where('client.email', '==', user.email)
            .get();

        const serviceIdsWithInvoice = new Set();
        const serviceNames = {};
        invoicesSnap.docs.forEach(docSnap => {
            const d = docSnap.data();
            if (d.serviceId && ['paid', 'pending'].includes(d.status)) {
                serviceIdsWithInvoice.add(d.serviceId);
                if (!serviceNames[d.serviceId]) {
                    serviceNames[d.serviceId] = d.items?.[0]?.name || 'Kelas';
                }
            }
        });

        const classesNeedingDocs = [];
        for (const serviceId of serviceIdsWithInvoice) {
            const stored = classDocuments[serviceId];
            const hasAll = typeIds.every(id => stored && stored[id]);
            if (hasAll) continue;
            let documents = {};
            let docSubmittedAt = null;
            if (stored) {
                typeIds.forEach(id => { if (stored[id]) documents[id] = stored[id]; });
                if (stored.submittedAt) {
                    docSubmittedAt = stored.submittedAt?.toDate?.()?.toISOString?.() || stored.submittedAt;
                }
            }
            const serviceName = serviceNames[serviceId];
            try {
                const serviceDoc = await adminDb.collection('services').doc(serviceId).get();
                if (serviceDoc.exists && serviceDoc.data()?.name) {
                    serviceNames[serviceId] = serviceDoc.data().name;
                }
            } catch (_) {}
            classesNeedingDocs.push({
                serviceId,
                serviceName: serviceNames[serviceId] || serviceName,
                documents,
                submittedAt: docSubmittedAt,
            });
        }

        const legacySingleClass = serviceIdsWithInvoice.size === 1 && !Object.keys(classDocuments).length && cvUrl && ijazahUrl;
        if (legacySingleClass && classesNeedingDocs.length === 1) {
            classesNeedingDocs.length = 0;
        }

        const needsUpload = classesNeedingDocs.length > 0;

        return {
            needsUpload,
            classesNeedingDocs,
            requiredDocumentTypes: requiredTypes,
            cvUrl,
            ijazahUrl,
            submittedAt,
        };
    } catch (error) {
        console.error('Error getting documents status:', error);
        return { needsUpload: false, classesNeedingDocs: [], requiredDocumentTypes: [], cvUrl: null, ijazahUrl: null, submittedAt: null };
    }
}
