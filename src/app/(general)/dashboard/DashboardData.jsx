import React from 'react'
import { unstable_cache } from 'next/cache'
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard'
import PaymentStatsChart from '@/components/dashboard/PaymentStatsChart'
import RecentParticipants from '@/components/dashboard/RecentParticipants'
import { getParticipantDashboard } from '@/actions/participantDashboard'
import { getAdminDashboardBundle } from '@/actions/adminDashboard'
import DashboardStats from '@/components/dashboard/DashboardStats'
import { serializeForClient } from '@/utils/serialization'

const getAdminDashboardBundleCached = unstable_cache(
    async (limit) => getAdminDashboardBundle(limit),
    ['admin-dashboard-bundle'],
    { revalidate: 60 }
)

export default async function DashboardData({ user, isAdmin }) {
    let stats = null
    let participantData = null
    let recentParticipants = []
    let paymentStats = null

    if (isAdmin) {
        const bundle = await getAdminDashboardBundleCached(10)
        stats = bundle.stats
        recentParticipants = bundle.recentParticipants
        paymentStats = bundle.paymentStats
        if (!stats) {
            stats = {
                revenue: 0,
                unpaid: 0,
                participants: 0,
                totalClasses: 0,
                totalInvoices: 0,
                pendingPayments: 0,
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
        participantData = await getParticipantDashboard(user)
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
                    totalPaid: 0,
                    totalUnpaid: 0,
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

    return isAdmin ? (
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
    )
}
