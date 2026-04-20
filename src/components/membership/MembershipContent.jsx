'use client'
import React, { useState } from 'react'
import { FiAward, FiCreditCard, FiCalendar } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

export default function MembershipContent({ membership, membershipTypes }) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState(null)
    const types = (membershipTypes || []).filter((t) => t.status === 'active')

    const isActive = membership?.endDate && new Date(membership.endDate) > new Date()

    const handlePerpanjang = async (type) => {
        setLoadingId(type.id)
        try {
            const { purchaseMembership } = await import('@/actions/participants')
            const result = await purchaseMembership(type.id, {
                name: type.name,
                price: type.price,
                durationMonths: type.durationMonths,
            }, { baseUrl: typeof window !== 'undefined' ? window.location.origin : undefined })
            if (result.success && result.redirectUrl) {
                window.location.href = `/payments/process?orderId=${result.orderId}&redirectUrl=${encodeURIComponent(result.redirectUrl)}`
                return
            }
            if (result.success) {
                await Swal.fire({ icon: 'success', title: 'Invoice Berhasil Dibuat', text: result.message || 'Silakan hubungi admin untuk pembayaran.' })
                router.refresh()
            } else {
                await Swal.fire({ icon: 'error', title: 'Gagal', text: result.error })
            }
        } catch (err) {
            await Swal.fire({ icon: 'error', title: 'Error', text: err.message })
        } finally {
            setLoadingId(null)
        }
    }

    return (
        <div className="col-12">
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-transparent border-bottom">
                    <h5 className="card-title mb-0 fw-bold">Membership Saya</h5>
                </div>
                <div className="card-body">
                    {membership && isActive ? (
                        <div className="d-flex align-items-center flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-2">
                                <div className="avatar-text bg-soft-success text-success rounded-circle p-3">
                                    <FiAward size={24} />
                                </div>
                                <div>
                                    <h6 className="mb-0">{membership.typeName}</h6>
                                    <small className="text-muted">
                                        Berlaku sampai: {new Date(membership.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </small>
                                </div>
                            </div>
                            <span className="badge bg-success">Aktif</span>
                        </div>
                    ) : membership && !isActive ? (
                        <div className="d-flex align-items-center flex-wrap gap-3">
                            <div>
                                <h6 className="mb-0 text-muted">{membership.typeName}</h6>
                                <small className="text-danger">Kadaluarsa</small>
                            </div>
                            <span className="badge bg-secondary">Kadaluarsa</span>
                        </div>
                    ) : (
                        <p className="text-muted mb-0">Anda belum memiliki membership. Pilih paket di bawah untuk berlangganan.</p>
                    )}
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-bottom">
                    <h5 className="card-title mb-0 fw-bold">Perpanjang / Beli Membership</h5>
                </div>
                <div className="card-body">
                    {types.length === 0 ? (
                        <p className="text-muted mb-0">Belum ada paket membership tersedia.</p>
                    ) : (
                        <div className="row g-4">
                            {types.map((type) => (
                                <div key={type.id} className="col-md-6 col-lg-4">
                                    <div className="card border h-100">
                                        <div className="card-body">
                                            <h6 className="fw-bold">{type.name}</h6>
                                            {type.description && <p className="text-muted small mb-2">{type.description}</p>}
                                            <p className="mb-2">
                                                <strong className="text-primary">Rp {Number(type.price).toLocaleString('id-ID')}</strong>
                                                <span className="text-muted small"> / {type.durationMonths} bulan</span>
                                            </p>
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm w-100"
                                                disabled={loadingId !== null}
                                                onClick={() => handlePerpanjang(type)}
                                            >
                                                {loadingId === type.id ? 'Memproses...' : 'Beli / Perpanjang'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
