import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ProductsTable from '@/components/masterData/ProductsTable'
import { getProducts } from '@/actions/masterData'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'

const ProductsList = async () => {
    const products = await getProducts();

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <Link href="/master-data/products/create" className="btn btn-primary">
                        <FiPlus size={16} className='me-2' />
                        <span>Add Product</span>
                    </Link>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-body">
                                <ProductsTable data={products} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ProductsList
