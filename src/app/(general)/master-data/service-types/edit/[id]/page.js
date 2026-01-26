import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ServiceTypeEdit from '@/components/masterData/ServiceTypeEdit'
import { getServiceType } from '@/actions/masterData'
import { notFound } from 'next/navigation'

const EditServiceType = async ({ params }) => {
    const serviceType = await getServiceType(params.id);

    if (!serviceType) {
        notFound();
    }

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Edit Jenis Layanan</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <ServiceTypeEdit serviceType={serviceType} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default EditServiceType



