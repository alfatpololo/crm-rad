/**
 * Mekari / Qontak WhatsApp API – broadcast direct (omnichannel).
 * Pakai endpoint resmi: api.mekari.com, path /broadcasts/whatsapp/direct.
 * Perlu: MEKARI_WA_TOKEN, MEKARI_WA_CHANNEL_ID, MEKARI_WA_TEMPLATE_ID (template dengan 1 variabel body).
 */

const MEKARI_BASE_URL = process.env.MEKARI_WA_BASE_URL || 'https://api.mekari.com'

/**
 * Normalize nomor untuk WA Indonesia (62xxx).
 * Menerima string atau number (dari form/Firestore).
 */
export function normalizePhone(phone) {
    if (phone == null || phone === '') return null
    const s = String(phone).trim()
    if (!s) return null
    let p = s.replace(/\D/g, '')
    if (!p.length) return null
    if (p.startsWith('0')) p = '62' + p.slice(1)
    else if (!p.startsWith('62')) p = '62' + p
    // Minimal 62 + 8 digit (contoh: 62812345678)
    return p.length >= 10 ? p : null
}

/**
 * Link buka chat WhatsApp (wa.me) dari nomor profil.
 * @param {string} phone - Nomor (08xxx atau 62xxx)
 * @returns {string|null} URL wa.me atau null jika nomor tidak valid
 */
export function getWhatsAppChatUrl(phone) {
    const num = normalizePhone(phone)
    return num ? `https://wa.me/${num}` : null
}

/**
 * Kirim pesan WhatsApp via Mekari/Qontak API
 * @param {string} phone - Nomor (08xxx atau 62xxx)
 * @param {string} message - Isi pesan teks
 * @param {string} [channelId] - Channel ID (opsional, jika wajib di env: MEKARI_WA_CHANNEL_ID)
 * @returns {{ success: boolean, error?: string }}
 */
export async function sendMekariWhatsApp(phone, message, channelId) {
    const token = process.env.MEKARI_WA_TOKEN
    if (!token) {
        console.warn('MEKARI_WA_TOKEN tidak di-set, skip kirim WA')
        return { success: false, error: 'MEKARI_WA_TOKEN not configured' }
    }

    const to = normalizePhone(phone)
    if (!to) {
        return { success: false, error: 'Nomor telepon tidak valid' }
    }

    const channel = channelId || process.env.MEKARI_WA_CHANNEL_ID
        const templateId = process.env.MEKARI_WA_TEMPLATE_ID
        if (!channel) {
            return { success: false, error: 'MEKARI_WA_CHANNEL_ID belum di-set. Ambil dari Qontak: Integrasi → Channel WhatsApp.' }
        }
        if (!templateId) {
            return { success: false, error: 'MEKARI_WA_TEMPLATE_ID belum di-set. Buat template WA di Qontak (1 variabel body), lalu isi di .env' }
        }

    try {
        const path = '/broadcasts/whatsapp/direct'
        const body = {
            to_name: 'Peserta',
            to_number: to,
            message_template_id: templateId || '',
            channel_integration_id: channel || '',
            language: { code: 'id' },
            parameters: {
                buttons: [],
                body: [{ key: '1', value_text: message, value: 'text' }],
            },
        }
        const res = await fetch(`${MEKARI_BASE_URL}${path}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        if (!res.ok) {
            const errText = await res.text()
            let errMsg = `HTTP ${res.status}`
            try {
                const errJson = JSON.parse(errText)
                errMsg = errJson.message || errJson.error || errText
            } catch (_) {
                if (errText) errMsg = errText.slice(0, 200)
            }
            return { success: false, error: errMsg }
        }

        return { success: true }
    } catch (err) {
        console.error('Mekari WA send error:', err)
        return { success: false, error: err.message || 'Gagal kirim WA' }
    }
}
