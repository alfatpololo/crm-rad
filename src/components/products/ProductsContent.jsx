'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { db } from '@/lib/firebase/config'
import { collection, getDocs } from 'firebase/firestore'
import { FiPackage, FiShoppingCart } from 'react-icons/fi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProductCardCover from '@/components/products/ProductCardCover'

const ProductsContent = () => {
    const { user } = useAuth()
    const router = useRouter()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'products'))
                const list = []
                snapshot.forEach((docSnap) => {
                    const data = docSnap.data()
                    const status = (data.status || '').toLowerCase().trim()
                    const isInactive = status === 'inactive' || status === 'tidak aktif' || status === 'nonaktif' || status === 'disabled'
                    if (isInactive) return

                    const productData = {
                        id: docSnap.id,
                        ...data,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).toISOString() : data.createdAt),
                        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt?.seconds ? new Date(data.updatedAt.seconds * 1000).toISOString() : data.updatedAt),
                    }
                    list.push(productData)
                })
                setProducts(list)
            } catch (error) {
                console.error('Error fetching products:', error)
                setProducts([])
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="col-12">
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-transparent border-bottom pb-3">
                    <h5 className="card-title mb-0 fw-bold">Merch</h5>
                </div>
                <div className="card-body p-4">
                    {products.length === 0 ? (
                        <div className="text-center py-5">
                            <FiPackage size={48} className="text-muted mb-3" />
                            <p className="text-muted mb-2">Belum ada produk tersedia</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {products.map((product) => {
                                const stock = product.stock != null ? parseInt(product.stock, 10) : null
                                const outOfStock = stock !== null && stock <= 0
                                return (
                                    <div key={product.id} className="col-lg-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <ProductCardCover
                                                imageUrl={product.imageUrl}
                                                alt={product.name}
                                                height={200}
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                            <div className="card-body p-4">
                                                <div className="mb-3">
                                                    <span className="badge bg-soft-primary text-primary mb-2">
                                                        {product.category || 'Merchandise'}
                                                    </span>
                                                    <h5
                                                        className="fw-bold mb-2"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => router.push(`/products/view/${product.id}`)}
                                                    >
                                                        {product.name}
                                                    </h5>
                                                    <p className="text-muted small mb-3" style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {product.description || 'Tidak ada deskripsi'}
                                                    </p>
                                                    <Link
                                                        href={`/products/view/${product.id}`}
                                                        className="text-primary small text-decoration-none"
                                                    >
                                                        Lihat Detail →
                                                    </Link>
                                                </div>
                                                <div className="border-top pt-3 d-flex align-items-center justify-content-between">
                                                    <div>
                                                        <p className="text-muted small mb-0">Harga</p>
                                                        <h5 className="fw-bold mb-0 text-primary">
                                                            Rp {Number(product.price || 0).toLocaleString('id-ID')}
                                                        </h5>
                                                        {stock !== null && (
                                                            <p className="small mb-0 mt-1 text-muted">
                                                                Stok: <span className={outOfStock ? 'text-danger fw-medium' : ''}>{stock}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Link
                                                        href={`/products/view/${product.id}`}
                                                        className="btn btn-primary"
                                                    >
                                                        <FiShoppingCart size={16} className="me-1" />
                                                        {outOfStock ? 'Habis' : 'Beli'}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductsContent
