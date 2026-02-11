import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import CertificationPaymentsTable from '@/components/crm/CertificationPaymentsTable'
import { getCertificationPayments } from '@/actions/crm'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

const CertificationPaymentsPage = async () => {
    const result = await getCertificationPayments()
    const payments = result.payments || []
    const safeData = serializeForClient(payments)

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Riwayat Pembayaran Sertifikasi</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <CertificationPaymentsTable data={safeData} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default CertificationPaymentsPage



