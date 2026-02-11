'use server';

import { adminDb } from '@/lib/firebase/admin';
import { revalidatePath } from 'next/cache';

// --- Services ---

export async function getServices() {
    try {
        if (!adminDb) return [];
        const snapshot = await adminDb.collection('services').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            // Convert Firestore Timestamps and Date objects to ISO strings for serialization
            const serialized = {
                id: doc.id,
                ...data,
            };
            
            // Convert Date/Timestamp fields to ISO strings
            if (data.startDate) {
                serialized.startDate = data.startDate?.toDate ? data.startDate.toDate().toISOString() : 
                                      (data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate);
            }
            if (data.endDate) {
                serialized.endDate = data.endDate?.toDate ? data.endDate.toDate().toISOString() : 
                                      (data.endDate instanceof Date ? data.endDate.toISOString() : data.endDate);
            }
            if (data.createdAt) {
                serialized.createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : 
                                       (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt);
            }
            if (data.updatedAt) {
                serialized.updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : 
                                       (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt);
            }
            if (Array.isArray(data.priceTiers)) {
                serialized.priceTiers = data.priceTiers.map(tier => ({
                    ...tier,
                    startDate: tier.startDate?.toDate ? tier.startDate.toDate().toISOString().split('T')[0] : (tier.startDate instanceof Date ? tier.startDate.toISOString().split('T')[0] : tier.startDate),
                    endDate: tier.endDate?.toDate ? tier.endDate.toDate().toISOString().split('T')[0] : (tier.endDate instanceof Date ? tier.endDate.toISOString().split('T')[0] : tier.endDate),
                }));
            }
            return serialized;
        });
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

export async function createService(data) {
    try {
        if (!adminDb) {
            console.error('Database not initialized');
            throw new Error("Database not initialized");
        }
        
        if (!data.name) {
            return { success: false, error: 'Nama kelas/event harus diisi' };
        }
        const parseInstallmentTerms = (v) => {
            if (Array.isArray(v)) return v.filter(n => Number.isInteger(n) && n >= 2).sort((a, b) => a - b);
            if (typeof v === 'string') return v.split(/[,;\s]+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n) && n >= 2).sort((a, b) => a - b);
            return [];
        };
        const hasPriceTiers = Array.isArray(data.priceTiers) && data.priceTiers.length > 0;
        if (hasPriceTiers) {
            for (let i = 0; i < data.priceTiers.length; i++) {
                const t = data.priceTiers[i];
                if (!t.label) return { success: false, error: `Tier ${i + 1}: label harus diisi` };
                const p = parseFloat(t.price);
                if (isNaN(p) || p < 0) return { success: false, error: `Tier ${i + 1}: harga harus angka >= 0` };
            }
        } else {
            if (!data.isFree && (!data.price || parseFloat(data.price) <= 0)) {
                return { success: false, error: 'Harga harus diisi dan lebih dari 0 (atau gunakan tier harga)' };
            }
            if (data.isFree) data.price = 0;
        }
        const newDoc = {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        if (hasPriceTiers) {
            newDoc.priceTiers = data.priceTiers.map(t => ({
                label: t.label,
                price: parseFloat(t.price),
                minDp: t.minDp != null && t.minDp !== '' ? parseFloat(t.minDp) : null,
                installmentTerms: parseInstallmentTerms(t.installmentTerms).length ? parseInstallmentTerms(t.installmentTerms) : [3, 4, 6, 12],
            }));
            newDoc.price = newDoc.priceTiers[0]?.price ?? 0;
            newDoc.isFree = newDoc.price === 0;
        } else {
            newDoc.installmentTerms = parseInstallmentTerms(data.installmentTerms).length ? parseInstallmentTerms(data.installmentTerms) : [3, 4, 6, 12];
            newDoc.minDp = data.minDp != null && data.minDp !== '' ? parseFloat(data.minDp) : null;
        }
        if (data.promo && data.promo.enabled) {
            const pr = data.promo;
            newDoc.promo = {
                enabled: true,
                type: pr.type === 'percent' ? 'percent' : 'fixed',
                value: parseFloat(pr.value) || 0,
                code: (pr.code && String(pr.code).trim()) ? String(pr.code).trim() : null,
                label: (pr.label && String(pr.label).trim()) ? String(pr.label).trim() : null,
                startDate: pr.startDate ? new Date(pr.startDate) : null,
                endDate: pr.endDate ? new Date(pr.endDate) : null,
            };
        } else {
            newDoc.promo = { enabled: false };
        }
        Object.keys(newDoc).forEach(key => {
            if (key === 'imageUrl') {
                if (newDoc[key] === '') delete newDoc[key];
            } else if (key === 'priceTiers' || key === 'promo') { /* keep */ }
            else if (newDoc[key] === null || newDoc[key] === '') {
                delete newDoc[key];
            }
        });
        console.log('Creating service with data:', newDoc);
        
        const docRef = await adminDb.collection('services').add(newDoc);
        console.log('Service created with ID:', docRef.id);
        
        revalidatePath('/master-data/services');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating service:', error);
        return { success: false, error: error.message || 'Gagal menyimpan data' };
    }
}

