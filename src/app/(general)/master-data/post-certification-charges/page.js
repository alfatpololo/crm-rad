import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import PostCertificationChargesContent from '@/components/masterData/PostCertificationChargesContent'
import { getPostCertificationCharges } from '@/actions/postCertificationCharges'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

export default async function PostCertificationChargesPage() {
    const list = await getPostCertificationCharges()
    const safeData = serializeForClient(list)
    return (
        <>
            <PageHeader>
                <div className="page-header-right-items-wrapper">
                    <span className="text-muted small">Tagihan yang muncul setelah peserta ikut acara batch sertifikasi (misal: Membership CMA Australia)</span>
                </div>
            </PageHeader>
            <div className="main-content">
                <PostCertificationChargesContent data={safeData} />
            </div>
            <Footer />
        </>
    )
}
