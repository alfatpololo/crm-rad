'use client'

import React, { Suspense } from 'react'
import ParticipantPaymentHistoryContent from '@/components/payment/ParticipantPaymentHistoryContent'

function TabFallback() {
    return (
        <div className="tab-pane fade p-4" id="billingTab" role="tabpanel">
            <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    )
}

/**
 * @param {{ compact?: boolean, omitTabPaneWrapper?: boolean }} props — default compact=true (tab di profil CRM).
 */
const TabPaymentHistory = ({ compact = true, omitTabPaneWrapper = false }) => (
    <Suspense fallback={<TabFallback />}>
        <ParticipantPaymentHistoryContent compact={compact} omitTabPaneWrapper={omitTabPaneWrapper} />
    </Suspense>
)

export default TabPaymentHistory
