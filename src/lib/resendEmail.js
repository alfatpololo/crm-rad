/**
 * Kirim email via Resend.
 * Supaya email masuk inbox (tidak spam):
 * - Verifikasi domain di https://resend.com/domains dan pakai FROM domain itu (misal noreply@domain.com)
 * - Atau pakai onboarding@resend.dev hanya untuk testing (hanya bisa kirim ke email akun Resend Anda)
 */

import { Resend } from 'resend'

const defaultFrom = process.env.RESEND_FROM || 'CRM <onboarding@resend.dev>'

/**
 * Kirim email HTML via Resend
 * @param {{ to: string | string[], subject: string, html: string, from?: string }}
 * @returns {{ success: boolean, id?: string, error?: string }}
 */
export async function sendEmail({ to, subject, html, from = defaultFrom }) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey || apiKey === 're_your_api_key_here') {
        console.warn('RESEND_API_KEY tidak di-set')
        return { success: false, error: 'RESEND_API_KEY tidak dikonfigurasi' }
    }

    try {
        const resend = new Resend(apiKey)
        const toList = Array.isArray(to) ? to : [to]
        const { data, error } = await resend.emails.send({
            from,
            to: toList,
            subject,
            html,
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error: error.message || JSON.stringify(error) }
        }
        return { success: true, id: data?.id }
    } catch (err) {
        console.error('sendEmail error:', err)
        return { success: false, error: err.message || 'Gagal mengirim email' }
    }
}
