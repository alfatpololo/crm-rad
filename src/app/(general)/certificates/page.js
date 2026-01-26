import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import CertificatesContent from '@/components/certificates/CertificatesContent'
import { getUserCertificates } from '@/actions/certificates'

export const dynamic = 'force-dynamic'

const CertificatesPage = async () => {
  const result = await getUserCertificates()
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
          <CertificatesContent initialCertificates={certificates} />
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CertificatesPage




