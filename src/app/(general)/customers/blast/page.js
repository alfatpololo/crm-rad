import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import BlastPromoContent from '@/components/crm/BlastPromoContent'
import { getParticipantsForBlast } from '@/actions/crm'

export const dynamic = 'force-dynamic'

const BlastPromoPage = async () => {
    const result = await getParticipantsForBlast('all')
    const raw = result.participants || []
    const participants = raw.map(p => ({
        id: String(p?.id ?? ''),
        name: String(p?.name ?? ''),
        email: String(p?.email ?? ''),
        phone: p?.phone != null && p?.phone !== '' ? String(p.phone).trim() : (p?.phoneNumber != null && p?.phoneNumber !== '' ? String(p.phoneNumber).trim() : ''),
        enrolledClasses: Number(p?.enrolledClasses) || 0,
        completedClasses: Number(p?.completedClasses) || 0,
    }))

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Blast Promo</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <BlastPromoContent initialParticipants={participants} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default BlastPromoPage



