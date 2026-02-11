'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from './auth';
import { createInvoice } from './invoices';
import { revalidatePath } from 'next/cache';

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
 * @param {Object} [options] - { promoCode?: string }
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

        // Generate invoice number and order ID for Midtrans (only for paid classes)
        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create invoice with status 'pending' (will be updated after payment)
        const invoiceData = {
            invoiceNumber: invoiceNumber,
            orderId: orderId, // Midtrans order ID
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
            paymentMethod: 'midtrans',
        };

        const invoiceResult = await createInvoice(invoiceData);

        if (!invoiceResult.success) {
            return { success: false, error: 'Gagal membuat invoice: ' + invoiceResult.error };
        }

        // Create Midtrans payment transaction
        const { createMidtransTransaction } = await import('./midtrans');
        const paymentResult = await createMidtransTransaction({
            orderId: orderId,
            amount: servicePrice,
            installmentTerms,
            minDp,
            items: [
                {
                    id: serviceId,
                    price: servicePrice,
                    quantity: 1,
                    name: serviceData.name || 'Kelas',
                    category: serviceData.category || 'Kelas',
                }
            ],
            customer: {
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                phone: participantData.phone || '',
            },
        });

        if (!paymentResult.success) {
            // If Midtrans fails, we can fallback to simulation or show error
            console.error('Midtrans transaction creation failed:', paymentResult.error);
            return { 
                success: false, 
                error: 'Gagal membuat transaksi pembayaran: ' + (paymentResult.error || 'Unknown error') 
            };
        }

        // Update invoice with payment token
        await adminDb.collection('invoices').doc(invoiceResult.id).update({
            midtransToken: paymentResult.token,
            midtransRedirectUrl: paymentResult.redirectUrl,
        });

        // Return payment redirect URL instead of directly enrolling
        return {
            success: true,
            invoiceId: invoiceResult.id,
            invoiceNumber: invoiceNumber,
            orderId: orderId,
            paymentToken: paymentResult.token,
            redirectUrl: paymentResult.redirectUrl,
            message: 'Silakan selesaikan pembayaran untuk melanjutkan.',
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

        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
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
            paymentMethod: 'midtrans',
        };

        const invoiceResult = await createInvoice(invoiceData);
        if (!invoiceResult.success) {
            return { success: false, error: 'Gagal membuat invoice: ' + invoiceResult.error };
        }

        const { createMidtransTransaction } = await import('./midtrans');
        const paymentResult = await createMidtransTransaction({
            orderId,
            amount: totalPrice,
            installmentTerms: null,
            minDp: null,
            items: [
                {
                    id: productId,
                    price: unitPrice,
                    quantity: qty,
                    name: productData.name || 'Produk',
                    category: productData.category || 'Merchandise',
                },
            ],
            customer: {
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                phone: participantData.phone || '',
            },
        });

        if (!paymentResult.success) {
            return {
                success: false,
                error: 'Gagal membuat transaksi pembayaran: ' + (paymentResult.error || 'Unknown error'),
            };
        }

        await adminDb.collection('invoices').doc(invoiceResult.id).update({
            midtransToken: paymentResult.token,
            midtransRedirectUrl: paymentResult.redirectUrl,
        });

        return {
            success: true,
            invoiceId: invoiceResult.id,
            invoiceNumber,
            orderId,
            paymentToken: paymentResult.token,
            redirectUrl: paymentResult.redirectUrl,
            message: 'Silakan selesaikan pembayaran untuk melanjutkan.',
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
 */
export async function purchaseMembership(membershipTypeId, typeData) {
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

        const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
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
            paymentMethod: 'midtrans',
        };

        const invoiceResult = await createInvoice(invoiceData);
        if (!invoiceResult.success) return { success: false, error: 'Gagal membuat invoice: ' + invoiceResult.error };

        const { createMidtransTransaction } = await import('./midtrans');
        const paymentResult = await createMidtransTransaction({
            orderId,
            amount: price,
            installmentTerms: null,
            minDp: null,
            items: [
                { id: membershipTypeId, price, quantity: 1, name: typeData.name || 'Membership', category: 'Membership' },
            ],
            customer: {
                name: user.displayName || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                phone: participantData.phone || '',
            },
        });

        if (!paymentResult.success) {
            return { success: false, error: 'Gagal membuat transaksi: ' + (paymentResult.error || 'Unknown error') };
        }

        await adminDb.collection('invoices').doc(invoiceResult.id).update({
            midtransToken: paymentResult.token,
            midtransRedirectUrl: paymentResult.redirectUrl,
        });

        return {
            success: true,
            invoiceId: invoiceResult.id,
            invoiceNumber,
            orderId,
            paymentToken: paymentResult.token,
            redirectUrl: paymentResult.redirectUrl,
            message: 'Silakan selesaikan pembayaran untuk mengaktifkan membership.',
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