export async function getService(id) {
    try {
        if (!adminDb) return null;
        const doc = await adminDb.collection('services').doc(id).get();
        if (!doc.exists) return null;
        const data = doc.data();
        const serialized = {
            id: doc.id,
            ...data,
        };
        
        // Convert Date/Timestamp fields to ISO strings
        if (data.startDate) {
            serialized.startDate = data.startDate?.toDate ? data.startDate.toDate().toISOString().split('T')[0] : 
                                  (data.startDate instanceof Date ? data.startDate.toISOString().split('T')[0] : data.startDate);
        }
        if (data.endDate) {
            serialized.endDate = data.endDate?.toDate ? data.endDate.toDate().toISOString().split('T')[0] : 
                                (data.endDate instanceof Date ? data.endDate.toISOString().split('T')[0] : data.endDate);
        }
        if (data.createdAt) {
            serialized.createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : 
                                   (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt);
        }
        if (data.updatedAt) {
            serialized.updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : 
                                   (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt);
        }
        if (Array.isArray(data.priceTiers)) {
            serialized.priceTiers = data.priceTiers.map(tier => ({
                ...tier,
                startDate: tier.startDate?.toDate ? tier.startDate.toDate().toISOString().split('T')[0] : (tier.startDate instanceof Date ? tier.startDate.toISOString().split('T')[0] : tier.startDate),
                endDate: tier.endDate?.toDate ? tier.endDate.toDate().toISOString().split('T')[0] : (tier.endDate instanceof Date ? tier.endDate.toISOString().split('T')[0] : tier.endDate),
            }));
        }
        if (data.promo && typeof data.promo === 'object') {
            const pr = data.promo;
            serialized.promo = {
                ...pr,
                startDate: pr.startDate?.toDate ? pr.startDate.toDate().toISOString().split('T')[0] : (pr.startDate instanceof Date ? pr.startDate.toISOString().split('T')[0] : pr.startDate),
                endDate: pr.endDate?.toDate ? pr.endDate.toDate().toISOString().split('T')[0] : (pr.endDate instanceof Date ? pr.endDate.toISOString().split('T')[0] : pr.endDate),
            };
        }
        return serialized;
    } catch (error) {
        console.error('Error fetching service:', error);
        return null;
    }
}

