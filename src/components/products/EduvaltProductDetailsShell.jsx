'use client'

import React from 'react'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import Layout from '@/eduvalt/components/layout/Layout'
import ProductViewContent from './ProductViewContent'

export default function EduvaltProductDetailsShell({ product }) {
  return (
    <Layout headerStyle={1} footerStyle={1} headerTransparent={false}>
      <div className="container py-4">
        <div className="mb-3">
          <Link href="/products" className="btn btn-light btn-sm">
            <FiArrowLeft size={16} className="me-2" />
            Kembali ke daftar produk
          </Link>
        </div>
        <div className="row">
          <ProductViewContent product={product} />
        </div>
      </div>
    </Layout>
  )
}

