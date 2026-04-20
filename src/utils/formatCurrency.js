/**
 * Format nominal untuk tampilan ringkas di card (dashboard).
 * Contoh: 1500000 → "Rp 1,5 jt", 2500000000 → "Rp 2,5 M"
 */
export function formatShortCurrency(value) {
    const num = typeof value === 'string' ? parseFloat(String(value).replace(/[^\d.,-]/g, '')) || 0 : Number(value) || 0
    if (num === 0) return 'Rp 0'
    const abs = Math.abs(num)
    const sign = num < 0 ? '−' : ''
    if (abs >= 1e9) return `${sign}Rp ${(abs / 1e9).toFixed(1).replace(/\.0$/, '')} M`
    if (abs >= 1e6) return `${sign}Rp ${(abs / 1e6).toFixed(1).replace(/\.0$/, '')} jt`
    if (abs >= 1e3) return `${sign}Rp ${(abs / 1e3).toFixed(0)} rb`
    return `${sign}Rp ${Math.round(abs).toLocaleString('id-ID')}`
}
