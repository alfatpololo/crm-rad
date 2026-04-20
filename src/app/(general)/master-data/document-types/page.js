import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import DocumentTypesContent from '@/components/masterData/DocumentTypesContent'
import { getRequiredDocumentTypes } from '@/actions/documentTypes'
import { serializeForClient } from '@/utils/serialization'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/actions/auth'

export const dynamic = 'force-dynamic'

export default async function DocumentTypesPage() {
    const user = await getSessionUser()
    if (!user || user.email !== 'admin@mail.com') redirect('/dashboard')

    const result = await getRequiredDocumentTypes()
    const types = result.types || []
    const safeTypes = serializeForClient(types)

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <span className="text-muted small">Jenis dokumen yang wajib diupload peserta setelah DP (per kelas)</span>
                </div>
            </PageHeader>
            <div className="main-content">
                <div className="row">
                    <div className="col-lg-8">
                        <DocumentTypesContent initialTypes={safeTypes} />
                    </div>
                </div>
            </div>
        </>
    )
}
