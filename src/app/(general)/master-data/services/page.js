import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ServicesTable from '@/components/masterData/ServicesTable'
import { getServices } from '@/actions/masterData'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

const ServicesList = async () => {
    const services = await getServices();
    const safeServices = serializeForClient(services)

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <Link href="/master-data/services/create" className="btn btn-primary">
                        <FiPlus size={16} className='me-2' />
                        <span>Tambah Kelas/Event</span>
                    </Link>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-body">
                                <ServicesTable data={safeServices} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ServicesList
