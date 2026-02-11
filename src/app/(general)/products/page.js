import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ProductsContent from '@/components/products/ProductsContent'

const page = () => {
  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
          <span className="text-muted small">Merchandise &amp; produk fisik</span>
        </div>
      </PageHeader>
      <div className='main-content'>
        <div className='row'>
          <ProductsContent />
        </div>
      </div>
      <Footer />
    </>
  )
}

export default page
