import CustomersHeader from '@/components/customers/CustomersHeader'
import CustomersTable from '@/components/customers/CustomersTable'
import Footer from '@/components/shared/Footer'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import React from 'react'
import { getParticipants } from '@/actions/participants'
import { customerListStatusOptions, customerListTagsOptions } from "@/utils/options"
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

const page = async () => {
    const participants = await getParticipants();

    const tableData = participants.map(p => ({
        id: p.id,
        customer: {
            name: p.name || 'Unknown',
            img: ''
        },
        email: p.email,
        group: {
            tags: customerListTagsOptions,
            defaultSelect: []
        },
        phone: p.phone,
        date: p.createdAt ? new Date(p.createdAt).toLocaleString() : '',
        status: {
            status: customerListStatusOptions,
            defaultSelect: p.status || 'active'
        }
    }));

    const safeData = serializeForClient(tableData)

    return (
        <>
            <PageHeader>
                <CustomersHeader />
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <CustomersTable data={safeData} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default page