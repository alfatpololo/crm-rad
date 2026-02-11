'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'
import { checkMidtransPaymentStatus, completePurchase } from '@/actions/payments'

export default function PaymentStatusContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')
    const statusParam = searchParams.get('status')
    const [paymentStatus, setPaymentStatus] = useState(null)
    const [loading, setLoading] = useState(true)
    const [verifyError, setVerifyError] = useState(null)
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        const verifyPayment = async () => {
            setVerifyError(null)
            if (!orderId) {
                Swal.fire('Error', 'Order ID tidak ditemukan', 'error').then(() => {
                    router.push('/services')
                })
                return
            }

            try {
                // Check payment status from Midtrans
                const result = await checkMidtransPaymentStatus(orderId)
                
                if (result.success) {
                    setPaymentStatus(result)
                    
                    // If payment is successful, complete the purchase
                    if (result.transactionStatus === 'settlement' || result.transactionStatus === 'capture') {
                        const completeResult = await completePurchase(orderId)

                        if (completeResult.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Pembayaran Berhasil!',
                                html: `
                                    <p>Terima kasih atas pembayaran Anda.</p>
                                    <p class="small text-muted mb-0">Kelas sekarang dapat Anda akses.</p>
                                `,
                                confirmButtonText: 'Lihat Kelas Saya',
                                showCancelButton: true,
                                cancelButtonText: 'Tutup',
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    router.push('/profile')
                                } else {
                                    router.push('/services')
                                }
                            })
                        } else {
                            setVerifyError(completeResult.error || 'Gagal menyelesaikan pembelian. Silakan coba lagi.')
                        }
                    } else if (result.transactionStatus === 'pending') {
                        Swal.fire({
                            icon: 'info',
                            title: 'Pembayaran Pending',
                            html: `
                                <p>Pembayaran Anda sedang diproses.</p>
                                <p class="small text-muted mb-0">Silakan selesaikan pembayaran sesuai instruksi yang diberikan.</p>
                            `,
                            confirmButtonText: 'OK',
                        })
                    } else if (result.transactionStatus === 'deny' || result.transactionStatus === 'cancel' || result.transactionStatus === 'expire') {
                        Swal.fire({
                            icon: 'error',
                            title: 'Pembayaran Gagal',
                            html: `
                                <p>Pembayaran gagal atau dibatalkan.</p>
                                <p class="small text-muted mb-0">Silakan coba lagi atau hubungi customer service.</p>
                            `,
                            confirmButtonText: 'Coba Lagi',
                            showCancelButton: true,
                            cancelButtonText: 'Kembali',
                        }).then((result) => {
                            if (result.isConfirmed) {
                                router.push('/services')
                            } else {
                                router.push('/services')
                            }
                        })
                    }
                } else {
                    const isNetworkError = (result.error || '').toLowerCase().includes('koneksi terganggu') || (result.error || '').toLowerCase().includes('fetch')
                    setVerifyError(result.error || 'Gagal memverifikasi pembayaran')
                    if (!isNetworkError) {
                        Swal.fire('Error', result.error || 'Gagal memverifikasi pembayaran', 'error')
                    }
                }
            } catch (error) {
                console.error('Error verifying payment:', error)
                const isNetworkError = error?.message?.toLowerCase().includes('fetch') || error?.name === 'TypeError'
                setVerifyError(isNetworkError ? 'Koneksi terganggu. Silakan coba lagi.' : 'Terjadi kesalahan saat memverifikasi pembayaran.')
                if (!isNetworkError) {
                    Swal.fire('Error', 'Terjadi kesalahan saat memverifikasi pembayaran', 'error')
                }
            } finally {
                setLoading(false)
            }
        }

        verifyPayment()
    }, [orderId, router, retryCount])

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Memverifikasi pembayaran...</p>
                </div>
            </div>
        )
    }

    if (verifyError) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center p-5">
                                <div className="mb-4">
                                    <i className="bi bi-wifi-off text-warning" style={{ fontSize: '4rem' }}></i>
                                </div>
                                <h4 className="fw-bold mb-3">Koneksi Terganggu</h4>
                                <p className="text-muted mb-4">{verifyError}</p>
                                <div className="d-flex gap-2 justify-content-center flex-wrap">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => {
                                            setVerifyError(null)
                                            setLoading(true)
                                            setRetryCount((c) => c + 1)
                                        }}
                                    >
                                        Coba Lagi
                                    </button>
                                    <Link href="/services" className="btn btn-outline-secondary">
                                        Kembali ke Layanan
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center p-5">
                            {paymentStatus?.transactionStatus === 'settlement' || paymentStatus?.transactionStatus === 'capture' ? (
                                <>
                                    <div className="mb-4">
                                        <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                                    </div>
                                    <h4 className="fw-bold mb-3">Pembayaran Berhasil!</h4>
                                    <p className="text-muted mb-4">
                                        Terima kasih atas pembayaran Anda. Kelas sekarang dapat Anda akses.
                                    </p>
                                    <div className="d-flex gap-2 justify-content-center">
                                        <Link href="/profile" className="btn btn-primary">
                                            Lihat Kelas Saya
                                        </Link>
                                        <Link href="/services" className="btn btn-outline-secondary">
                                            Kembali ke Layanan
                                        </Link>
                                    </div>
                                </>
                            ) : paymentStatus?.transactionStatus === 'pending' ? (
                                <>
                                    <div className="mb-4">
                                        <i className="bi bi-clock-fill text-warning" style={{ fontSize: '4rem' }}></i>
                                    </div>
                                    <h4 className="fw-bold mb-3">Pembayaran Pending</h4>
                                    <p className="text-muted mb-4">
                                        Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran sesuai instruksi.
                                    </p>
                                    <Link href="/payments-history" className="btn btn-primary">
                                        Lihat Status Pembayaran
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
                                    </div>
                                    <h4 className="fw-bold mb-3">Pembayaran Gagal</h4>
                                    <p className="text-muted mb-4">
                                        Pembayaran gagal atau dibatalkan. Silakan coba lagi.
                                    </p>
                                    <Link href="/services" className="btn btn-primary">
                                        Coba Lagi
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

