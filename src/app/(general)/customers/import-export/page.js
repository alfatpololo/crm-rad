import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import ImportExportContent from '@/components/crm/ImportExportContent'

export const dynamic = 'force-dynamic'

const ImportExportPage = async () => {
    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Import & Export Database Klien</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <ImportExportContent />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ImportExportPage



