'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from './auth';
import { createInvoice } from './invoices';
import { revalidatePath } from 'next/cache';

const COLLECTION = 'postCertificationCharges';

export async function getPostCertificationCharges() {
    try {
        if (!adminDb) return [];
        const snap = await adminDb.collection(COLLECTION).orderBy('order', 'asc').get();
        return snap.docs.map(doc => {
            const d = doc.data();
            return {
                id: doc.id,
                name: d.name || '',
                amount: d.amount ?? 0,
                order: d.order ?? 0,
            };
        });
    } catch (error) {
        console.error('Error fetching post-certification charges:', error);
        return [];
    }
}

export async function createPostCertificationCharge(data) {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') return { success: false, error: 'Unauthorized' };
        if (!adminDb) return { success: false, error: 'Database not initialized' };

        const name = (data.name || '').trim();
        const amount = parseFloat(data.amount);
        if (!name || isNaN(amount) || amount < 0) return { success: false, error: 'Nama dan jumlah wajib diisi' };

        const snap = await adminDb.collection(COLLECTION).orderBy('order', 'desc').limit(1).get();
        const nextOrder = snap.empty ? 0 : (snap.docs[0].data().order ?? 0) + 1;

        await adminDb.collection(COLLECTION).add({
            name,
            amount,
            order: nextOrder,
            createdAt: new Date(),
        });
        revalidatePath('/master-data/post-certification-charges');
        return { success: true };
    } catch (error) {
        console.error('Error creating post-certification charge:', error);
        return { success: false, error: error.message };
    }
}

export async function updatePostCertificationCharge(id, data) {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') return { success: false, error: 'Unauthorized' };
        if (!adminDb || !id) return { success: false, error: 'Invalid request' };

        const update = {};
        if (data.name !== undefined) update.name = (data.name || '').trim();
        if (data.amount !== undefined) update.amount = parseFloat(data.amount);
        if (data.order !== undefined) update.order = parseInt(data.order, 10);
        if (Object.keys(update).length === 0) return { success: true };

        await adminDb.collection(COLLECTION).doc(id).update(update);
        revalidatePath('/master-data/post-certification-charges');
        return { success: true };
    } catch (error) {
        console.error('Error updating post-certification charge:', error);
        return { success: false, error: error.message };
    }
}

export async function deletePostCertificationCharge(id) {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') return { success: false, error: 'Unauthorized' };
        if (!adminDb || !id) return { success: false, error: 'Invalid request' };

        await adminDb.collection(COLLECTION).doc(id).delete();
        revalidatePath('/master-data/post-certification-charges');
        return { success: true };
    } catch (error) {
        console.error('Error deleting post-certification charge:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Buat invoice tagihan pasca-sertifikasi untuk satu peserta (setelah ikut acara batch sertifikasi).
 * Satu invoice per charge.
 */
export async function createPostCertificationInvoicesForParticipant(participantId) {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') return { success: false, error: 'Unauthorized' };
        if (!adminDb || !participantId) return { success: false, error: 'Invalid request' };

        const participantDoc = await adminDb.collection('participants').doc(participantId).get();
        if (!participantDoc.exists) return { success: false, error: 'Peserta tidak ditemukan' };
        const participant = participantDoc.data();
        const email = participant.email || '';
        const name = participant.name || participant.displayName || email?.split('@')[0] || 'Peserta';

        const charges = await getPostCertificationCharges();
        if (charges.length === 0) return { success: false, error: 'Belum ada tagihan pasca-sertifikasi. Tambah dulu di Data Master.' };

        const created = [];
        for (const charge of charges) {
            const amount = parseFloat(charge.amount) || 0;
            if (amount <= 0) continue;
            const orderId = `postcert-${participantId}-${charge.id}-${Date.now()}`;
            const invoiceNumber = `INV-PC-${Date.now()}-${created.length + 1}`;
            const invoiceData = {
                orderId,
                invoiceNumber,
                client: { name, email },
                items: [{ id: charge.id, name: charge.name, product: charge.name, qty: 1, price: amount, total: amount }],
                subTotal: amount,
                tax: 0,
                grandTotal: amount,
                status: 'pending',
                issueDate: new Date(),
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                note: `Tagihan pasca-sertifikasi: ${charge.name}`,
                paymentMethod: '',
                invoiceType: 'postCertification',
                participantId,
            };
            const res = await createInvoice(invoiceData);
            if (res.success) created.push({ id: res.id, name: charge.name, amount });
        }

        revalidatePath('/customers/view');
        revalidatePath('/payment');
        return { success: true, created, message: `${created.length} tagihan pasca-sertifikasi dibuat.` };
    } catch (error) {
        console.error('Error creating post-certification invoices:', error);
        return { success: false, error: error.message };
    }
}
