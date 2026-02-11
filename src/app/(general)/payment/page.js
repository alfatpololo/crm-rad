import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import InvoiceManagement from '@/components/payment/InvoiceManagement'
import { getInvoices } from '@/actions/invoices'
import { getServices, getProducts } from '@/actions/masterData'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

const InvoicePage = async () => {
    const invoices = await getInvoices();
    const services = await getServices();
    const products = await getProducts();

    const masterData = [
        ...services.map(s => ({
            ...s,
            type: 'service',
            startDate: s.startDate instanceof Date ? s.startDate.toISOString() : s.startDate,
            endDate: s.endDate instanceof Date ? s.endDate.toISOString() : s.endDate,
            createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt,
            updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : s.updatedAt,
        })),
        ...products.map(p => ({
            ...p,
            type: 'product',
            createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
            updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
        }))
    ];

    const safeInvoices = serializeForClient(invoices || [])
    const safeMasterData = serializeForClient(masterData)

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Invoice</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <InvoiceManagement invoices={safeInvoices} masterData={safeMasterData} />
            </div>
            <Footer />
        </>
    )
}

export default InvoicePage

