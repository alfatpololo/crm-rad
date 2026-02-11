import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import MembershipContent from '@/components/membership/MembershipContent'
import { getParticipantDashboard } from '@/actions/participantDashboard'
import { getMembershipTypes } from '@/actions/masterData'
import { getSessionUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

export default async function MembershipPage() {
  const user = await getSessionUser()
  if (!user) redirect('/authentication/login/cover?redirect=/membership')

  const [dashboardData, types] = await Promise.all([
    getParticipantDashboard(),
    getMembershipTypes(),
  ])
  const membership = dashboardData?.membership ?? null
  const safeMembership = serializeForClient(membership)
  const safeTypes = serializeForClient(types || [])

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
          <h4 className="mb-0">Membership</h4>
        </div>
      </PageHeader>
      <div className="main-content">
        <div className="row">
          <MembershipContent membership={safeMembership} membershipTypes={safeTypes} />
        </div>
      </div>
      <Footer />
    </>
  )
}
