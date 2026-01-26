import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import InvoiceCreate from '@/components/payment/InvoiceCreate'
import { getServices, getProducts } from '@/actions/masterData'

const page = async () => {
  const services = await getServices();
  const products = await getProducts();
  const masterData = [
    ...services.map(s => ({ ...s, type: 'service' })),
    ...products.map(p => ({ ...p, type: 'product' }))
  ];

  return (
    <>
      <PageHeader>
        {/* <PaymentHeader /> */}
      </PageHeader>
      <div className='main-content'>
        <InvoiceCreate masterData={masterData} />
      </div>
    </>
  )
}

export default page