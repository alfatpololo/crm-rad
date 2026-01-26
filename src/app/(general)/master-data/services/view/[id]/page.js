import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ServiceDetailContent from '@/components/masterData/ServiceDetailContent'
import { getService } from '@/actions/masterData'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiEdit } from 'react-icons/fi'

export const dynamic = 'force-dynamic'

const ServiceDetailPage = async ({ params }) => {
    const { id } = params
    const service = await getService(id)

    if (!service) {
        notFound()
    }

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <Link href="/master-data/services" className="btn btn-light">
                        <FiArrowLeft size={16} className="me-2" />
                        Kembali
                    </Link>
                    <Link href={`/master-data/services/edit/${id}`} className="btn btn-primary">
                        <FiEdit size={16} className="me-2" />
                        Edit
                    </Link>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <ServiceDetailContent service={service} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ServiceDetailPage



