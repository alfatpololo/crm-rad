'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import { FiPackage, FiShoppingCart, FiTag } from 'react-icons/fi'
import { useAuth } from '@/context/AuthProvider'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ProductViewContent = ({ product }) => {
    const { user } = useAuth()
    const router = useRouter()
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(false)

    const stock = product.stock != null ? parseInt(product.stock, 10) : null
    const outOfStock = stock !== null && stock <= 0
    const maxQty = stock != null ? Math.min(stock, 999) : 999

    const handleBuy = async () => {
        if (!user) {
            await Swal.fire({
                icon: 'warning',
                title: 'Login Diperlukan',
                text: 'Silakan login terlebih dahulu untuk membeli produk',
                confirmButtonColor: '#198754',
            })
            router.push('/authentication/login/cover')
            return
        }

        if (outOfStock) {
            await Swal.fire({ icon: 'warning', title: 'Stok habis', text: 'Produk ini sedang tidak tersedia.' })
            return
        }

        const qty = Math.max(1, Math.min(quantity, maxQty))
        setLoading(true)

        try {
            const { purchaseProduct } = await import('@/actions/participants')
            const result = await purchaseProduct(product.id, product, { quantity: qty })

            if (result.success && result.redirectUrl) {
                window.location.href = `/payments/process?orderId=${result.orderId}&redirectUrl=${encodeURIComponent(result.redirectUrl)}`
                return
            }
            if (result.success) {
                await Swal.fire({ icon: 'success', title: 'Berhasil', text: result.message || 'Pembelian diproses.' })
                return
            }
            await Swal.fire({ icon: 'error', title: 'Gagal', text: result.error || 'Gagal membeli produk.' })
        } catch (error) {
            console.error('Error purchasing product:', error)
            await Swal.fire({ icon: 'error', title: 'Error', text: error.message || 'Terjadi kesalahan.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="col-lg-12">
            <div className="row">
                <div className="col-lg-8">
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between mb-3">
                                <div>
                                    <h2 className="mb-2">{product.name || 'Produk'}</h2>
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        {product.category && (
                                            <span className="badge bg-soft-primary text-primary">
                                                <FiTag className="me-1" />
                                                {product.category}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {product.imageUrl && (
                                <div className="mb-4">
                                    <div className="position-relative" style={{ width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name || 'Product'}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 800px"
                                        />
                                    </div>
                                </div>
                            )}

                            {product.description && (
                                <div className="mb-4">
                                    <h5 className="mb-3">Deskripsi</h5>
                                    <p className="text-muted" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card mb-4 sticky-top" style={{ top: '20px' }}>
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-3">
                                <div className="avatar-text avatar-lg bg-soft-primary text-primary rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiPackage size={24} />
                                </div>
                                <div>
                                    <p className="text-muted small mb-0">Harga</p>
                                    <h3 className="fw-bold mb-0">Rp {Number(product.price || 0).toLocaleString('id-ID')}</h3>
                                </div>
                            </div>

                            {stock !== null && (
                                <p className="text-muted small mb-3">
                                    Stok: <span className={outOfStock ? 'text-danger fw-bold' : 'fw-medium'}>{stock}</span>
                                </p>
                            )}

                            {!outOfStock && maxQty > 1 && (
                                <div className="mb-3">
                                    <label className="form-label small">Jumlah</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min={1}
                                        max={maxQty}
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, parseInt(e.target.value, 10) || 1)))}
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleBuy}
                                className="btn btn-primary w-100 btn-lg"
                                disabled={loading || outOfStock}
                            >
                                <FiShoppingCart size={20} className="me-2" />
                                {loading ? 'Memproses...' : outOfStock ? 'Stok habis' : 'Beli Sekarang'}
                            </button>

                            <Link href="/products" className="btn btn-light w-100 mt-2">
                                ← Kembali ke Daftar Produk
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductViewContent
