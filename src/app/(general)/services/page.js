import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ServicesContent from '@/components/services/ServicesContent'

const page = () => {
  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
          {/* Header actions can be added here */}
        </div>
      </PageHeader>
      <div className='main-content'>
        <div className='row'>
          <ServicesContent />
        </div>
      </div>
      <Footer />
    </>
  )
}

export default page






