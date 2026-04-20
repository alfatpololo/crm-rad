/**
 * URL publik aplikasi untuk callback server-side (Doku, dll).
 * Prioritas: NEXT_PUBLIC_APP_URL → VERCEL_URL (otomatis di Vercel).
 */
export function getServerAppBaseUrl() {
    const explicit = (process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
    if (explicit) return explicit;

    const vercel = (process.env.VERCEL_URL || '').trim().replace(/\/$/, '');
    if (vercel) {
        const proto = process.env.VERCEL === '1' || vercel.includes('vercel.app') ? 'https' : 'http';
        return `${proto}://${vercel}`;
    }

    return '';
}
