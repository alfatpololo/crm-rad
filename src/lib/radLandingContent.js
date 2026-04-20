/**
 * Konten landing LMS selaras dengan situs resmi PT. RAD Indonesia (pelatihan CMA & sertifikasi ICMA).
 * @see https://radindonesia.com/id/
 */

/** Nama brand untuk judul tab browser (`document.title`) — jangan pakai nama template Eduvalt. */
export const RAD_BRAND_TITLE = 'PT. RAD Indonesia'

/** Judul halaman + brand (tab browser). */
export function radPageTitle(pageTitle) {
    const t = (pageTitle || '').trim()
    return t ? `${t} | ${RAD_BRAND_TITLE}` : RAD_BRAND_TITLE
}

export const RAD_SITE_URL = 'https://radindonesia.com/id/'
export const RAD_SITE_PELATIHAN = 'https://radindonesia.com/id/pelatihan'
export const RAD_SITE_PENDAFTARAN = 'https://radindonesia.com/id/pendaftaran'
export const RAD_SITE_ARTIKEL = 'https://radindonesia.com/id/artikel'

export const RAD_CONTACT = {
    email: 'ptradindonesia@gmail.com',
    phoneDisplay: '+62 811-2503-1503',
    phoneTel: '+6281125031503',
    address:
        'Permata Jingga West Area, Blok Zahara J No. 9, Kota Malang, Jawa Timur, Indonesia',
}

/** Sosial & situs — sesuaikan URL official bila berbeda. */
export const RAD_SOCIAL = {
    facebook: RAD_SITE_URL,
    instagram: 'https://www.instagram.com/radindonesia/',
    linkedin: 'https://www.linkedin.com/company/pt-rabindra-annesa-danesjvara-indonesia',
}

export const RAD_TAGLINE = {
    heroSub: 'Program sertifikasi internasional',
    heroTitle: 'Mari bergabung dengan pelatihan CMA kami',
    heroLead:
        'PT. Rabindra Annesa Danesjvara Indonesia (RAD Indonesia) mitra terpercaya The Institute of Certified Management Accountants of Australia (ICMA) untuk pemasaran dan penyelenggaraan pelatihan Certified Management Accountant (CMA) serta program sertifikasi internasional lainnya.',
    heroCta: 'Lihat program di LMS',
    heroSecondary: 'Situs resmi RAD',
}

export const RAD_PROGRAM_NAMES = [
    { name: 'CMA', desc: 'Certified Management Accountant', icon: 'flaticon-graduation-cap' },
    { name: 'CBV', desc: 'Certified Business Valuer', icon: 'flaticon-bars' },
    { name: 'CIBA', desc: 'Certified International Business Analyst', icon: 'flaticon-email-marketing' },
    { name: 'CAPF', desc: 'Certified Analyst in Project Finance', icon: 'flaticon-graphic-design' },
    { name: 'CAPM', desc: 'Certified Analyst in Project Management', icon: 'flaticon-programming-language' },
    { name: 'CERA', desc: 'Certified Enterprise Risk Analyst', icon: 'flaticon-atom' },
]
