import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ServiceTypesTable from '@/components/masterData/ServiceTypesTable'
import { getServiceTypes } from '@/actions/masterData'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'

const ServiceTypesList = async () => {
    const serviceTypes = await getServiceTypes();

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <Link href="/master-data/service-types/create" className="btn btn-primary">
                        <FiPlus size={16} className='me-2' />
                        <span>Tambah Jenis Layanan</span>
                    </Link>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-body">
                                <ServiceTypesTable data={serviceTypes} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ServiceTypesList



