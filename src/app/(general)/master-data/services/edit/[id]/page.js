import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ServiceEdit from '@/components/masterData/ServiceEdit'
import { getService } from '@/actions/masterData'
import { notFound } from 'next/navigation'

const EditService = async ({ params }) => {
    const service = await getService(params.id);

    if (!service) {
        notFound();
    }

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Edit {service.type === 'event' ? 'Event' : 'Kelas'}</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <ServiceEdit service={service} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default EditService



