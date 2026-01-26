import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import InvoiceView from '@/components/payment/InvoiceView'
import { getInvoice } from '@/actions/invoices'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

const InvoiceViewPage = async ({ searchParams }) => {
  const invoiceId = searchParams?.id

  if (!invoiceId) {
    notFound()
  }

  const invoice = await getInvoice(invoiceId)

  if (!invoice) {
    notFound()
  }

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
          <h4 className="mb-0">Detail Invoice</h4>
        </div>
      </PageHeader>
      <div className='main-content container-lg'>
        <div className='row'>
          <InvoiceView invoice={invoice} />
        </div>
      </div>
      <Footer />
    </>
  )
}

export default InvoiceViewPage