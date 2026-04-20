'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PaymentProcessContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const redirectUrl = searchParams.get('redirectUrl')
    const orderId = searchParams.get('orderId')
    const [message, setMessage] = useState('Mengalihkan ke pembayaran…')

    useEffect(() => {
        if (redirectUrl) {
            try {
                window.location.href = decodeURIComponent(redirectUrl)
            } catch {
                setMessage('Link pembayaran tidak valid.')
            }
            return
        }
        if (orderId) {
            router.replace(`/payments/status?orderId=${encodeURIComponent(orderId)}`)
            return
        }
        router.replace('/')
    }, [redirectUrl, orderId, router])

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <p className="text-muted mb-0">{message}</p>
        </div>
    )
}
