import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import AttendanceHistoryTable from '@/components/crm/AttendanceHistoryTable'
import { getAttendanceHistory } from '@/actions/crm'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

const AttendanceHistoryPage = async () => {
    const result = await getAttendanceHistory()
    const attendance = result.attendance || []
    const safeData = serializeForClient(attendance)

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Riwayat Kehadiran (RSVP)</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <AttendanceHistoryTable data={safeData} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default AttendanceHistoryPage



