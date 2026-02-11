'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FiCalendar, FiClock, FiUsers, FiDollarSign, FiMapPin, FiTag, FiBook, FiAward, FiShoppingCart, FiCheckCircle } from 'react-icons/fi'
import { useAuth } from '@/context/AuthProvider'
import { db } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import ServiceReviews from './ServiceReviews'
import { getApplicablePriceTier, getPromoDiscount } from '@/utils/servicePrice'

const ServiceViewContent = ({ service }) => {
    const { user } = useAuth()
    const router = useRouter()
    const [enrolledServices, setEnrolledServices] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEnrolled = async () => {
            if (user && user.uid) {
                try {
                    const participantDoc = await getDoc(doc(db, 'participants', user.uid))
                    if (participantDoc.exists()) {
                        const data = participantDoc.data()
                        setEnrolledServices(data.enrolledClasses || [])
                    }
                } catch (error) {
                    console.error('Error fetching enrolled services:', error)
                }
            }
            setLoading(false)
        }
        fetchEnrolled()
    }, [user])

    const isEnrolled = enrolledServices.some(s => s.id === service.id)

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        try {
            const date = typeof dateString === 'string' 
                ? new Date(dateString) 
                : (dateString?.seconds ? new Date(dateString.seconds * 1000) : new Date(dateString))
            return date.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch (e) {
            return dateString
        }
    }

    const handleEnroll = async () => {
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Diperlukan',
                text: 'Silakan login terlebih dahulu untuk mendaftar kelas',
                confirmButtonColor: '#198754',
            })
            router.push('/authentication/login/cover')
            return
        }

        const tier = getApplicablePriceTier(service)
        const isFree = tier.isFree
        const promoResult = getPromoDiscount(service, tier.price, '', new Date())
        const displayPrice = promoResult.applied ? promoResult.finalPrice : tier.price
        const tierLabel = tier.label ? ` (${tier.label})` : ''
        const cicilanText = tier.installmentTerms?.length ? tier.installmentTerms.map(x => x + 'x').join(', ') : '3x, 4x, 6x, 12x'
        const minDpText = tier.minDp != null && tier.minDp > 0 ? `<p class="small text-muted mb-0">Min. DP: <strong>Rp ${Number(tier.minDp).toLocaleString('id-ID')}</strong></p>` : ''
        const hasPromoCode = service.promo?.enabled && service.promo?.code && String(service.promo.code).trim() !== ''
        const promoHtml = !isFree && hasPromoCode ? `<p class="small mb-2">Kode promo: <input type="text" id="promo-code-input" class="form-control form-control-sm d-inline-block" style="width:120px" placeholder="Masukkan kode" /></p>` : ''
        const priceHtml = !isFree
            ? (hasPromoCode
                ? `<p class="mb-2">Harga${tierLabel}: <strong class="text-primary">Rp ${Number(tier.price).toLocaleString('id-ID')}</strong> (masukkan kode untuk diskon)</p>${promoHtml}`
                : promoResult.applied
                    ? `<p class="mb-2">${promoResult.promoLabel ? `<span class="badge bg-success me-2">${promoResult.promoLabel}</span>` : ''} Harga${tierLabel}: <s class="text-muted">Rp ${Number(tier.price).toLocaleString('id-ID')}</s> <strong class="text-primary">Rp ${Number(displayPrice).toLocaleString('id-ID')}</strong></p>`
                    : `<p class="mb-2">Harga${tierLabel}: <strong class="text-primary">Rp ${Number(displayPrice).toLocaleString('id-ID')}</strong></p>`)
            : ''
        const result = await Swal.fire({
            icon: 'question',
            title: isFree ? 'Daftar Kelas Gratis?' : 'Beli Kelas?',
            html: `
                <div class="text-start">
                    <p><strong>${service.name}</strong></p>
                    ${isFree ? (
                        `<p class="mb-2">Harga: <strong class="text-success">GRATIS</strong></p>
                         <p class="small text-muted mb-0">Kelas ini gratis, Anda akan langsung terdaftar tanpa perlu pembayaran.</p>`
                    ) : (
                        `${priceHtml}
                         ${minDpText}
                         <p class="small text-muted mb-0">Pembayaran via Midtrans (tunai atau cicilan ${cicilanText}). Setelah pembayaran berhasil, kelas akan ditambahkan ke akun Anda.</p>`
                    )}
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: isFree ? 'Ya, Daftar Sekarang' : 'Ya, Beli Sekarang',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
        })

        if (!result.isConfirmed) return

        const promoCode = typeof document !== 'undefined' ? (document.getElementById('promo-code-input')?.value || '') : ''

        Swal.fire({
            title: 'Memproses...',
            text: isFree ? 'Sedang mendaftarkan kelas...' : 'Sedang membeli kelas...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading()
            }
        })

        try {
            const { purchaseClass } = await import('@/actions/participants')
            const purchaseResult = await purchaseClass(service.id, service, { promoCode })

            if (purchaseResult.success) {
                if (purchaseResult.isFree) {
                    const participantDoc = await getDoc(doc(db, 'participants', user.uid))
                    if (participantDoc.exists()) {
                        const data = participantDoc.data()
                        setEnrolledServices(data.enrolledClasses || [])
                    }

                    await Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        html: `
                            <p><strong>Kelas gratis berhasil didaftarkan!</strong></p>
                            <p class="mb-2">Kelas sekarang dapat Anda akses.</p>
                        `,
                        confirmButtonText: 'Lihat Kelas Saya',
                        showCancelButton: true,
                        cancelButtonText: 'Tutup',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            router.push('/profile')
                        } else {
                            router.refresh()
                        }
                    })
                    return
                }
                
                if (purchaseResult.redirectUrl) {
                    window.location.href = `/payments/process?orderId=${purchaseResult.orderId}&redirectUrl=${encodeURIComponent(purchaseResult.redirectUrl)}`
                } else if (purchaseResult.paymentToken) {
                    window.location.href = `/payments/process?orderId=${purchaseResult.orderId}`
                } else {
                    const participantDoc = await getDoc(doc(db, 'participants', user.uid))
                    if (participantDoc.exists()) {
                        const data = participantDoc.data()
                        setEnrolledServices(data.enrolledClasses || [])
                    }

                    await Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        html: `
                            <p><strong>Kelas berhasil dibeli!</strong></p>
                            <p class="mb-2">Kelas sekarang dapat Anda akses.</p>
                            <p class="small text-muted mb-0">Invoice: <strong>${purchaseResult.invoiceNumber}</strong></p>
                        `,
                        confirmButtonText: 'Lihat Kelas Saya',
                        showCancelButton: true,
                        cancelButtonText: 'Tutup',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            router.push('/profile')
                        } else {
                            router.refresh()
                        }
                    })
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: purchaseResult.error || 'Gagal membeli kelas. Silakan coba lagi.',
                })
            }
        } catch (error) {
            console.error('Error purchasing class:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Terjadi kesalahan saat membeli kelas.'
            })
        }
    }

    return (
        <div className="col-lg-12">
            <div className="row">
                {/* Main Content */}
                <div className="col-lg-8">
                    {/* Header Card */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between mb-3">
                                <div>
                                    <h2 className="mb-2">{service.name || 'Nama Layanan'}</h2>
                                    <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                        {service.category && (
                                            <span className="badge bg-soft-primary text-primary">
                                                <FiTag className="me-1" />
                                                {service.category}
                                            </span>
                                        )}
                                        {service.isFree && (
                                            <span className="badge bg-soft-success text-success">
                                                <FiAward className="me-1" />
                                                Gratis
                                            </span>
                                        )}
                                        {isEnrolled && (
                                            <span className="badge bg-soft-success text-success">
                                                <FiCheckCircle className="me-1" />
                                                Terdaftar
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Image */}
                            {service.imageUrl && (
                                <div className="mb-4">
                                    <div className="position-relative" style={{ width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                                        <Image
                                            src={service.imageUrl}
                                            alt={service.name || 'Service Image'}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 800px"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {service.description && (
                                <div className="mb-4">
                                    <h5 className="mb-3">Tentang {service.type === 'event' ? 'Event' : 'Kelas'}</h5>
                                    <p className="text-muted" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                                        {service.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Informasi Detail</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-4">
                                {/* Price */}
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center">
                                        <div className="avatar-text avatar-lg bg-soft-primary text-primary rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FiDollarSign size={20} />
                                        </div>
                                        <div>
                                            <p className="text-muted small mb-1">Harga</p>
                                            {(() => {
                                                const t = getApplicablePriceTier(service)
                                                const promoResult = getPromoDiscount(service, t.price, '', new Date())
                                                const hasPromoCode = service.promo?.enabled && service.promo?.code && String(service.promo.code).trim() !== ''
                                                if (t.isFree) return <h5 className="mb-0 text-success fw-bold">GRATIS</h5>
                                                if (promoResult.applied) {
                                                    return (
                                                        <div>
                                                            {promoResult.promoLabel && <span className="badge bg-success me-2 mb-1">{promoResult.promoLabel}</span>}
                                                            <h5 className="mb-0 fw-bold">
                                                                <s className="text-muted fw-normal small me-2">Rp {Number(t.price).toLocaleString('id-ID')}</s>
                                                                <span className="text-primary">Rp {Number(promoResult.finalPrice).toLocaleString('id-ID')}</span>
                                                                {t.label && <span className="text-muted small"> ({t.label})</span>}
                                                            </h5>
                                                        </div>
                                                    )
                                                }
                                                if (hasPromoCode) {
                                                    return (
                                                        <div>
                                                            <span className="badge bg-soft-warning text-warning small mb-1">Pakai kode promo untuk diskon</span>
                                                            <h5 className="mb-0 fw-bold">Rp {Number(t.price).toLocaleString('id-ID')}{t.label && <span className="text-muted small"> ({t.label})</span>}</h5>
                                                        </div>
                                                    )
                                                }
                                                return <h5 className="mb-0 fw-bold">Rp {Number(t.price).toLocaleString('id-ID')}{t.label && <span className="text-muted small"> ({t.label})</span>}</h5>
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Start Date */}
                                {service.startDate && (
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-text avatar-lg bg-soft-warning text-warning rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiCalendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-1">Tanggal Mulai</p>
                                                <h6 className="mb-0 fw-bold">{formatDate(service.startDate)}</h6>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* End Date */}
                                {service.endDate && (
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-text avatar-lg bg-soft-danger text-danger rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiCalendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-1">Tanggal Selesai</p>
                                                <h6 className="mb-0 fw-bold">{formatDate(service.endDate)}</h6>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Location */}
                                {service.location && (
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-text avatar-lg bg-soft-secondary text-secondary rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiMapPin size={20} />
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-1">Lokasi</p>
                                                <h6 className="mb-0 fw-bold">{service.location}</h6>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Capacity */}
                                {service.capacity && (
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-text avatar-lg bg-soft-success text-success rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiUsers size={20} />
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-1">Kapasitas</p>
                                                <h6 className="mb-0 fw-bold">{service.capacity} peserta</h6>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Instructor */}
                                {service.instructor && (
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-text avatar-lg bg-soft-info text-info rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiBook size={20} />
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-1">Instruktur</p>
                                                <h6 className="mb-0 fw-bold">{service.instructor}</h6>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Action Card */}
                    <div className="card mb-4 sticky-top" style={{ top: '20px' }}>
                        <div className="card-body text-center">
                            <div className="mb-4">
                                {(() => {
                                    const t = getApplicablePriceTier(service)
                                    const promoResult = getPromoDiscount(service, t.price, '', new Date())
                                    const hasPromoCode = service.promo?.enabled && service.promo?.code && String(service.promo.code).trim() !== ''
                                    if (t.isFree) return <h3 className="text-success fw-bold mb-2">GRATIS</h3>
                                    if (promoResult.applied) {
                                        return (
                                            <>
                                                {promoResult.promoLabel && <span className="badge bg-success mb-2">{promoResult.promoLabel}</span>}
                                                <p className="text-muted small mb-1">Harga{t.label ? ` (${t.label})` : ''}</p>
                                                <h3 className="fw-bold mb-2">
                                                    <s className="text-muted fw-normal small me-2">Rp {Number(t.price).toLocaleString('id-ID')}</s>
                                                    <span className="text-primary">Rp {Number(promoResult.finalPrice).toLocaleString('id-ID')}</span>
                                                </h3>
                                            </>
                                        )
                                    }
                                    if (hasPromoCode) {
                                        return (
                                            <>
                                                <span className="badge bg-soft-warning text-warning mb-2">Pakai kode promo</span>
                                                <p className="text-muted small mb-1">Harga{t.label ? ` (${t.label})` : ''}</p>
                                                <h3 className="fw-bold mb-2">Rp {Number(t.price).toLocaleString('id-ID')}</h3>
                                            </>
                                        )
                                    }
                                    return (
                                        <>
                                            <p className="text-muted small mb-1">Harga{t.label ? ` (${t.label})` : ''}</p>
                                            <h3 className="fw-bold mb-2">Rp {Number(t.price).toLocaleString('id-ID')}</h3>
                                        </>
                                    )
                                })()}
                            </div>

                            {isEnrolled ? (
                                <div className="alert alert-success mb-0">
                                    <FiCheckCircle className="me-2" />
                                    Anda sudah terdaftar di kelas ini
                                </div>
                            ) : (
                                <button
                                    onClick={handleEnroll}
                                    className="btn btn-primary w-100 btn-lg"
                                    disabled={loading}
                                >
                                    <FiShoppingCart size={20} className="me-2" />
                                    {getApplicablePriceTier(service).isFree ? 'Daftar Sekarang' : 'Beli Sekarang'}
                                </button>
                            )}

                            {service.capacity && (
                                <div className="mt-3 pt-3 border-top">
                                    <p className="text-muted small mb-0">
                                        <FiUsers className="me-1" />
                                        Kapasitas: {service.capacity} peserta
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="row mt-4">
                <div className="col-lg-12">
                    <ServiceReviews serviceId={service.id} />
                </div>
            </div>
        </div>
    )
}

export default ServiceViewContent

