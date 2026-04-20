import React from 'react'
import { getProduct } from '@/actions/masterData'
import { notFound } from 'next/navigation'
import { serializeForClient } from '@/utils/serialization'
import EduvaltProductDetailsShell from '@/components/products/EduvaltProductDetailsShell'

export const dynamic = 'force-dynamic'

const ProductViewPage = async ({ params }) => {
    const { id } = params
    const product = await getProduct(id)

    if (!product) {
        notFound()
    }

    const safeProduct = serializeForClient(product)

    return <EduvaltProductDetailsShell product={safeProduct} />
}

export default ProductViewPage
