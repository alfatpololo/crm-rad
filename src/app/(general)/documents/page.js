import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import DocumentsContent from '@/components/documents/DocumentsContent'
import { getParticipantDocumentsStatus } from '@/actions/participants'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/actions/auth'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

export default async function DocumentsPage() {
    const user = await getSessionUser()
    if (!user) redirect('/authentication/login/cover?redirect=/documents')

    const status = await getParticipantDocumentsStatus()
    const safeStatus = serializeForClient(status)

    return (
        <>
            <PageHeader />
            <div className="main-content">
                <DocumentsContent status={safeStatus} />
            </div>
        </>
    )
}
