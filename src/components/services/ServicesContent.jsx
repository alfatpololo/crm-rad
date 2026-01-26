'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { db } from '@/lib/firebase/config'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { FiBook, FiCalendar, FiClock, FiUsers, FiDollarSign, FiShoppingCart } from 'react-icons/fi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import Image from 'next/image'

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

            const isFree = service.isFree || parseFloat(service.price || 0) === 0
            
            // Show confirmation dialog
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
                            `<p class="mb-2">Harga: <strong class="text-primary">Rp ${parseFloat(service.price || 0).toLocaleString('id-ID')}</strong></p>
                             <p class="small text-muted mb-0">Setelah pembayaran berhasil, kelas akan otomatis ditambahkan ke akun Anda.</p>`
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

            // Show loading
            Swal.fire({
                title: 'Memproses...',
                text: 'Sedang membeli kelas...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })

            // Import purchaseClass action
            const { purchaseClass } = await import('@/actions/participants')
            
            const purchaseResult = await purchaseClass(service.id, service)

            if (purchaseResult.success) {
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
                
                // Check if payment redirect URL is available (Midtrans integration)
                if (purchaseResult.redirectUrl) {
                    // Redirect to Midtrans payment page via our payment process page
                    window.location.href = `/payments/process?orderId=${purchaseResult.orderId}&redirectUrl=${encodeURIComponent(purchaseResult.redirectUrl)}`
                } else if (purchaseResult.paymentToken) {
                    // If we have token but no redirect URL, use Snap popup
                    window.location.href = `/payments/process?orderId=${purchaseResult.orderId}`
                } else {
                    // Fallback: Direct enrollment (if no payment gateway)
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
                            <p><strong>Kelas berhasil dibeli!</strong></p>
                            <p class="mb-2">Kelas sekarang dapat Anda akses.</p>
                            <p class="small text-muted mb-0">Invoice: <strong>${purchaseResult.invoiceNumber}</strong></p>
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
                                        {service.imageUrl && (
                                            <div className="position-relative" style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                                                <Image
                                                    src={service.imageUrl}
                                                    alt={service.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                />
                                            </div>
                                        )}
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
                                                    {(service.isFree || parseFloat(service.price || 0) === 0) ? (
                                                        <h5 className="fw-bold mb-0 text-success">
                                                            GRATIS
                                                        </h5>
                                                    ) : (
                                                        <h5 className="fw-bold mb-0 text-primary">
                                                            Rp {parseFloat(service.price || 0).toLocaleString('id-ID')}
                                                        </h5>
                                                    )}
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

            {/* Enrolled Classes */}
            {enrolledServices.length > 0 && (
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-bottom pb-3">
                        <h5 className="card-title mb-0 fw-bold">Kelas Saya</h5>
                    </div>
                    <div className="card-body p-4">
                        <div className="row g-4">
                            {enrolledServices.map((enrolled, index) => (
                                <div key={index} className="col-lg-4 col-md-6">
                                    <div className="card border border-success h-100">
                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <h6 className="fw-bold mb-0">{enrolled.name || enrolled.title || `Kelas ${index + 1}`}</h6>
                                                <span className="badge bg-soft-success text-success">Aktif</span>
                                            </div>
                                            {enrolled.purchaseDate && (
                                                <p className="text-muted small mb-0">
                                                    Terdaftar: {new Date(enrolled.purchaseDate).toLocaleDateString('id-ID')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ServicesContent

