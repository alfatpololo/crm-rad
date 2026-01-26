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

        // Fetch payment token from invoice
        const fetchPaymentToken = async () => {
            try {
                const response = await fetch(`/api/payments/token?orderId=${orderId}`)
                const data = await response.json()
                
                if (data.success && data.token) {
                    setSnapToken(data.token)
                } else {
                    throw new Error(data.error || 'Failed to get payment token')
                }
            } catch (error) {
                console.error('Error fetching payment token:', error)
                Swal.fire('Error', 'Gagal memuat halaman pembayaran', 'error').then(() => {
                    router.push('/services')
                })
            } finally {
                setLoading(false)
            }
        }

        fetchPaymentToken()
    }, [orderId, redirectUrl, router])

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

