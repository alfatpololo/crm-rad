import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import MembershipTypeEdit from '@/components/masterData/MembershipTypeEdit'
import { getMembershipType } from '@/actions/masterData'
import { notFound } from 'next/navigation'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

export default async function EditMembershipTypePage({ params }) {
    const { id } = params
    const membershipType = await getMembershipType(id)
    if (!membershipType) notFound()
    const safe = serializeForClient(membershipType)
    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Edit Tipe Membership</h4>
                </div>
            </PageHeader>
            <div className="main-content">
                <div className="row">
                    <MembershipTypeEdit membershipType={safe} />
                </div>
            </div>
            <Footer />
        </>
    )
}
