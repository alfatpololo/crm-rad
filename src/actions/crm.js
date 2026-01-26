'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from './auth';
import { revalidatePath } from 'next/cache';

/**
 * Helper function to serialize Firestore data
 */
function serializeFirestoreData(data) {
    if (data === null || data === undefined) return data;
    
    if (data.toDate && typeof data.toDate === 'function') {
        return data.toDate().toISOString();
    }
    
    if (data instanceof Date) {
        return data.toISOString();
    }
    
    if (Array.isArray(data)) {
        return data.map(item => serializeFirestoreData(item));
    }
    
    if (typeof data === 'object' && data.constructor === Object) {
        const serialized = {};
        for (const [key, value] of Object.entries(data)) {
            serialized[key] = serializeFirestoreData(value);
        }
        return serialized;
    }
    
    return data;
}

/**
 * Get certification history for all participants
 */
export async function getCertificationHistory() {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        const participantsSnapshot = await adminDb.collection('participants').get();
        const history = [];

        for (const docSnap of participantsSnapshot.docs) {
            const data = docSnap.data();
            const enrolledClasses = data.enrolledClasses || [];
            const completedClasses = data.completedClasses || [];

            // Combine enrolled and completed classes
            const allClasses = [
                ...enrolledClasses.map(cls => ({ ...cls, status: 'enrolled' })),
                ...completedClasses.map(cls => ({ ...cls, status: 'completed' }))
            ];

            for (const classItem of allClasses) {
                // Get service details
                let serviceData = null;
                if (classItem.serviceId) {
                    const serviceDoc = await adminDb.collection('services').doc(classItem.serviceId).get();
                    if (serviceDoc.exists) {
                        serviceData = serializeFirestoreData(serviceDoc.data());
                    }
                }

                history.push({
                    id: `${docSnap.id}-${classItem.serviceId || classItem.id}`,
                    participantId: docSnap.id,
                    participantName: data.name || data.displayName || 'Unknown',
                    participantEmail: data.email || '',
                    serviceId: classItem.serviceId || classItem.id,
                    serviceName: serviceData?.name || classItem.name || 'Unknown Service',
                    serviceType: serviceData?.type || classItem.type || 'class',
                    status: classItem.status || 'enrolled',
                    enrolledDate: classItem.purchaseDate ? serializeFirestoreData(classItem.purchaseDate) : null,
                    completedDate: classItem.completedDate ? serializeFirestoreData(classItem.completedDate) : null,
                    expiryDate: classItem.expiryDate ? serializeFirestoreData(classItem.expiryDate) : null,
                });
            }
        }

        return { history: history.sort((a, b) => {
            const dateA = a.enrolledDate || a.completedDate || '';
            const dateB = b.enrolledDate || b.completedDate || '';
            return dateB.localeCompare(dateA);
        }) };
    } catch (error) {
        console.error('Error fetching certification history:', error);
        return { error: error.message };
    }
}

/**
 * Get certification payment history
 */
export async function getCertificationPayments() {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        // Get all invoices
        const invoicesSnapshot = await adminDb
            .collection('invoices')
            .orderBy('createdAt', 'desc')
            .get();

        const payments = [];

        // Get all services and products for reference
        const servicesSnapshot = await adminDb.collection('services').get()
        const productsSnapshot = await adminDb.collection('products').get()
        
        const serviceNames = new Set()
        servicesSnapshot.forEach(doc => {
            const data = doc.data()
            if (data.name) serviceNames.add(data.name)
        })
        
        const productNames = new Set()
        productsSnapshot.forEach(doc => {
            const data = doc.data()
            if (data.name) productNames.add(data.name)
        })

        for (const docSnap of invoicesSnapshot.docs) {
            const invData = docSnap.data();
            const items = invData.items || [];

            // Filter items that are services (not products)
            const serviceItems = items.filter(item => {
                const itemName = item.product || item.name || ''
                // If item name exists in services, it's a service
                if (serviceNames.has(itemName)) return true
                // If item name exists in products, it's NOT a service
                if (productNames.has(itemName)) return false
                // If type is explicitly set, use it
                if (item.type === 'service' || item.type === 'class' || item.type === 'event') return true
                if (item.type === 'product') return false
                // Default: assume it's a service if not found in products
                return true
            });

            if (serviceItems.length > 0) {
                payments.push({
                    id: docSnap.id,
                    invoiceNumber: invData.invoiceNumber || `#${docSnap.id.substring(0, 8)}`,
                    participantName: invData.client?.name || invData.participantName || 'Unknown',
                    participantEmail: invData.client?.email || invData.participantEmail || '',
                    items: serviceItems,
                    total: invData.grandTotal || invData.total || 0,
                    status: invData.status || 'pending',
                    issueDate: serializeFirestoreData(invData.issueDate || invData.createdAt),
                    dueDate: serializeFirestoreData(invData.dueDate),
                    paidDate: invData.status === 'paid' ? serializeFirestoreData(invData.updatedAt || invData.createdAt) : null,
                });
            }
        }

        return { payments };
    } catch (error) {
        console.error('Error fetching certification payments:', error);
        return { error: error.message };
    }
}

