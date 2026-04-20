/** Max tahap pembayaran milestone per kelas (payment gateway). */
export const MAX_PAYMENT_MILESTONES = 24;

/**
 * @param {unknown} raw
 * @param {boolean} isFree
 * @returns {number} minimal 1; kelas gratis selalu 1 (lunas sekaligus).
 */
export function normalizePaymentMilestoneCount(raw, isFree) {
    if (isFree) return 1;
    const n = parseInt(String(raw === undefined || raw === null || raw === '' ? '1' : raw), 10);
    if (!Number.isFinite(n) || n < 1) return 1;
    return Math.min(MAX_PAYMENT_MILESTONES, n);
}

/**
 * Bagi total (rupiah, integer) ke N tahap; sisa pembagian ditambahkan ke tahap terakhir.
 * @param {number} totalIdr
 * @param {number} milestoneCount
 * @returns {number[]}
 */
export function splitTotalIntoMilestoneAmounts(totalIdr, milestoneCount) {
    const total = Math.round(Number(totalIdr));
    const n = normalizePaymentMilestoneCount(milestoneCount, total <= 0);
    if (n <= 1 || !Number.isFinite(total) || total <= 0) return [Math.max(0, total)];
    const base = Math.floor(total / n);
    const remainder = total - base * n;
    const arr = Array(n).fill(base);
    arr[n - 1] += remainder;
    return arr;
}
