import { normalizePaymentMilestoneCount } from '@/lib/milestonePayment';

function parseInstallmentTerms(v) {
    if (v === undefined || v === null) return [3, 4, 6, 12];
    if (Array.isArray(v)) {
        const arr = v.map(n => typeof n === 'number' ? n : parseInt(n, 10)).filter(n => !isNaN(n) && n >= 2).sort((a, b) => a - b);
        return arr.length ? arr : [3, 4, 6, 12];
    }
    if (typeof v === 'number' && !isNaN(v) && v >= 2) return [v];
    if (typeof v === 'string') {
        const arr = v.split(/[,;\s]+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n) && n >= 2).sort((a, b) => a - b);
        return arr.length ? arr : [3, 4, 6, 12];
    }
    return [3, 4, 6, 12];
}

/**
 * Get the applicable price tier for a service.
 * @param {Object} service - Service object with priceTiers[] or price, installmentTerms, minDp
 * @param {Date} [atDate] - Date to check (default: now), only used if tiers have startDate/endDate
 * @returns {{ price: number, label: string|null, minDp: number|null, installmentTerms: number[], isFree: boolean, paymentMilestoneCount: number }}
 */
export function getApplicablePriceTier(service, atDate = new Date()) {
    if (!service) {
        return { price: 0, label: null, minDp: null, installmentTerms: [3, 4, 6, 12], isFree: true, paymentMilestoneCount: 1 };
    }

    const tiers = service.priceTiers;
    if (!Array.isArray(tiers) || tiers.length === 0) {
        const price = parseFloat(service.price ?? 0);
        const isFree = service.isFree || price === 0;
        return {
            price,
            label: null,
            minDp: service.minDp != null ? parseFloat(service.minDp) : null,
            installmentTerms: parseInstallmentTerms(service.installmentTerms),
            isFree,
            paymentMilestoneCount: normalizePaymentMilestoneCount(service.paymentMilestoneCount, isFree),
        };
    }

    const toTime = (v) => {
        if (!v) return null;
        if (typeof v.toDate === 'function') return v.toDate().getTime();
        return new Date(v).getTime();
    };
    const t = atDate.getTime();
    for (const tier of tiers) {
        const start = toTime(tier.startDate) ?? 0;
        const end = toTime(tier.endDate) ?? Infinity;
        if (t >= start && t <= end) {
            const price = parseFloat(tier.price ?? 0);
            const isFree = price === 0;
            return {
                price,
                label: tier.label || null,
                minDp: tier.minDp != null ? parseFloat(tier.minDp) : null,
                installmentTerms: parseInstallmentTerms(tier.installmentTerms),
                isFree,
                paymentMilestoneCount: normalizePaymentMilestoneCount(service.paymentMilestoneCount, service.isFree || isFree),
            };
        }
    }

    const first = tiers[0];
    if (first) {
        const price = parseFloat(first.price ?? 0);
        const isFree = price === 0;
        return {
            price,
            label: first.label || null,
            minDp: first.minDp != null ? parseFloat(first.minDp) : null,
            installmentTerms: parseInstallmentTerms(first.installmentTerms),
            isFree,
            paymentMilestoneCount: normalizePaymentMilestoneCount(service.paymentMilestoneCount, service.isFree || isFree),
        };
    }
    const price = parseFloat(service.price ?? 0);
    const isFree = service.isFree || price === 0;
    return {
        price,
        label: null,
        minDp: service.minDp != null ? parseFloat(service.minDp) : null,
        installmentTerms: parseInstallmentTerms(service.installmentTerms),
        isFree,
        paymentMilestoneCount: normalizePaymentMilestoneCount(service.paymentMilestoneCount, isFree),
    };
}

const toTime = (v) => {
    if (!v) return null;
    if (typeof v?.toDate === 'function') return v.toDate().getTime();
    return new Date(v).getTime();
};

/**
 * Hitung harga setelah promo (jika promo aktif dan valid).
 * @param {Object} service - Service dengan promo: { enabled, type: 'percent'|'fixed', value, code?, startDate?, endDate?, label? }
 * @param {number} originalPrice - Harga sebelum diskon
 * @param {string} [promoCode] - Kode promo dari user (wajib jika promo punya code)
 * @param {Date} [atDate] - Tanggal cek (default: sekarang)
 * @returns {{ applied: boolean, finalPrice: number, discountAmount: number, promoLabel: string|null }}
 */
export function getPromoDiscount(service, originalPrice, promoCode = '', atDate = new Date()) {
    const result = { applied: false, finalPrice: originalPrice, discountAmount: 0, promoLabel: null };
    if (!service?.promo || !service.promo.enabled || originalPrice <= 0) return result;
    const p = service.promo;
    const now = atDate.getTime();
    if (p.startDate && toTime(p.startDate) != null && now < toTime(p.startDate)) return result;
    if (p.endDate && toTime(p.endDate) != null && now > toTime(p.endDate)) return result;
    if (p.code && p.code.trim() !== '') {
        const input = (promoCode || '').trim().toLowerCase();
        const expected = String(p.code).trim().toLowerCase();
        if (input !== expected) return result;
    }
    const type = p.type === 'percent' ? 'percent' : 'fixed';
    const val = parseFloat(p.value) || 0;
    let discount = 0;
    if (type === 'percent') discount = Math.min(originalPrice * val / 100, originalPrice);
    else discount = Math.min(val, originalPrice);
    result.applied = true;
    result.discountAmount = discount;
    result.finalPrice = Math.max(0, originalPrice - discount);
    result.promoLabel = p.label || (type === 'percent' ? `Diskon ${val}%` : `Diskon Rp ${val.toLocaleString('id-ID')}`);
    return result;
}
