import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import AttendanceScanner from '@/components/attendance/AttendanceScanner'

export const dynamic = 'force-dynamic'

const AttendanceScanPage = async () => {
    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Scan QR Code Kehadiran</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <AttendanceScanner />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default AttendanceScanPage



