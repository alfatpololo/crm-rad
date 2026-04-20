'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from './auth';
import { revalidatePath } from 'next/cache';

const CONFIG_DOC = 'config';
const DOCUMENT_TYPES_KEY = 'documentTypes';

const DEFAULT_TYPES = [
    { id: 'cv', label: 'CV (Curriculum Vitae)' },
    { id: 'ijazah', label: 'Ijazah Terakhir' },
];

/**
 * Get required document types (admin config). Public for participant page too.
 */
export async function getRequiredDocumentTypes() {
    try {
        const doc = await adminDb.collection(CONFIG_DOC).doc(DOCUMENT_TYPES_KEY).get();
        const data = doc.exists ? doc.data() : null;
        const types = Array.isArray(data?.types) && data.types.length > 0
            ? data.types
            : DEFAULT_TYPES;
        return { success: true, types };
    } catch (error) {
        console.error('getRequiredDocumentTypes:', error);
        return { success: true, types: DEFAULT_TYPES };
    }
}

/**
 * Set required document types (admin only). types = [{ id: string, label: string }]
 */
export async function setRequiredDocumentTypes(types) {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { success: false, error: 'Unauthorized' };
        }
        if (!Array.isArray(types)) {
            return { success: false, error: 'types harus array' };
        }
        const normalized = types
            .map(t => ({ id: String(t.id).trim().toLowerCase().replace(/\s+/g, '_'), label: String(t.label).trim() }))
            .filter(t => t.id && t.label);
        if (normalized.length === 0) {
            return { success: false, error: 'Minimal satu jenis dokumen' };
        }
        await adminDb.collection(CONFIG_DOC).doc(DOCUMENT_TYPES_KEY).set(
            { types: normalized, updatedAt: new Date() },
            { merge: true }
        );
        revalidatePath('/master-data/document-types');
        revalidatePath('/documents');
        return { success: true, types: normalized };
    } catch (error) {
        console.error('setRequiredDocumentTypes:', error);
        return { success: false, error: error.message };
    }
}
