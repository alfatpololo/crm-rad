import { NextResponse } from 'next/server'
import { sendPaymentReminders, sendEventReminders } from '@/actions/waReminders'

/**
 * Cron: kirim reminder pembayaran + reminder event via Mekari WA.
 * Panggil dengan secret agar tidak sembarang orang trigger.
 * Contoh: GET /api/cron/wa-reminders?secret=MEKARI_WA_TOKEN_ATAU_CRON_SECRET
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const secret = searchParams.get('secret')
        const token = process.env.MEKARI_WA_TOKEN
        const cronSecret = process.env.CRON_SECRET
        const ok = token && (secret === token || (cronSecret && secret === cronSecret))
        if (!ok) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const [paymentRes, eventRes] = await Promise.all([
            sendPaymentReminders(),
            sendEventReminders(),
        ])

        return NextResponse.json({
            success: true,
            payment: { sent: paymentRes.sent, error: paymentRes.error },
            event: { sent: eventRes.sent, error: eventRes.error },
        })
    } catch (error) {
        console.error('cron wa-reminders:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