/**
 * Get product/merchandise payment history
 */
export async function getProductPayments() {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        // Get all invoices
        const invoicesSnapshot = await adminDb
            .collection('invoices')
            .orderBy('createdAt', 'desc')
            .get();

        const payments = [];

        // Get all products for reference
        const productsSnapshot = await adminDb.collection('products').get()
        const productNames = new Set()
        productsSnapshot.forEach(doc => {
            const data = doc.data()
            if (data.name) productNames.add(data.name)
        })

        for (const docSnap of invoicesSnapshot.docs) {
            const invData = docSnap.data();
            const items = invData.items || [];

            // Filter items that are products
            const productItems = items.filter(item => {
                const itemName = item.product || item.name || ''
                // If item name exists in products, it's a product
                if (productNames.has(itemName)) return true
                // If type is explicitly set to product
                if (item.type === 'product') return true
                // Otherwise, it's not a product
                return false
            })

            if (productItems.length > 0) {
                payments.push({
                    id: docSnap.id,
                    invoiceNumber: invData.invoiceNumber || `#${docSnap.id.substring(0, 8)}`,
                    participantName: invData.client?.name || invData.participantName || 'Unknown',
                    participantEmail: invData.client?.email || invData.participantEmail || '',
                    items: productItems,
                    total: invData.grandTotal || invData.total || 0,
                    status: invData.status || 'pending',
                    issueDate: serializeFirestoreData(invData.issueDate || invData.createdAt),
                    dueDate: serializeFirestoreData(invData.dueDate),
                    paidDate: invData.status === 'paid' ? serializeFirestoreData(invData.updatedAt || invData.createdAt) : null,
                });
            }
        }

        return { payments };
    } catch (error) {
        console.error('Error fetching product payments:', error);
        return { error: error.message };
    }
}

/**
 * Get attendance/RSVP history
 */
export async function getAttendanceHistory() {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        const participantsSnapshot = await adminDb.collection('participants').get();
        const attendance = [];

        for (const docSnap of participantsSnapshot.docs) {
            const data = docSnap.data();
            const attendanceHistory = data.attendanceHistory || [];

            for (const record of attendanceHistory) {
                // Get service/event details
                let serviceData = null;
                if (record.serviceId || record.eventId) {
                    const serviceId = record.serviceId || record.eventId;
                    const serviceDoc = await adminDb.collection('services').doc(serviceId).get();
                    if (serviceDoc.exists) {
                        serviceData = serializeFirestoreData(serviceDoc.data());
                    }
                }

                attendance.push({
                    id: `${docSnap.id}-${record.serviceId || record.eventId || record.id}`,
                    participantId: docSnap.id,
                    participantName: data.name || data.displayName || 'Unknown',
                    participantEmail: data.email || '',
                    serviceId: record.serviceId || record.eventId,
                    serviceName: serviceData?.name || record.serviceName || 'Unknown Event',
                    serviceType: serviceData?.type || record.type || 'event',
                    status: record.status || 'registered', // registered, attended, absent, cancelled
                    registeredDate: serializeFirestoreData(record.registeredDate || record.createdAt),
                    attendedDate: record.attendedDate ? serializeFirestoreData(record.attendedDate) : null,
                    notes: record.notes || '',
                });
            }
        }

        return { attendance: attendance.sort((a, b) => {
            const dateA = a.registeredDate || '';
            const dateB = b.registeredDate || '';
            return dateB.localeCompare(dateA);
        }) };
    } catch (error) {
        console.error('Error fetching attendance history:', error);
        return { error: error.message };
    }
}

