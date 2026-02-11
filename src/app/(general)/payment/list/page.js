import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PaymentTable from '@/components/payment/PaymentTable'
import PaymentHeader from '@/components/payment/PaymentHeader'
import Footer from '@/components/shared/Footer'
import { getInvoices } from '@/actions/invoices'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

const page = async () => {
    const invoices = await getInvoices();

    const tableData = invoices.map(inv => {
        let statusContent = 'Unpaid';
        let statusColor = 'bg-soft-warning text-warning';

        if (inv.status === 'paid') {
            statusContent = 'Completed';
            statusColor = 'bg-soft-success text-success';
        } else if (inv.status === 'cancelled') {
            statusContent = 'Declined';
            statusColor = 'bg-soft-danger text-danger';
        }

        return {
            id: inv.id,
            invoice: inv.invoiceNumber || '#' + inv.id.substring(0, 6),
            client: {
                name: inv.participantName || 'Unknown',
                email: inv.participantEmail || '',
                img: ''
            },
            transaction: inv.transactionId || 'N/A',
            amount: `$${inv.total || 0} USD`,
            date: inv.createdAt ? new Date(inv.createdAt).toLocaleString() : '',
            status: {
                content: statusContent,
                color: statusColor
            }
        };
    });

    const safeData = serializeForClient(tableData)

    return (
        <>
            <PageHeader>
                <PaymentHeader />
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <PaymentTable data={safeData} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default page