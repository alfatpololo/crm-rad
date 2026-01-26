'use client'

import { Suspense } from 'react'
import PaymentStatusContent from './PaymentStatusContent'

export default function PaymentStatusPage() {
    return (
        <Suspense fallback={
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p>Memverifikasi pembayaran...</p>
                </div>
            </div>
        }>
            <PaymentStatusContent />
        </Suspense>
    )
}
