import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import AdminCertificatesContent from '@/components/certificates/AdminCertificatesContent'
import { getSessionUser } from '@/actions/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const AdminCertificatesPage = async () => {
    const user = await getSessionUser()
    
    // Check if user is admin
    if (!user || user.email !== 'admin@mail.com') {
        redirect('/authentication/login/minimal')
    }

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <span className="text-primary" style={{ fontSize: '22px' }}>
                        <i className="fas fa-certificate" aria-hidden />
                    </span>
                    <h4 className="mb-0">Manajemen Sertifikat</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <AdminCertificatesContent />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default AdminCertificatesPage

