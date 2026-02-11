import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'
import CategoriesTable from '@/components/masterData/CategoriesTable'
import { getCategories } from '@/actions/masterData'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

const CategoriesList = async () => {
    const categories = await getCategories();
    const safeData = serializeForClient(categories)

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                    <Link href="/master-data/categories/create" className="btn btn-primary">
                        <FiPlus size={16} className='me-2' />
                        <span>Tambah Kategori</span>
                    </Link>
                </div>
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <div className="col-lg-12">
                        <div className="card">
                            <div className="card-body">
                                <CategoriesTable data={safeData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default CategoriesList