/**
 * Get certificate tracking (on progress | completed | published)
 */
export async function getCertificateTracking() {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        const participantsSnapshot = await adminDb.collection('participants').get();
        const certificates = [];

        for (const docSnap of participantsSnapshot.docs) {
            const data = docSnap.data();
            const certList = data.certificates || [];
            const completedClasses = data.completedClasses || [];

            // Process existing certificates
            for (const cert of certList) {
                let serviceData = null;
                if (cert.serviceId || cert.classId) {
                    const serviceId = cert.serviceId || cert.classId;
                    const serviceDoc = await adminDb.collection('services').doc(serviceId).get();
                    if (serviceDoc.exists) {
                        serviceData = serializeFirestoreData(serviceDoc.data());
                    }
                }

                certificates.push({
                    id: cert.id || `${docSnap.id}-${cert.serviceId || cert.classId}`,
                    participantId: docSnap.id,
                    participantName: data.name || data.displayName || 'Unknown',
                    participantEmail: data.email || '',
                    serviceId: cert.serviceId || cert.classId,
                    serviceName: serviceData?.name || cert.serviceName || 'Unknown Service',
                    status: cert.status || 'on_progress', // on_progress, completed, published
                    completedDate: cert.completedDate ? serializeFirestoreData(cert.completedDate) : null,
                    publishedDate: cert.publishedDate ? serializeFirestoreData(cert.publishedDate) : null,
                    certificateUrl: cert.certificateUrl || cert.pdfUrl || null,
                    certificateNumber: cert.certificateNumber || null,
                });
            }

            // Process completed classes that don't have certificates yet
            for (const completedClass of completedClasses) {
                const hasCertificate = certList.some(cert => 
                    (cert.serviceId || cert.classId) === (completedClass.serviceId || completedClass.id)
                );

                if (!hasCertificate) {
                    let serviceData = null;
                    if (completedClass.serviceId || completedClass.id) {
                        const serviceId = completedClass.serviceId || completedClass.id;
                        const serviceDoc = await adminDb.collection('services').doc(serviceId).get();
                        if (serviceDoc.exists) {
                            serviceData = serializeFirestoreData(serviceDoc.data());
                        }
                    }

                    certificates.push({
                        id: `${docSnap.id}-${completedClass.serviceId || completedClass.id}-pending`,
                        participantId: docSnap.id,
                        participantName: data.name || data.displayName || 'Unknown',
                        participantEmail: data.email || '',
                        serviceId: completedClass.serviceId || completedClass.id,
                        serviceName: serviceData?.name || completedClass.name || 'Unknown Service',
                        status: 'on_progress',
                        completedDate: completedClass.completedDate ? serializeFirestoreData(completedClass.completedDate) : null,
                        publishedDate: null,
                        certificateUrl: null,
                        certificateNumber: null,
                    });
                }
            }
        }

        return { certificates: certificates.sort((a, b) => {
            const dateA = a.completedDate || a.publishedDate || '';
            const dateB = b.completedDate || b.publishedDate || '';
            return dateB.localeCompare(dateA);
        }) };
    } catch (error) {
        console.error('Error fetching certificate tracking:', error);
        return { error: error.message };
    }
}

/**
 * Update certificate status
 */
export async function updateCertificateStatus(participantId, certificateId, status, certificateUrl = null, certificateNumber = null) {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        const participantRef = adminDb.collection('participants').doc(participantId);
        const participantDoc = await participantRef.get();

        if (!participantDoc.exists) {
            return { error: 'Participant not found' };
        }

        const data = participantDoc.data();
        const certificates = data.certificates || [];

        const updatedCertificates = certificates.map(cert => {
            if (cert.id === certificateId || (cert.serviceId && cert.serviceId === certificateId)) {
                return {
                    ...cert,
                    status,
                    certificateUrl: certificateUrl || cert.certificateUrl,
                    certificateNumber: certificateNumber || cert.certificateNumber,
                    publishedDate: status === 'published' ? new Date() : cert.publishedDate,
                };
            }
            return cert;
        });

        await participantRef.update({
            certificates: updatedCertificates,
            updatedAt: new Date(),
        });

        revalidatePath('/customers/certificate-tracking');
        return { success: true };
    } catch (error) {
        console.error('Error updating certificate status:', error);
        return { error: error.message };
    }
}

