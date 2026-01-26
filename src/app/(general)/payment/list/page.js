import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PaymentTable from '@/components/payment/PaymentTable'
import PaymentHeader from '@/components/payment/PaymentHeader'
import Footer from '@/components/shared/Footer'
import { getInvoices } from '@/actions/invoices'

const page = async () => {
    const invoices = await getInvoices();

    // Transform Firestore data to match Table expectation
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
                img: '' // Placeholder
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

    return (
        <>
            <PageHeader>
                <PaymentHeader />
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <PaymentTable data={tableData} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default page