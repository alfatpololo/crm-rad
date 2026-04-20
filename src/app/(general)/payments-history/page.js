import React, { Suspense } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import ParticipantPaymentHistoryContent from '@/components/payment/ParticipantPaymentHistoryContent'
import { getSessionUser } from '@/actions/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export const metadata = {
    title: 'Riwayat Pembayaran | PT. RAD Indonesia CRM',
    description: 'Invoice dan status pembayaran Anda.',
}

function PaymentHistoryFallback() {
    return (
        <div className="col-12">
            <div className="card border-0 shadow-sm">
                <div className="card-body py-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Memuat...</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default async function PaymentsHistoryPage() {
    const user = await getSessionUser()
    if (!user) {
        redirect('/authentication/login/cover?redirect=/payments-history')
    }

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Riwayat Pembayaran</h4>
                </div>
            </PageHeader>
            <div className="main-content">
                <div className="row">
                    <Suspense fallback={<PaymentHistoryFallback />}>
                        <ParticipantPaymentHistoryContent />
                    </Suspense>
                </div>
            </div>
        </>
    )
}
