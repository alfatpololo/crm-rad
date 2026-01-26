import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ProductPaymentsTable from '@/components/crm/ProductPaymentsTable'
import { getProductPayments } from '@/actions/crm'

export const dynamic = 'force-dynamic'

const ProductPaymentsPage = async () => {
    const result = await getProductPayments()
    const payments = result.payments || []

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Riwayat Pembayaran Produk</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <ProductPaymentsTable data={payments} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ProductPaymentsPage



