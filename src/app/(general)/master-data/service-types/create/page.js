import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ServiceTypeCreate from '@/components/masterData/ServiceTypeCreate'

const CreateServiceType = () => {
    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Tambah Jenis Layanan</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <ServiceTypeCreate />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default CreateServiceType



