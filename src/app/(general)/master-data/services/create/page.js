import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ServiceCreate from '@/components/masterData/ServiceCreate'

const ServiceCreatePage = () => {
    return (
        <>
            <PageHeader />
            <div className='main-content'>
                <ServiceCreate />
            </div>
            <Footer />
        </>
    )
}

export default ServiceCreatePage
