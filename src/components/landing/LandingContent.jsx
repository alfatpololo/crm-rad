'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiBook, FiPackage, FiCalendar, FiDollarSign } from 'react-icons/fi'
import { getApplicablePriceTier, getPromoDiscount } from '@/utils/servicePrice'

export default function LandingContent({ services = [], products = [] }) {
    const activeServices = services.filter((s) => {
        const status = (s.status || '').toLowerCase().trim()
        return !['inactive', 'tidak aktif', 'nonaktif', 'disabled'].includes(status)
    })
    const activeProducts = products.filter((p) => {
        const status = (p.status || '').toLowerCase().trim()
        return !['inactive', 'tidak aktif', 'nonaktif', 'disabled'].includes(status)
    })

    return (
        <main className="py-5">
            <div className="container">
                {/* Hero */}
                <section className="text-center py-4 mb-5">
                    <h1 className="fw-bold mb-2">Kelas & Merchandise</h1>
                    <p className="text-muted mb-0">
                        Daftar kelas atau beli produk. Login diperlukan saat checkout.
                    </p>
                </section>

                {/* Event / Kelas */}
                <section className="mb-5">
                    <h2 className="h4 fw-bold mb-4">
                        <FiBook className="me-2" />
                        Event / Kelas
                    </h2>
                    {activeServices.length === 0 ? (
                        <p className="text-muted">Belum ada event atau kelas.</p>
                    ) : (
                        <div className="row g-4">
                            {activeServices.slice(0, 6).map((service) => {
                                const t = getApplicablePriceTier(service)
                                const promoResult = getPromoDiscount(service, t.price, '', new Date())
                                const hasPromoCode = service.promo?.enabled && service.promo?.code && String(service.promo.code).trim() !== ''
                                return (
                                    <div key={service.id} className="col-lg-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            {service.imageUrl && (
                                                <div className="position-relative" style={{ height: '180px', overflow: 'hidden' }}>
                                                    <Image src={service.imageUrl} alt={service.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                                                </div>
                                            )}
                                            <div className="card-body">
                                                <span className="badge bg-soft-primary text-primary mb-2">{service.category || 'Umum'}</span>
                                                <h5 className="fw-bold mb-2">
                                                    <Link href={`/services/view/${service.id}`} className="text-dark text-decoration-none">
                                                        {service.name}
                                                    </Link>
                                                </h5>
                                                <p className="text-muted small mb-2" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {service.description || 'Tidak ada deskripsi'}
                                                </p>
                                                <div className="d-flex align-items-center justify-content-between mt-2">
                                                    {t.isFree ? (
                                                        <span className="fw-bold text-success">GRATIS</span>
                                                    ) : promoResult.applied ? (
                                                        <span>
                                                            <s className="text-muted small me-1">Rp {Number(t.price).toLocaleString('id-ID')}</s>
                                                            <span className="fw-bold text-primary">Rp {Number(promoResult.finalPrice).toLocaleString('id-ID')}</span>
                                                        </span>
                                                    ) : hasPromoCode ? (
                                                        <span className="fw-bold">Rp {Number(t.price).toLocaleString('id-ID')} <span className="badge bg-soft-warning text-warning small">Kode promo</span></span>
                                                    ) : (
                                                        <span className="fw-bold">Rp {Number(t.price).toLocaleString('id-ID')}</span>
                                                    )}
                                                    <Link href={`/services/view/${service.id}`} className="btn btn-sm btn-primary">
                                                        Lihat
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    {activeServices.length > 6 && (
                        <div className="text-center mt-3">
                            <Link href="/services" className="btn btn-outline-primary">Semua Kelas →</Link>
                        </div>
                    )}
                </section>

                {/* Produk */}
                <section>
                    <h2 className="h4 fw-bold mb-4">
                        <FiPackage className="me-2" />
                        Merchandise / Produk
                    </h2>
                    {activeProducts.length === 0 ? (
                        <p className="text-muted">Belum ada produk.</p>
                    ) : (
                        <div className="row g-4">
                            {activeProducts.slice(0, 6).map((product) => {
                                const outOfStock = product.stock != null && parseInt(product.stock, 10) <= 0
                                return (
                                    <div key={product.id} className="col-lg-4 col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            {product.imageUrl && (
                                                <div className="position-relative" style={{ height: '180px', overflow: 'hidden' }}>
                                                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                                                </div>
                                            )}
                                            <div className="card-body">
                                                <span className="badge bg-soft-secondary text-secondary mb-2">{product.category || 'Merchandise'}</span>
                                                <h5 className="fw-bold mb-2">
                                                    <Link href={`/products/view/${product.id}`} className="text-dark text-decoration-none">
                                                        {product.name}
                                                    </Link>
                                                </h5>
                                                <p className="text-muted small mb-2" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {product.description || 'Tidak ada deskripsi'}
                                                </p>
                                                <div className="d-flex align-items-center justify-content-between mt-2">
                                                    <span className="fw-bold">Rp {Number(product.price || 0).toLocaleString('id-ID')}</span>
                                                    <Link href={`/products/view/${product.id}`} className="btn btn-sm btn-primary" aria-disabled={outOfStock}>
                                                        {outOfStock ? 'Habis' : 'Lihat'}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    {activeProducts.length > 6 && (
                        <div className="text-center mt-3">
                            <Link href="/products" className="btn btn-outline-primary">Semua Produk →</Link>
                        </div>
                    )}
                </section>

                <footer className="text-center text-muted small py-5 border-top mt-5">
                    PT. RAD Indonesia · Login diperlukan untuk checkout
                </footer>
            </div>
        </main>
    )
}
