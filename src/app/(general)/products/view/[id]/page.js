import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ProductViewContent from '@/components/products/ProductViewContent'
import { getProduct } from '@/actions/masterData'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

const ProductViewPage = async ({ params }) => {
    const { id } = params
    const product = await getProduct(id)

    if (!product) {
        notFound()
    }

    const safeProduct = serializeForClient(product)

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <Link href="/products" className="btn btn-light">
                        <FiArrowLeft size={16} className="me-2" />
                        Kembali
                    </Link>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <ProductViewContent product={safeProduct} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ProductViewPage
