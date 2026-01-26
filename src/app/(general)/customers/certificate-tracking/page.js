import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import CertificateTrackingTable from '@/components/crm/CertificateTrackingTable'
import { getCertificateTracking } from '@/actions/crm'

export const dynamic = 'force-dynamic'

const CertificateTrackingPage = async () => {
    const result = await getCertificateTracking()
    const certificates = result.certificates || []

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Tracking Sertifikat</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <CertificateTrackingTable data={certificates} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default CertificateTrackingPage



