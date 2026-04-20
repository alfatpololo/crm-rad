'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { FiBook, FiCalendar, FiClock, FiUsers, FiDollarSign, FiShoppingCart } from 'react-icons/fi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { getApplicablePriceTier, getPromoDiscount } from '@/utils/servicePrice'
import ServiceCardCover from '@/components/services/ServiceCardCover'

const ServicesContent = () => {
    const { user } = useAuth()
    const router = useRouter()
    const [services, setServices] = useState([])
    const [enrolledServices, setEnrolledServices] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('🔍 Fetching services from Firestore...')
                console.log('User:', user ? { uid: user.uid, email: user.email } : 'Not logged in')
                
                // Fetch all services/classes from master-data
                // Note: This should work even if user is not logged in (for public viewing)
                const servicesSnapshot = await getDocs(collection(db, 'services'))
                const servicesList = []
                
                console.log('📦 Total services fetched from Firestore:', servicesSnapshot.size)
                
                if (servicesSnapshot.empty) {
                    console.warn('⚠️ No services found in Firestore collection "services"!')
                }
                
                servicesSnapshot.forEach(doc => {
                    const data = doc.data()
                    console.log(`Service ${doc.id}:`, { name: data.name, status: data.status })
                    
                    // Convert Firestore Timestamps to Date objects if needed
                    let startDate = data.startDate
                    let endDate = data.endDate
                    
                    if (data.startDate?.toDate) {
                        startDate = data.startDate.toDate().toISOString()
                    } else if (data.startDate?.seconds) {
                        startDate = new Date(data.startDate.seconds * 1000).toISOString()
                    }
                    
                    if (data.endDate?.toDate) {
                        endDate = data.endDate.toDate().toISOString()
                    } else if (data.endDate?.seconds) {
                        endDate = new Date(data.endDate.seconds * 1000).toISOString()
                    }
                    
                    const serviceData = {
                        id: doc.id,
                        ...data,
                        startDate: startDate,
                        endDate: endDate,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).toISOString() : data.createdAt),
                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt?.seconds ? new Date(data.updatedAt.seconds * 1000).toISOString() : data.updatedAt),
                    }
                    
                    // Only exclude services with explicit inactive status
                    // Show all other services (including those without status or with active status)
                    const status = data.status
                    const statusLower = (status?.toLowerCase() || '').trim()
                    
                    // Exclude only if status explicitly indicates inactive
                    const isInactive = 
                        statusLower === 'inactive' || 
                        statusLower === 'tidak aktif' ||
                        statusLower === 'nonaktif' ||
                        statusLower === 'disabled'
                    
                    if (!isInactive) {
                        servicesList.push(serviceData)
                        console.log(`✓ Service ${doc.id} "${data.name}" added (status: ${status || 'null/undefined'})`)
                    } else {
                        console.log(`✗ Service ${doc.id} "${data.name}" filtered out (status: ${status})`)
                    }
                })
                
                console.log(`✅ Total services available: ${servicesList.length} out of ${servicesSnapshot.size}`)
                
                // Don't use mock data - show actual data from Firebase
                console.log('✅ Final services list:', servicesList.map(s => ({ id: s.id, name: s.name, status: s.status })))
                
                if (servicesList.length === 0) {
                    console.warn('⚠️ No services found! Check Firebase collection "services" and status values.')
                }

                setServices(servicesList)
                console.log('✅ Services state updated:', servicesList.length, 'items')

                // Fetch enrolled services for this user (only if user is logged in)
                if (user && user.uid) {
                    try {
                        const participantDoc = await getDoc(doc(db, 'participants', user.uid))
                        if (participantDoc.exists()) {
                            const data = participantDoc.data()
                            const enrolled = data.enrolledClasses || []
                            setEnrolledServices(enrolled)
                            console.log('✅ Enrolled services:', enrolled.length, 'items')
                        } else {
                            console.log('ℹ️ No participant document found for user:', user.uid)
                            setEnrolledServices([])
                        }
                    } catch (error) {
                        console.error('Error fetching enrolled services:', error)
                        setEnrolledServices([])
                    }
                } else {
                    console.log('ℹ️ User not logged in, skipping enrolled services fetch')
                    setEnrolledServices([])
                }
            } catch (error) {
                console.error('❌ Error fetching services:', error)
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    stack: error.stack
                })
                
                // Check if it's a permission error
                if (error.code === 'permission-denied' || error.message?.includes('permission')) {
                    console.error('⚠️ Permission denied! Check Firestore Security Rules for "services" collection')
                    console.error('Make sure authenticated users can read from "services" collection')
                }
                
                // Set empty array on error to show error state
                setServices([])
            } finally {
                setLoading(false)
                console.log('✅ Fetch completed')
            }
        }

        // Fetch data regardless of user login status (for public viewing)
        fetchData()
    }, [user])

    const isEnrolled = (serviceId) => {
        return enrolledServices.some(s => s.id === serviceId || s === serviceId)
    }

    const handleEnroll = async (service) => {
        try {
            // Check if user is authenticated
            if (!user || !user.uid) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Login Required',
                    text: 'Silakan login terlebih dahulu untuk membeli kelas',
                    confirmButtonText: 'Login',
                }).then(() => {
                    window.location.href = '/authentication/login'
                })
                return
            }

            // Ensure user has a valid session by refreshing token and creating session
            try {
                const idToken = await user.getIdToken(true) // Force refresh
                console.log('✅ User token refreshed')
                
                // Ensure session cookie is set
                const sessionResponse = await fetch('/api/auth/refresh-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ idToken }),
                })
                
                const sessionData = await sessionResponse.json()
                
                if (!sessionData.success) {
                    console.error('❌ Failed to refresh session:', sessionData.error)
                    throw new Error('Failed to refresh session')
                }
                
                console.log('✅ Session refreshed successfully')
            } catch (tokenError) {
                console.error('❌ Error refreshing session:', tokenError)
                Swal.fire({
                    icon: 'error',
                    title: 'Session Error',
                    text: 'Gagal memastikan session. Silakan coba lagi atau login ulang.',
                    confirmButtonText: 'OK',
                })
                return
            }

            const tier = getApplicablePriceTier(service)
            const isFree = tier.isFree
            const promoResult = getPromoDiscount(service, tier.price, '', new Date())
            const displayPrice = promoResult.applied ? promoResult.finalPrice : tier.price
            const tierLabel = tier.label ? ` (${tier.label})` : ''
            const minDpText = tier.minDp != null && tier.minDp > 0 ? `<p class="small text-muted mb-0">Min. DP: <strong>Rp ${Number(tier.minDp).toLocaleString('id-ID')}</strong></p>` : ''
            const paymentModeHtml = !isFree
                ? `<div class="mb-3 p-2 rounded border bg-light">
                     <p class="small fw-semibold mb-2">Cara bayar</p>
                     <div class="form-check mb-1">
                       <input class="form-check-input" type="radio" name="svc-payment-mode" id="svc-pay-full-list" value="1" checked />
                       <label class="form-check-label small" for="svc-pay-full-list"><strong>Lunas sekali</strong> — satu invoice penuh; akses materi setelah pembayaran berhasil.</label>
                     </div>
                     <div class="form-check mb-0">
                       <input class="form-check-input" type="radio" name="svc-payment-mode" id="svc-pay-3-list" value="3" />
                       <label class="form-check-label small" for="svc-pay-3-list"><strong>Cicilan 3×</strong> — total dibagi 3 via payment gateway; <strong class="text-warning">akses kelas baru setelah pembayaran ke-3</strong> selesai.</label>
                     </div>
                   </div>`
                : ''
            const hasPromoCode = service.promo?.enabled && service.promo?.code && String(service.promo.code).trim() !== ''
            const promoHtml = !isFree && hasPromoCode
                ? `<p class="small mb-2">Kode promo: <input type="text" id="promo-code-input" class="form-control form-control-sm d-inline-block" style="width:120px" placeholder="${service.promo.code ? 'Masukkan kode' : ''}" /></p>`
                : ''
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
                             ${paymentModeHtml}
                             <p class="small text-muted mb-0">Pembayaran melalui payment gateway. Setelah lunas sesuai cara bayar yang Anda pilih, kelas akan ditambahkan ke akun Anda.</p>`
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
            const paymentModeEl = typeof document !== 'undefined' ? document.querySelector('input[name="svc-payment-mode"]:checked') : null
            const paymentMilestoneCount = paymentModeEl ? parseInt(paymentModeEl.value, 10) : undefined

            Swal.fire({
                title: 'Memproses...',
                text: 'Sedang membeli kelas...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })

            const { purchaseClass } = await import('@/actions/participants')
            const purchaseResult = await purchaseClass(service.id, service, {
                promoCode,
                baseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
                ...(typeof paymentMilestoneCount === 'number' && !isNaN(paymentMilestoneCount) ? { paymentMilestoneCount } : {}),
            })

            if (purchaseResult.success) {
                Swal.close()
                // If free class, show success and refresh
                if (purchaseResult.isFree) {
                    // Refresh enrolled services from Firestore
                    const participantDoc = await getDoc(doc(db, 'participants', user.uid))
                    if (participantDoc.exists()) {
                        const data = participantDoc.data()
                        setEnrolledServices(data.enrolledClasses || [])
                    }

                    // Show success
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
                            window.location.href = '/profile'
                        } else {
                            window.location.reload()
                        }
                    })
                    return
                }
                
                if (purchaseResult.redirectUrl) {
                    window.location.href = `/payments/process?orderId=${purchaseResult.orderId}&redirectUrl=${encodeURIComponent(purchaseResult.redirectUrl)}`
                } else {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Invoice Berhasil Dibuat',
                        html: `
                            <p><strong>${purchaseResult.message || 'Silakan hubungi admin untuk pembayaran.'}</strong></p>
                            <p class="small text-muted mb-0">Invoice: <strong>${purchaseResult.invoiceNumber || ''}</strong></p>
                        `,
                        confirmButtonText: 'Riwayat Pembayaran',
                        showCancelButton: true,
                        cancelButtonText: 'Tutup',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = '/payments-history'
                        } else {
                            window.location.reload()
                        }
                    })
                }
            } else if (purchaseResult.code === 'MILESTONE_IN_PROGRESS' && purchaseResult.purchaseOrderId) {
                Swal.close()
                await Swal.fire({
                    icon: 'info',
                    title: 'Lanjutkan pembayaran cicilan',
                    html:
                        `<p class="mb-2">${purchaseResult.error || 'Progres pembayaran cicilan Anda masih ada di tab Pembayaran (Profil).'}</p>` +
                        '<p class="small text-muted mb-0">Gunakan tombol di bawah untuk ke gateway, atau buka Profil → Pembayaran.</p>',
                    showCancelButton: true,
                    confirmButtonText: 'Ke payment gateway',
                    cancelButtonText: 'Tutup',
                    confirmButtonColor: '#3085d6',
                }).then(async (cont) => {
                    if (!cont.isConfirmed) return
                    await Swal.fire({
                        title: 'Memproses…',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading()
                        },
                    })
                    const { continueMilestonePurchase } = await import('@/actions/participants')
                    const next = await continueMilestonePurchase(purchaseResult.purchaseOrderId, {
                        baseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
                    })
                    Swal.close()
                    if (next.success && next.redirectUrl && next.orderId) {
                        window.location.href = `/payments/process?orderId=${encodeURIComponent(next.orderId)}&redirectUrl=${encodeURIComponent(next.redirectUrl)}`
                    } else {
                        await Swal.fire({
                            icon: next.success ? 'info' : 'error',
                            title: next.success ? 'Invoice' : 'Gagal',
                            text: next.error || next.message || 'Tidak dapat membuat pembayaran berikutnya.',
                        })
                    }
                })
            } else {
                Swal.close()
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

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="col-12">
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-transparent border-bottom pb-3">
                    <h5 className="card-title mb-0 fw-bold">Layanan/Kelas Tersedia</h5>
                </div>
                <div className="card-body p-4">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mb-0">Memuat kelas...</p>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center py-5">
                            <FiBook size={48} className="text-muted mb-3" />
                            <p className="text-muted mb-2">Belum ada kelas tersedia</p>
                            <p className="text-muted small mb-0">Silakan cek console browser untuk detail error (F12)</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {services.map((service) => (
                                <div key={service.id} className="col-lg-4 col-md-6">
                                    <div className="card border-0 shadow-sm h-100">
                                        <ServiceCardCover
                                            imageUrl={service.imageUrl}
                                            alt={service.name}
                                            height={200}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <div className="card-body p-4">
                                            <div className="mb-3">
                                                <span className="badge bg-soft-primary text-primary mb-2">
                                                    {service.category || 'Umum'}
                                                </span>
                                                <h5 
                                                    className="fw-bold mb-2" 
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => router.push(`/services/view/${service.id}`)}
                                                >
                                                    {service.name}
                                                </h5>
                                                <p className="text-muted small mb-3" style={{ 
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {service.description || 'Tidak ada deskripsi'}
                                                </p>
                                                <Link 
                                                    href={`/services/view/${service.id}`}
                                                    className="text-primary small text-decoration-none"
                                                >
                                                    Lihat Detail →
                                                </Link>
                                            </div>

                                            <div className="mb-3">
                                                {service.startDate && service.endDate ? (
                                                    <div className="d-flex align-items-center mb-2 small">
                                                        <FiCalendar className="text-muted me-2" size={16} />
                                                        <span className="text-muted">Periode:</span>
                                                        <span className="ms-2 fw-medium">
                                                            {(() => {
                                                                try {
                                                                    const start = typeof service.startDate === 'string' 
                                                                        ? new Date(service.startDate) 
                                                                        : (service.startDate?.seconds ? new Date(service.startDate.seconds * 1000) : new Date(service.startDate));
                                                                    const end = typeof service.endDate === 'string' 
                                                                        ? new Date(service.endDate) 
                                                                        : (service.endDate?.seconds ? new Date(service.endDate.seconds * 1000) : new Date(service.endDate));
                                                                    return `${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`;
                                                                } catch (e) {
                                                                    return '-';
                                                                }
                                                            })()}
                                                        </span>
                                                    </div>
                                                ) : service.duration ? (
                                                    <div className="d-flex align-items-center mb-2 small">
                                                        <FiCalendar className="text-muted me-2" size={16} />
                                                        <span className="text-muted">Durasi:</span>
                                                        <span className="ms-2 fw-medium">{service.duration}</span>
                                                    </div>
                                                ) : null}
                                                {service.capacity && (
                                                    <div className="d-flex align-items-center mb-2 small">
                                                        <FiUsers className="text-muted me-2" size={16} />
                                                        <span className="text-muted">Kapasitas:</span>
                                                        <span className="ms-2 fw-medium">{service.capacity} peserta</span>
                                                    </div>
                                                )}
                                                {service.instructor && (
                                                    <div className="d-flex align-items-center small">
                                                        <FiClock className="text-muted me-2" size={16} />
                                                        <span className="text-muted">Instruktur:</span>
                                                        <span className="ms-2 fw-medium">{service.instructor}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="border-top pt-3 d-flex align-items-center justify-content-between">
                                                <div>
                                                    <p className="text-muted small mb-0">Harga</p>
                                                    {(() => {
                                                        const t = getApplicablePriceTier(service)
                                                        const promoResult = getPromoDiscount(service, t.price, '', new Date())
                                                        const hasPromoCode = service.promo?.enabled && service.promo?.code && String(service.promo.code).trim() !== ''
                                                        if (t.isFree) {
                                                            return <h5 className="fw-bold mb-0 text-success">GRATIS</h5>
                                                        }
                                                        if (promoResult.applied) {
                                                            return (
                                                                <div>
                                                                    {promoResult.promoLabel && <span className="badge bg-success me-1 mb-1">{promoResult.promoLabel}</span>}
                                                                    <h5 className="fw-bold mb-0 text-primary">
                                                                        <s className="text-muted fw-normal small me-1">Rp {Number(t.price).toLocaleString('id-ID')}</s>
                                                                        Rp {Number(promoResult.finalPrice).toLocaleString('id-ID')}
                                                                        {t.label && <span className="text-muted small"> ({t.label})</span>}
                                                                    </h5>
                                                                </div>
                                                            )
                                                        }
                                                        if (hasPromoCode) {
                                                            return (
                                                                <div>
                                                                    <span className="badge bg-soft-warning text-warning small mb-1">Pakai kode promo</span>
                                                                    <h5 className="fw-bold mb-0 text-primary">
                                                                        Rp {Number(t.price).toLocaleString('id-ID')}
                                                                        {t.label && <span className="text-muted small"> ({t.label})</span>}
                                                                    </h5>
                                                                </div>
                                                            )
                                                        }
                                                        return (
                                                            <h5 className="fw-bold mb-0 text-primary">
                                                                Rp {Number(t.price).toLocaleString('id-ID')}
                                                                {t.label && <span className="text-muted small"> ({t.label})</span>}
                                                            </h5>
                                                        )
                                                    })()}
                                                </div>
                                                {isEnrolled(service.id) ? (
                                                    <span className="badge bg-soft-success text-success px-3 py-2">
                                                        Terdaftar
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEnroll(service)}
                                                        className="btn btn-primary"
                                                    >
                                                        <FiShoppingCart size={16} className="me-1" />
                                                        Daftar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ServicesContent

