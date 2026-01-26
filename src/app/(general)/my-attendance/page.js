import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import UserAttendanceContent from '@/components/attendance/UserAttendanceContent'

export const dynamic = 'force-dynamic'

const UserAttendancePage = () => {
    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <span style={{fontSize: '24px'}}>✓</span>
                    <h4 className="mb-0">Kehadiran Saya</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <UserAttendanceContent />
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default UserAttendancePage

