import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PageHeaderDate from '@/components/shared/pageHeader/PageHeaderDate'
import DuplicateLayout from './duplicateLayout'
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard'
import PaymentStatsChart from '@/components/dashboard/PaymentStatsChart'
import RecentParticipants from '@/components/dashboard/RecentParticipants'

import { getDashboardStats } from '@/actions/dashboard'
import { getParticipantDashboard } from '@/actions/participantDashboard'
import { getRecentParticipants, getPaymentStats } from '@/actions/adminDashboard'
import { getSessionUser } from '@/actions/auth'
import DashboardStats from '@/components/dashboard/DashboardStats'

export const dynamic = 'force-dynamic'

const Home = async () => {
  const user = await getSessionUser()
  const isAdmin = user?.email === 'admin@mail.com'
  
  let stats = null
  let participantData = null
  let recentParticipants = []
  let paymentStats = null

  if (isAdmin) {
    // Fetch admin dashboard data
    stats = await getDashboardStats()
    recentParticipants = await getRecentParticipants(10)
    paymentStats = await getPaymentStats()

    // Ensure stats has default values
    if (!stats) {
      stats = {
        revenue: 'Rp 0',
        unpaid: 'Rp 0',
        participants: 0,
        totalClasses: 0,
        totalInvoices: 0,
        pendingPayments: 'Rp 0'
      }
    }

    if (!paymentStats) {
      paymentStats = {
        awaiting: 0,
        completed: 0,
        rejected: 0,
        revenue: 0,
        monthlyData: []
      }
    }
  } else {
    participantData = await getParticipantDashboard()
    // Ensure participantData has default structure even if null
    if (!participantData) {
      participantData = {
        participant: {
          name: user?.displayName || user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
          phone: '',
          enrolledClasses: 0,
          certificates: 0,
        },
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

  return (
    <DuplicateLayout>
      <PageHeader>
        <PageHeaderDate />
      </PageHeader>
      <div className='main-content'>
        {isAdmin ? (
          <>
            <div className='row'>
              <DashboardStats stats={stats} />
            </div>
            <div className='row'>
              <PaymentStatsChart paymentStats={paymentStats} />
              <RecentParticipants participants={recentParticipants} />
            </div>
          </>
        ) : (
          <ParticipantDashboard data={participantData} />
        )}
      </div>
    </DuplicateLayout>
  )
}

export default Home