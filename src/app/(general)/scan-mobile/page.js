import React from 'react'
import MobileScannerContent from '@/components/attendance/MobileScannerContent'
import { getSessionUser } from '@/actions/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const MobileScanPage = async () => {
    const user = await getSessionUser()
    
    // Check if user is admin
    if (!user || user.email !== 'admin@mail.com') {
        redirect('/authentication/login/minimal')
    }

    return (
        <div style={{ margin: 0, padding: 0 }}>
            <MobileScannerContent />
        </div>
    )
}

export default MobileScanPage

