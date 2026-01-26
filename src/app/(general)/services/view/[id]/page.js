import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ServiceViewContent from '@/components/services/ServiceViewContent'
import { getService } from '@/actions/masterData'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'

export const dynamic = 'force-dynamic'

const ServiceViewPage = async ({ params }) => {
    const { id } = params
    const service = await getService(id)

    if (!service) {
        notFound()
    }

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <Link href="/services" className="btn btn-light">
                        <FiArrowLeft size={16} className="me-2" />
                        Kembali
                    </Link>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <ServiceViewContent service={service} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ServiceViewPage



