import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import CertificationHistoryTable from '@/components/crm/CertificationHistoryTable'
import { getCertificationHistory } from '@/actions/crm'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

const CertificationHistoryPage = async () => {
    const result = await getCertificationHistory()
    const history = result.history || []
    const safeData = serializeForClient(history)

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Riwayat Ikut Sertifikasi</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <CertificationHistoryTable data={safeData} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default CertificationHistoryPage



