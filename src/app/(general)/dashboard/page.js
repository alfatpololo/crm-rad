import React, { Suspense } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PageHeaderDate from '@/components/shared/pageHeader/PageHeaderDate'
import { getSessionUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import DashboardData from './DashboardData'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const user = await getSessionUser()
    if (!user) {
        redirect('/authentication/login/cover?redirect=/dashboard')
    }

    const isAdmin = user.email === 'admin@mail.com'
    if (!isAdmin) {
        redirect('/profile')
    }

    return (
        <>
            <PageHeader>
                <PageHeaderDate />
            </PageHeader>
            <div className="main-content">
                <Suspense fallback={<DashboardSkeleton />}>
                    <DashboardData user={user} isAdmin />
                </Suspense>
            </div>
        </>
    )
}
