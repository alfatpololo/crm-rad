'use server';

import { adminDb } from '@/lib/firebase/admin';
import { sendMekariWhatsApp } from '@/lib/mekariWa';

const REMINDER_DAYS_PAYMENT = 2;  // Jatuh tempo dalam 2 hari
const REMINDER_DAYS_EVENT = 2;   // Event dimulai dalam 2 hari

function toTime(v) {
    if (!v) return null;
    if (v.toDate && typeof v.toDate === 'function') return v.toDate().getTime();
    return new Date(v).getTime();
}

/**
 * Kirim reminder pembayaran via WA (tagihan yang akan jatuh tempo)
 */
export async function sendPaymentReminders() {
    try {
        if (!adminDb) return { success: false, error: 'DB not initialized', sent: 0 };

        const now = Date.now();
        const inDays = now + REMINDER_DAYS_PAYMENT * 24 * 60 * 60 * 1000;
        const snap = await adminDb.collection('invoices')
            .where('status', '==', 'pending')
            .get();

        let sent = 0;
        for (const doc of snap.docs) {
            const inv = doc.data();
            const due = toTime(inv.dueDate);
            if (due == null || due < now || due > inDays) continue;
            const email = inv.client?.email;
            if (!email) continue;
            const participantSnap = await adminDb.collection('participants')
                .where('email', '==', email)
                .limit(1)
                .get();
            if (participantSnap.empty) continue;
            const phone = participantSnap.docs[0].data().phone || participantSnap.docs[0].data().phoneNumber;
            if (!phone) continue;
            const itemName = inv.items?.[0]?.name || inv.note || 'Tagihan';
            const dueStr = inv.dueDate?.toDate?.()?.toLocaleDateString?.('id-ID') || new Date(due).toLocaleDateString('id-ID');
            const msg = `Reminder pembayaran\n\n*${itemName}*\nInvoice: ${inv.invoiceNumber || doc.id}\nJatuh tempo: ${dueStr}\nTotal: Rp ${parseFloat(inv.grandTotal || 0).toLocaleString('id-ID')}\n\nSilakan selesaikan pembayaran sebelum jatuh tempo.`;
            const res = await sendMekariWhatsApp(phone, msg);
            if (res.success) sent++;
        }
        return { success: true, sent };
    } catch (error) {
        console.error('sendPaymentReminders:', error);
        return { success: false, error: error.message, sent: 0 };
    }
}

/**
 * Kirim reminder event/kelas via WA (acara yang akan dimulai)
 */
export async function sendEventReminders() {
    try {
        if (!adminDb) return { success: false, error: 'DB not initialized', sent: 0 };

        const now = Date.now();
        const inDays = now + REMINDER_DAYS_EVENT * 24 * 60 * 60 * 1000;
        const servicesSnap = await adminDb.collection('services').get();
        const toNotify = []; // { phone, serviceName, startDate }

        for (const doc of servicesSnap.docs) {
            const svc = doc.data();
            const start = toTime(svc.startDate);
            if (start == null || start < now || start > inDays) continue;
            const serviceId = doc.id;
            const serviceName = svc.name || 'Event/Kelas';
            const startStr = svc.startDate?.toDate?.()?.toLocaleDateString?.('id-ID') || new Date(start).toLocaleDateString('id-ID');

            const participantsSnap = await adminDb.collection('participants').get();
            for (const pDoc of participantsSnap.docs) {
                const data = pDoc.data();
                const enrolled = data.enrolledClasses || [];
                const hasEnrolled = enrolled.some(c => (c.id || c.serviceId) === serviceId);
                if (!hasEnrolled) continue;
                const phone = data.phone || data.phoneNumber;
                if (phone) toNotify.push({ phone, serviceName, startStr });
            }
        }

        let sent = 0;
        for (const { phone, serviceName, startStr } of toNotify) {
            const msg = `Reminder event/kelas\n\n*${serviceName}*\nDimulai: ${startStr}\n\nJangan lupa hadir.`;
            const res = await sendMekariWhatsApp(phone, msg);
            if (res.success) sent++;
        }
        return { success: true, sent };
    } catch (error) {
        console.error('sendEventReminders:', error);
        return { success: false, error: error.message, sent: 0 };
    }
}