export async function updateService(id, data) {
    try {
        if (!adminDb) {
            console.error('Database not initialized');
            throw new Error("Database not initialized");
        }
        
        if (!id) {
            return { success: false, error: 'ID service tidak ditemukan' };
        }
        if (!data.name) {
            return { success: false, error: 'Nama kelas/event harus diisi' };
        }

        const parseInstallmentTerms = (v) => {
            if (Array.isArray(v)) return v.filter(n => Number.isInteger(n) && n >= 2).sort((a, b) => a - b);
            if (typeof v === 'string') return v.split(/[,;\s]+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n) && n >= 2).sort((a, b) => a - b);
            return [];
        };
        const hasPriceTiers = Array.isArray(data.priceTiers) && data.priceTiers.length > 0;
        if (hasPriceTiers) {
            for (let i = 0; i < data.priceTiers.length; i++) {
                const t = data.priceTiers[i];
                if (!t.label) return { success: false, error: `Tier ${i + 1}: label harus diisi` };
                const p = parseFloat(t.price);
                if (isNaN(p) || p < 0) return { success: false, error: `Tier ${i + 1}: harga tidak valid` };
            }
        } else {
            if (!data.isFree && (!data.price || parseFloat(data.price) <= 0)) {
                return { success: false, error: 'Harga harus diisi dan lebih dari 0 (atau gunakan tier harga)' };
            }
            if (data.isFree) data.price = 0;
        }
        const updateDoc = {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            updatedAt: new Date(),
        };
        if (hasPriceTiers) {
            updateDoc.priceTiers = data.priceTiers.map(t => ({
                label: t.label,
                price: parseFloat(t.price),
                minDp: t.minDp != null && t.minDp !== '' ? parseFloat(t.minDp) : null,
                installmentTerms: parseInstallmentTerms(t.installmentTerms).length ? parseInstallmentTerms(t.installmentTerms) : [3, 4, 6, 12],
            }));
            updateDoc.price = updateDoc.priceTiers[0]?.price ?? 0;
            updateDoc.isFree = updateDoc.price === 0;
        } else {
            updateDoc.priceTiers = [];
            updateDoc.installmentTerms = parseInstallmentTerms(data.installmentTerms).length ? parseInstallmentTerms(data.installmentTerms) : [3, 4, 6, 12];
            updateDoc.minDp = data.minDp != null && data.minDp !== '' ? parseFloat(data.minDp) : null;
        }
        if (data.promo && data.promo.enabled) {
            const pr = data.promo;
            updateDoc.promo = {
                enabled: true,
                type: pr.type === 'percent' ? 'percent' : 'fixed',
                value: parseFloat(pr.value) || 0,
                code: (pr.code && String(pr.code).trim()) ? String(pr.code).trim() : null,
                label: (pr.label && String(pr.label).trim()) ? String(pr.label).trim() : null,
                startDate: pr.startDate ? new Date(pr.startDate) : null,
                endDate: pr.endDate ? new Date(pr.endDate) : null,
            };
        } else {
            updateDoc.promo = { enabled: false };
        }
        
        Object.keys(updateDoc).forEach(key => {
            if (key === 'imageUrl') {
                if (updateDoc[key] === '') delete updateDoc[key];
            } else if (key === 'priceTiers' || key === 'promo') { /* keep */ }
            else if (updateDoc[key] === null || updateDoc[key] === '') {
                delete updateDoc[key];
            }
        });
        
        console.log('Updating service with data:', updateDoc);
        
        await adminDb.collection('services').doc(id).update(updateDoc);
        console.log('Service updated successfully');
        
        revalidatePath('/master-data/services');
        return { success: true };
    } catch (error) {
        console.error('Error updating service:', error);
        return { success: false, error: error.message || 'Gagal mengupdate data' };
    }
}

export async function deleteService(id) {
    try {
        if (!adminDb) {
            console.error('Database not initialized');
            throw new Error("Database not initialized");
        }
        
        if (!id) {
            return { success: false, error: 'ID service tidak ditemukan' };
        }
        
        console.log('Deleting service with ID:', id);
        
        await adminDb.collection('services').doc(id).delete();
        console.log('Service deleted successfully');
        
        revalidatePath('/master-data/services');
        return { success: true };
    } catch (error) {
        console.error('Error deleting service:', error);
        return { success: false, error: error.message || 'Gagal menghapus data' };
    }
}

// --- Categories ---

