import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PageHeaderDate from '@/components/shared/pageHeader/PageHeaderDate'
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard'
import PaymentStatsChart from '@/components/dashboard/PaymentStatsChart'
import RecentParticipants from '@/components/dashboard/RecentParticipants'
import { getDashboardStats } from '@/actions/dashboard'
import { getParticipantDashboard } from '@/actions/participantDashboard'
import { getRecentParticipants, getPaymentStats } from '@/actions/adminDashboard'
import { getSessionUser } from '@/actions/auth'
import DashboardStats from '@/components/dashboard/DashboardStats'
import { serializeForClient } from '@/utils/serialization'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) {
    redirect('/authentication/login/cover?redirect=/dashboard')
  }

  const isAdmin = user.email === 'admin@mail.com'
  let stats = null
  let participantData = null
  let recentParticipants = []
  let paymentStats = null

  if (isAdmin) {
    stats = await getDashboardStats()
    recentParticipants = await getRecentParticipants(10)
    paymentStats = await getPaymentStats()
    if (!stats) {
      stats = {
        revenue: 'Rp 0',
        unpaid: 'Rp 0',
        participants: 0,
        totalClasses: 0,
        totalInvoices: 0,
        pendingPayments: 'Rp 0',
      }
    }
    if (!paymentStats) {
      paymentStats = {
        awaiting: 0,
        completed: 0,
        rejected: 0,
        revenue: 0,
        monthlyData: [],
      }
    }
  } else {
    participantData = await getParticipantDashboard()
    if (!participantData) {
      participantData = {
        participant: {
          name: user?.displayName || user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
          phone: '',
          enrolledClasses: 0,
          certificates: 0,
        },
        membership: null,
        stats: {
          totalClasses: 0,
          completedClasses: 0,
          certificates: 0,
          totalPaid: 'Rp 0',
          totalUnpaid: 'Rp 0',
        },
        recentInvoices: [],
        enrolledClasses: [],
      }
    }
  }

  const safeStats = serializeForClient(stats)
  const safePaymentStats = serializeForClient(paymentStats)
  const safeRecentParticipants = serializeForClient(recentParticipants)
  const safeParticipantData = serializeForClient(participantData)

  return (
    <>
      <PageHeader>
        <PageHeaderDate />
      </PageHeader>
      <div className="main-content">
        {isAdmin ? (
          <>
            <div className="row">
              <DashboardStats stats={safeStats} />
            </div>
            <div className="row">
              <PaymentStatsChart paymentStats={safePaymentStats} />
              <RecentParticipants participants={safeRecentParticipants} />
            </div>
          </>
        ) : (
          <ParticipantDashboard data={safeParticipantData} />
        )}
      </div>
    </>
  )
}
