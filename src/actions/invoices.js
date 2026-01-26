'use server';

import { adminDb } from '@/lib/firebase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Helper function to serialize Firestore data (convert Date/Timestamp to ISO strings)
 */
function serializeFirestoreData(data) {
    if (data === null || data === undefined) return data;
    
    // Handle Firestore Timestamp
    if (data.toDate && typeof data.toDate === 'function') {
        return data.toDate().toISOString();
    }
    
    // Handle JavaScript Date
    if (data instanceof Date) {
        return data.toISOString();
    }
    
    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => serializeFirestoreData(item));
    }
    
    // Handle objects (but not Date or Timestamp)
    if (typeof data === 'object' && data.constructor === Object) {
        const serialized = {};
        for (const [key, value] of Object.entries(data)) {
            serialized[key] = serializeFirestoreData(value);
        }
        return serialized;
    }
    
    // Primitive values (string, number, boolean, etc.)
    return data;
}

/**
 * Fetch all invoices.
 */
export async function getInvoices() {
    try {
        if (!adminDb) return [];

        const snapshot = await adminDb.collection('invoices').orderBy('createdAt', 'desc').get();

        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...serializeFirestoreData(data)
            };
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return [];
    }
}

/**
 * Create a new invoice.
 */
export async function createInvoice(data) {
    try {
        if (!adminDb) throw new Error("Database not initialized");

        // Helper function to remove undefined values (Firestore doesn't accept undefined)
        // But keep null values for optional fields like logoUrl and signatureUrl
        const removeUndefined = (obj) => {
            const cleaned = {};
            Object.keys(obj).forEach(key => {
                if (obj[key] !== undefined) {
                    // Keep null values for optional fields
                    cleaned[key] = obj[key];
                }
            });
            return cleaned;
        };

        const newDoc = removeUndefined({
            ...data,
            status: data.status || 'pending',
            createdAt: new Date(),
        });

        // Log for debugging
        console.log('Creating invoice with data:', {
            logoUrl: newDoc.logoUrl,
            signatureUrl: newDoc.signatureUrl,
            signatureText: newDoc.signatureText
        });

        const res = await adminDb.collection('invoices').add(newDoc);
        revalidatePath('/payment');
        revalidatePath('/payment/list');
        return { success: true, id: res.id };
    } catch (error) {
        console.error('Error creating invoice:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get a single invoice by ID.
 */
export async function getInvoice(id) {
    try {
        if (!adminDb) return null;
        const doc = await adminDb.collection('invoices').doc(id).get();
        if (!doc.exists) return null;
        const data = doc.data();
        return {
            id: doc.id,
            ...serializeFirestoreData(data)
        };
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return null;
    }
}

/**
 * Update an invoice.
 */
export async function updateInvoice(id, data) {
    try {
        if (!adminDb) throw new Error("Database not initialized");
        if (!id) throw new Error("Invoice ID is required");

        const removeUndefined = (obj) => {
            const cleaned = {};
            Object.keys(obj).forEach(key => {
                if (obj[key] !== undefined) {
                    cleaned[key] = obj[key];
                }
            });
            return cleaned;
        };

        const updateDoc = removeUndefined({
            ...data,
            updatedAt: new Date(),
        });

        // Log for debugging
        console.log('Updating invoice with data:', {
            id,
            logoUrl: updateDoc.logoUrl,
            signatureUrl: updateDoc.signatureUrl,
            signatureText: updateDoc.signatureText
        });

        await adminDb.collection('invoices').doc(id).update(updateDoc);
        revalidatePath('/payment');
        revalidatePath('/payment/list');
        return { success: true };
    } catch (error) {
        console.error('Error updating invoice:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete an invoice.
 */
export async function deleteInvoice(id) {
    try {
        if (!adminDb) throw new Error("Database not initialized");
        if (!id) throw new Error("Invoice ID is required");

        await adminDb.collection('invoices').doc(id).delete();
        revalidatePath('/payment');
        revalidatePath('/payment/list');
        return { success: true };
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return { success: false, error: error.message };
    }
}