export async function getCategories() {
    try {
        if (!adminDb) return [];
        const snapshot = await adminDb.collection('categories').orderBy('name', 'asc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const serialized = {
                id: doc.id,
                ...data,
            };
            
            if (data.createdAt) {
                serialized.createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : 
                                       (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt);
            }
            if (data.updatedAt) {
                serialized.updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : 
                                       (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt);
            }
            
            return serialized;
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export async function getCategory(id) {
    try {
        if (!adminDb) return null;
        const doc = await adminDb.collection('categories').doc(id).get();
        if (!doc.exists) return null;
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : 
                       (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : 
                       (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt),
        };
    } catch (error) {
        console.error('Error fetching category:', error);
        return null;
    }
}

export async function createCategory(data) {
    try {
        if (!adminDb) {
            console.error('Database not initialized');
            throw new Error("Database not initialized");
        }
        
        if (!data.name || !data.name.trim()) {
            return { success: false, error: 'Nama kategori harus diisi' };
        }
        
        // Check if category name already exists
        const existingCategories = await adminDb.collection('categories')
            .where('name', '==', data.name.trim())
            .get();
        
        if (!existingCategories.empty) {
            return { success: false, error: 'Nama kategori sudah ada' };
        }
        
        const newDoc = {
            name: data.name.trim(),
            description: data.description?.trim() || '',
            status: data.status || 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        
        const docRef = await adminDb.collection('categories').add(newDoc);
        console.log('Category created with ID:', docRef.id);
        
        revalidatePath('/master-data/categories');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating category:', error);
        return { success: false, error: error.message || 'Gagal menyimpan data' };
    }
}

export async function updateCategory(id, data) {
    try {
        if (!adminDb) {
            console.error('Database not initialized');
            throw new Error("Database not initialized");
        }
        
        if (!id) {
            return { success: false, error: 'ID kategori tidak ditemukan' };
        }
        
        if (!data.name || !data.name.trim()) {
            return { success: false, error: 'Nama kategori harus diisi' };
        }
        
        // Check if category name already exists (excluding current category)
        const existingCategories = await adminDb.collection('categories')
            .where('name', '==', data.name.trim())
            .get();
        
        const nameExists = existingCategories.docs.some(doc => doc.id !== id);
        if (nameExists) {
            return { success: false, error: 'Nama kategori sudah ada' };
        }
        
        const updateDoc = {
            name: data.name.trim(),
            description: data.description?.trim() || '',
            status: data.status || 'active',
            updatedAt: new Date(),
        };
        
        await adminDb.collection('categories').doc(id).update(updateDoc);
        console.log('Category updated successfully');
        
        revalidatePath('/master-data/categories');
        return { success: true };
    } catch (error) {
        console.error('Error updating category:', error);
        return { success: false, error: error.message || 'Gagal mengupdate data' };
    }
}

export async function deleteCategory(id) {
    try {
        if (!adminDb) {
            console.error('Database not initialized');
            throw new Error("Database not initialized");
        }
        
        if (!id) {
            return { success: false, error: 'ID kategori tidak ditemukan' };
        }
        
        // Check if category is used in services
        const servicesUsingCategory = await adminDb.collection('services')
            .where('category', '==', (await adminDb.collection('categories').doc(id).get()).data()?.name)
            .limit(1)
            .get();
        
        if (!servicesUsingCategory.empty) {
            return { success: false, error: 'Kategori sedang digunakan oleh kelas/event. Tidak dapat dihapus.' };
        }
        
        await adminDb.collection('categories').doc(id).delete();
        console.log('Category deleted successfully');
        
        revalidatePath('/master-data/categories');
        return { success: true };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { success: false, error: error.message || 'Gagal menghapus data' };
    }
}

// --- Service Types ---

export async function getServiceTypes() {
    try {
        if (!adminDb) return [];
        const snapshot = await adminDb.collection('serviceTypes').orderBy('name', 'asc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const serialized = {
                id: doc.id,
                ...data,
            };
            
            if (data.createdAt) {
                serialized.createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : 
                                       (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt);
            }
            if (data.updatedAt) {
                serialized.updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : 
                                       (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt);
            }
            
            return serialized;
        });
    } catch (error) {
        console.error('Error fetching service types:', error);
        return [];
    }
}

export async function getServiceType(id) {
    try {
        if (!adminDb) return null;
        const doc = await adminDb.collection('serviceTypes').doc(id).get();
        if (!doc.exists) return null;
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : 
                       (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : 
                       (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt),
        };
    } catch (error) {
        console.error('Error fetching service type:', error);
        return null;
    }
}

export async function createServiceType(data) {
    try {
        if (!adminDb) {
            console.error('Database not initialized');
            throw new Error("Database not initialized");
        }
        
        if (!data.name || !data.name.trim()) {
            return { success: false, error: 'Nama jenis layanan harus diisi' };
        }
        
        if (!data.code || !data.code.trim()) {
            return { success: false, error: 'Kode jenis layanan harus diisi' };
        }
        
        // Check if service type code already exists
        const existingTypes = await adminDb.collection('serviceTypes')
            .where('code', '==', data.code.trim().toLowerCase())
            .get();
        
        if (!existingTypes.empty) {
            return { success: false, error: 'Kode jenis layanan sudah ada' };
        }
        
        const newDoc = {
            name: data.name.trim(),
            code: data.code.trim().toLowerCase(),
            description: data.description?.trim() || '',
            status: data.status || 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        
        const docRef = await adminDb.collection('serviceTypes').add(newDoc);
        console.log('Service type created with ID:', docRef.id);
        
        revalidatePath('/master-data/service-types');
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating service type:', error);
        return { success: false, error: error.message || 'Gagal menyimpan data' };
    }
}

export async function updateServiceType(id, data) {
    try {
        if (!adminDb) {
            console.error('Database not initialized');
            throw new Error("Database not initialized");
        }
        
        if (!id) {
            return { success: false, error: 'ID jenis layanan tidak ditemukan' };
        }
        
        if (!data.name || !data.name.trim()) {
            return { success: false, error: 'Nama jenis layanan harus diisi' };
        }
        
        if (!data.code || !data.code.trim()) {
            return { success: false, error: 'Kode jenis layanan harus diisi' };
        }
        
        // Check if service type code already exists (excluding current type)
        const existingTypes = await adminDb.collection('serviceTypes')
            .where('code', '==', data.code.trim().toLowerCase())
            .get();
        
        const codeExists = existingTypes.docs.some(doc => doc.id !== id);
        if (codeExists) {
            return { success: false, error: 'Kode jenis layanan sudah ada' };
        }
        
        const updateDoc = {
            name: data.name.trim(),
            code: data.code.trim().toLowerCase(),
            description: data.description?.trim() || '',
            status: data.status || 'active',
            updatedAt: new Date(),
        };
        
        await adminDb.collection('serviceTypes').doc(id).update(updateDoc);
        console.log('Service type updated successfully');
        
        revalidatePath('/master-data/service-types');
        return { success: true };
    } catch (error) {
        console.error('Error updating service type:', error);
        return { success: false, error: error.message || 'Gagal mengupdate data' };
    }
}

export async function deleteServiceType(id) {
    try {
        if (!adminDb) {
            console.error('Database not initialized');
            throw new Error("Database not initialized");
        }
        
        if (!id) {
            return { success: false, error: 'ID jenis layanan tidak ditemukan' };
        }
        
        // Get service type code
        const serviceTypeDoc = await adminDb.collection('serviceTypes').doc(id).get();
        if (!serviceTypeDoc.exists) {
            return { success: false, error: 'Jenis layanan tidak ditemukan' };
        }
        
        const serviceTypeCode = serviceTypeDoc.data()?.code;
        
        // Check if service type is used in services
        const servicesUsingType = await adminDb.collection('services')
            .where('type', '==', serviceTypeCode)
            .limit(1)
            .get();
        
        if (!servicesUsingType.empty) {
            return { success: false, error: 'Jenis layanan sedang digunakan oleh layanan/kelas. Tidak dapat dihapus.' };
        }
        
        await adminDb.collection('serviceTypes').doc(id).delete();
        console.log('Service type deleted successfully');
        
        revalidatePath('/master-data/service-types');
        return { success: true };
    } catch (error) {
        console.error('Error deleting service type:', error);
        return { success: false, error: error.message || 'Gagal menghapus data' };
    }
}

// --- Products ---

export async function getProducts() {
    try {
        if (!adminDb) return [];
        const snapshot = await adminDb.collection('products').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const serialized = { id: doc.id, ...data };
            if (data.createdAt) {
                serialized.createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() :
                    (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt);
            }
            if (data.updatedAt) {
                serialized.updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() :
                    (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt);
            }
            return serialized;
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export async function getProduct(id) {
    try {
        if (!adminDb || !id) return null;
        const docRef = await adminDb.collection('products').doc(id).get();
        if (!docRef.exists) return null;
        const data = docRef.data();
        const serialized = { id: docRef.id, ...data };
        if (data.createdAt) {
            serialized.createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() :
                (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt);
        }
        if (data.updatedAt) {
            serialized.updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() :
                (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt);
        }
        return serialized;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

export async function createProduct(data) {
    try {
        if (!adminDb) throw new Error("Database not initialized");
        const now = new Date();
        const newDoc = { ...data, createdAt: now, updatedAt: now };
        await adminDb.collection('products').add(newDoc);
        revalidatePath('/master-data/products');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// --- Membership Types ---

export async function getMembershipTypes() {
    try {
        if (!adminDb) return [];
        const snapshot = await adminDb.collection('membershipTypes').orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const serialized = { id: doc.id, ...data };
            if (data.createdAt) serialized.createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt);
            if (data.updatedAt) serialized.updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt);
            return serialized;
        });
    } catch (error) {
        console.error('Error fetching membership types:', error);
        return [];
    }
}

export async function getMembershipType(id) {
    try {
        if (!adminDb || !id) return null;
        const docRef = await adminDb.collection('membershipTypes').doc(id).get();
        if (!docRef.exists) return null;
        const data = docRef.data();
        const serialized = { id: docRef.id, ...data };
        if (data.createdAt) serialized.createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt instanceof Date ? data.createdAt.toISOString() : data.createdAt);
        if (data.updatedAt) serialized.updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt instanceof Date ? data.updatedAt.toISOString() : data.updatedAt);
        return serialized;
    } catch (error) {
        console.error('Error fetching membership type:', error);
        return null;
    }
}

export async function createMembershipType(data) {
    try {
        if (!adminDb) throw new Error("Database not initialized");
        if (!data.name || !String(data.name).trim()) return { success: false, error: 'Nama membership harus diisi' };
        const price = parseFloat(data.price);
        if (isNaN(price) || price < 0) return { success: false, error: 'Harga harus angka >= 0' };
        const durationMonths = parseInt(data.durationMonths, 10);
        if (isNaN(durationMonths) || durationMonths < 1) return { success: false, error: 'Durasi (bulan) minimal 1' };
        const now = new Date();
        const newDoc = {
            name: String(data.name).trim(),
            price,
            durationMonths,
            description: data.description ? String(data.description).trim() : '',
            status: data.status || 'active',
            createdAt: now,
            updatedAt: now,
        };
        await adminDb.collection('membershipTypes').add(newDoc);
        revalidatePath('/master-data/membership-types');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateMembershipType(id, data) {
    try {
        if (!adminDb || !id) return { success: false, error: 'ID tidak valid' };
        if (!data.name || !String(data.name).trim()) return { success: false, error: 'Nama membership harus diisi' };
        const price = parseFloat(data.price);
        if (isNaN(price) || price < 0) return { success: false, error: 'Harga harus angka >= 0' };
        const durationMonths = parseInt(data.durationMonths, 10);
        if (isNaN(durationMonths) || durationMonths < 1) return { success: false, error: 'Durasi (bulan) minimal 1' };
        await adminDb.collection('membershipTypes').doc(id).update({
            name: String(data.name).trim(),
            price,
            durationMonths,
            description: data.description ? String(data.description).trim() : '',
            status: data.status || 'active',
            updatedAt: new Date(),
        });
        revalidatePath('/master-data/membership-types');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
