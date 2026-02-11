import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import MembershipTypeCreate from '@/components/masterData/MembershipTypeCreate'

export default function CreateMembershipTypePage() {
    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Tambah Tipe Membership</h4>
                </div>
            </PageHeader>
            <div className="main-content">
                <div className="row">
                    <MembershipTypeCreate />
                </div>
            </div>
            <Footer />
        </>
    )
}