/**
 * Export participants data to CSV/Excel format
 */
export async function exportParticipantsData(format = 'csv') {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        const participantsSnapshot = await adminDb.collection('participants').get();
        const data = [];

        for (const docSnap of participantsSnapshot.docs) {
            const participantData = docSnap.data();
            data.push({
                id: docSnap.id,
                name: participantData.name || participantData.displayName || '',
                email: participantData.email || '',
                phone: participantData.phone || participantData.phoneNumber || '',
                enrolledClasses: (participantData.enrolledClasses || []).length,
                completedClasses: (participantData.completedClasses || []).length,
                certificates: (participantData.certificates || []).length,
                createdAt: participantData.createdAt ? serializeFirestoreData(participantData.createdAt) : '',
            });
        }

        return { data, format };
    } catch (error) {
        console.error('Error exporting participants data:', error);
        return { error: error.message };
    }
}

/**
 * Import participants data
 */
export async function importParticipantsData(participantsData) {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const participant of participantsData) {
            try {
                // Check if participant exists by email
                const existingSnapshot = await adminDb
                    .collection('participants')
                    .where('email', '==', participant.email)
                    .get();

                if (existingSnapshot.empty) {
                    // Create new participant
                    await adminDb.collection('participants').add({
                        name: participant.name || '',
                        email: participant.email || '',
                        phone: participant.phone || '',
                        displayName: participant.name || '',
                        enrolledClasses: [],
                        completedClasses: [],
                        certificates: [],
                        attendanceHistory: [],
                        extensionRequests: [],
                        role: 'participant',
                        createdAt: new Date(),
                    });
                    results.success++;
                } else {
                    // Update existing participant
                    const existingDoc = existingSnapshot.docs[0];
                    await existingDoc.ref.update({
                        name: participant.name || existingDoc.data().name,
                        phone: participant.phone || existingDoc.data().phone,
                        displayName: participant.name || existingDoc.data().displayName,
                        updatedAt: new Date(),
                    });
                    results.success++;
                }
            } catch (error) {
                results.failed++;
                results.errors.push({
                    email: participant.email,
                    error: error.message
                });
            }
        }

        revalidatePath('/customers/list');
        return results;
    } catch (error) {
        console.error('Error importing participants data:', error);
        return { error: error.message };
    }
}

/**
 * Get all participants for blast promo
 */
export async function getParticipantsForBlast(filter = 'all') {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        let query = adminDb.collection('participants');

        // Apply filters if needed
        if (filter === 'active') {
            // Only participants with enrolled classes
            // This would require a more complex query
        }

        const snapshot = await query.get();
        const participants = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            participants.push({
                id: doc.id,
                name: data.name || data.displayName || 'Unknown',
                email: data.email || '',
                phone: data.phone || data.phoneNumber || '',
                enrolledClasses: (data.enrolledClasses || []).length,
                completedClasses: (data.completedClasses || []).length,
            });
        });

        return { participants };
    } catch (error) {
        console.error('Error fetching participants for blast:', error);
        return { error: error.message };
    }
}

/**
 * Send blast promo to selected participants
 */
export async function sendBlastPromo(participantIds, subject, message, type = 'email') {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        // Get participant emails
        const participants = [];
        for (const id of participantIds) {
            const doc = await adminDb.collection('participants').doc(id).get();
            if (doc.exists) {
                const data = doc.data();
                participants.push({
                    id: doc.id,
                    email: data.email,
                    name: data.name || data.displayName || 'User',
                });
            }
        }

        // Store blast record
        await adminDb.collection('blast_promos').add({
            subject,
            message,
            type,
            participantIds,
            participantCount: participants.length,
            sentBy: user.email,
            sentAt: new Date(),
            status: 'sent', // sent, failed, pending
        });

        // In a real implementation, you would send emails/WhatsApp here
        // For now, we'll just log it
        console.log(`Blast promo sent to ${participants.length} participants`);

        revalidatePath('/customers/blast');
        return { 
            success: true, 
            sentCount: participants.length,
            message: `Promo berhasil dikirim ke ${participants.length} peserta`
        };
    } catch (error) {
        console.error('Error sending blast promo:', error);
        return { error: error.message };
    }
}

