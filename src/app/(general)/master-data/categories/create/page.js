import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import CategoryCreate from '@/components/masterData/CategoryCreate'

const CreateCategory = () => {
    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Tambah Kategori</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <CategoryCreate />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default CreateCategory



