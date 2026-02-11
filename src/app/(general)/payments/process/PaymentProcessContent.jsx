'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import Swal from 'sweetalert2'

export default function PaymentProcessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [snapToken, setSnapToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState(null)
    const [retryCount, setRetryCount] = useState(0)
    const orderId = searchParams.get('orderId')
    const redirectUrl = searchParams.get('redirectUrl')

    // Determine Midtrans environment
    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
    const snapScriptUrl = isProduction
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js'

    useEffect(() => {
        if (redirectUrl) {
            // Direct redirect to Midtrans payment page
            window.location.href = redirectUrl
            return
        }

        if (!orderId) {
            Swal.fire('Error', 'Order ID tidak ditemukan', 'error').then(() => {
                router.push('/services')
            })
            return
        }

        const maxAttempts = 3
        const fetchPaymentToken = async (attempt = 1) => {
            if (attempt === 1) setLoadError(null)
            try {
                const response = await fetch(`/api/payments/token?orderId=${orderId}`)
                const data = await response.json()

                if (data.success && data.token) {
                    setSnapToken(data.token)
                    return
                }
                throw new Error(data.error || 'Gagal memuat token pembayaran')
            } catch (error) {
                console.error('Error fetching payment token:', error)
                const isNetworkError = error?.message === 'Failed to fetch' || error?.name === 'TypeError'
                if (isNetworkError && attempt < maxAttempts) {
                    await new Promise((r) => setTimeout(r, 1000 * attempt))
                    return fetchPaymentToken(attempt + 1)
                }
                setLoadError(
                    isNetworkError || error?.message?.toLowerCase().includes('fetch')
                        ? 'Koneksi terganggu. Silakan coba lagi.'
                        : (error?.message || 'Gagal memuat halaman pembayaran')
                )
            } finally {
                setLoading(false)
            }
        }

        fetchPaymentToken()
    }, [orderId, redirectUrl, router, retryCount])

    const handleSnapScriptLoad = () => {
        if (window.snap && snapToken) {
            window.snap.pay(snapToken, {
                onSuccess: function(result) {
                    console.log('Payment success:', result)
                    router.push(`/payments/status?orderId=${orderId}&status=success`)
                },
                onPending: function(result) {
                    console.log('Payment pending:', result)
                    router.push(`/payments/status?orderId=${orderId}&status=pending`)
                },
                onError: function(result) {
                    console.log('Payment error:', result)
                    router.push(`/payments/status?orderId=${orderId}&status=error`)
                },
                onClose: function() {
                    console.log('Payment popup closed')
                    router.push(`/payments/status?orderId=${orderId}&status=cancelled`)
                }
            })
        }
    }

    // If redirectUrl is provided, redirect directly
    if (redirectUrl) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Mengarahkan ke halaman pembayaran...</p>
                </div>
            </div>
        )
    }

    return (
        <>
            {!isProduction && (
                <div className="alert alert-warning rounded-0 mb-0 border-0 shadow-sm" role="alert" style={{ fontSize: '13px' }}>
                    <strong>Mode uji (Sandbox).</strong> QRIS / GoPay / OVO yang muncul <strong>tidak bisa dibayar dengan aplikasi e-wallet asli</strong>. Untuk testing, gunakan simulator Midtrans atau aktivasi akun Production untuk pembayaran sungguhan.
                </div>
            )}
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    {loading ? (
                        <>
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p>Memuat halaman pembayaran...</p>
                        </>
                    ) : snapToken ? (
                        <>
                            <div className="spinner-border text-primary mb-3" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p>Membuka halaman pembayaran...</p>
                        </>
                    ) : loadError ? (
                        <div className="text-center">
                            <p className="text-danger mb-3">{loadError}</p>
                            <div className="d-flex gap-2 justify-content-center flex-wrap">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setLoadError(null)
                                        setLoading(true)
                                        setRetryCount((c) => c + 1)
                                    }}
                                >
                                    Coba Lagi
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => router.push('/services')}
                                >
                                    Kembali ke Layanan
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p>Gagal memuat token pembayaran</p>
                    )}
                </div>
            </div>

            {/* Load Midtrans Snap Script */}
            {snapToken && (
                <Script
                    src={snapScriptUrl}
                    data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                    onLoad={handleSnapScriptLoad}
                    onError={() => {
                        Swal.fire('Error', 'Gagal memuat payment gateway', 'error')
                        router.push('/services')
                    }}
                />
            )}
        </>
    )
}

