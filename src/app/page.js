import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PageHeaderDate from '@/components/shared/pageHeader/PageHeaderDate'
import PaymentRecordChart from '@/components/widgetsCharts/PaymentRecordChart'
import LatestLeads from '@/components/widgetsTables/LatestLeads'
import DuplicateLayout from './duplicateLayout'
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard'

import { getDashboardStats } from '@/actions/dashboard'
import { getParticipantDashboard } from '@/actions/participantDashboard'
import { getSessionUser } from '@/actions/auth'
import DashboardStats from '@/components/dashboard/DashboardStats'

export const dynamic = 'force-dynamic'

const Home = async () => {
  const user = await getSessionUser()
  const isAdmin = user?.email === 'admin@mail.com'
  
  let stats = null
  let participantData = null

  if (isAdmin) {
    stats = await getDashboardStats()
    // Ensure stats has default values
    if (!stats) {
      stats = {
        revenue: 0,
        unpaid: 0,
        participants: 0,
        productsSold: 0
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
              <PaymentRecordChart />
              <LatestLeads title={"Peserta Terbaru"} />
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