import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import MembershipTypesTable from '@/components/masterData/MembershipTypesTable'
import { getMembershipTypes } from '@/actions/masterData'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

export default async function MembershipTypesPage() {
    const list = await getMembershipTypes()
    const safeData = serializeForClient(list)
    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <Link href="/master-data/membership-types/create" className="btn btn-primary">
                        <FiPlus size={16} className="me-2" />
                        Tambah Tipe Membership
                    </Link>
                </div>
            </PageHeader>
            <div className="main-content">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-body">
                                <MembershipTypesTable data={safeData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
