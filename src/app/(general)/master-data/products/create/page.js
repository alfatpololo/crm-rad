import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ProductCreate from '@/components/masterData/ProductCreate'

const ProductCreatePage = () => {
    return (
        <>
            <PageHeader />
            <div className='main-content'>
                <ProductCreate />
            </div>
            <Footer />
        </>
    )
}

export default ProductCreatePage
