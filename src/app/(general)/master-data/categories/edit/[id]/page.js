import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import CategoryEdit from '@/components/masterData/CategoryEdit'
import { getCategory } from '@/actions/masterData'
import { notFound } from 'next/navigation'

const EditCategory = async ({ params }) => {
    const category = await getCategory(params.id);

    if (!category) {
        notFound();
    }

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <h4 className="mb-0">Edit Kategori</h4>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <CategoryEdit category={category} />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default EditCategory



