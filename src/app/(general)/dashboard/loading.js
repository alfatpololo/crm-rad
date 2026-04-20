import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PageHeaderDate from '@/components/shared/pageHeader/PageHeaderDate'
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton'

export default function DashboardLoading() {
    return (
        <>
            <PageHeader>
                <PageHeaderDate />
            </PageHeader>
            <div className="main-content">
                <DashboardSkeleton />
            </div>
        </>
    )
}
