'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Swal from 'sweetalert2'
import { useAuth } from '@/context/AuthProvider'
import { getPaymentHistoryForProfile } from '@/actions/payments'

/**
 * Riwayat pembayaran peserta: cicilan berjalan + ringkasan + tabel invoice (Firestore).
 * @param {{ compact?: boolean }} props — compact=true: dipakai di tab Profil (max 10 baris, tanpa judul halaman)
 */
export default function ParticipantPaymentHistoryContent({ compact = false }) {
    const { user } = useAuth()
    const searchParams = useSearchParams()
    const highlightId = searchParams?.get('id') || null

    const [payments, setPayments] = useState([])
    const [milestoneOrders, setMilestoneOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
    })

    const load = async () => {
        if (!user?.email) {
            setLoading(false)
            return
        }
        try {
            const result = await getPaymentHistoryForProfile(user.email)
            const paymentsData = result.success && result.payments ? result.payments : []
            setPayments(paymentsData)

            const { listMyInProgressMilestoneOrders } = await import('@/actions/participants')
            const mileRes = await listMyInProgressMilestoneOrders()
            setMilestoneOrders(mileRes.success && mileRes.orders ? mileRes.orders : [])

            const total = paymentsData.reduce((sum, p) => sum + (parseFloat(p.grandTotal || p.amount) || 0), 0)
            const completed = paymentsData.filter(
                (p) => p.status === 'paid' || p.paymentStatus === 'settlement' || p.paymentStatus === 'capture'
            ).length
            const pending = paymentsData.filter(
                (p) => p.status === 'pending' || p.status === 'unpaid' || p.paymentStatus === 'pending'
            ).length
            setStats({ total, completed, pending })
        } catch (e) {
            console.error('ParticipantPaymentHistoryContent:', e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        load()
    }, [user])

    useEffect(() => {
        if (!highlightId || loading || !payments.length) return
        const t = window.setTimeout(() => {
            document.getElementById('invoice-highlight')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
        return () => window.clearTimeout(t)
    }, [highlightId, loading, payments])

    const handleContinueMilestone = async (purchaseOrderId) => {
        Swal.fire({
            title: 'Menyiapkan pembayaran…',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        })
        try {
            const { continueMilestonePurchase } = await import('@/actions/participants')
            const next = await continueMilestonePurchase(purchaseOrderId, {
                baseUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
            })
            Swal.close()
            if (next.success && next.redirectUrl && next.orderId) {
                window.location.href = `/payments/process?orderId=${encodeURIComponent(next.orderId)}&redirectUrl=${encodeURIComponent(next.redirectUrl)}`
                return
            }
            await Swal.fire({
                icon: 'warning',
                title: 'Tidak bisa lanjut ke gateway',
                text: next.error || next.message || 'Coba lagi atau hubungi admin.',
            })
        } catch (e) {
            Swal.close()
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: e?.message || 'Gagal melanjutkan pembayaran.',
            })
        }
    }

    const getStatusBadge = (status, paymentStatus) => {
        if (paymentStatus) {
            switch (paymentStatus.toLowerCase()) {
                case 'settlement':
                case 'capture':
                    return <span className="badge bg-soft-success text-success">Berhasil</span>
                case 'pending':
                    return <span className="badge bg-soft-warning text-warning">Pending</span>
                case 'deny':
                case 'cancel':
                case 'expire':
                case 'failure':
                    return <span className="badge bg-soft-danger text-danger">Gagal</span>
                default:
                    break
            }
        }
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'completed':
                return <span className="badge bg-soft-success text-success">Berhasil</span>
            case 'pending':
            case 'unpaid':
                return <span className="badge bg-soft-warning text-warning">Pending</span>
            case 'cancelled':
            case 'failed':
                return <span className="badge bg-soft-danger text-danger">Gagal</span>
            default:
                return <span className="badge bg-soft-secondary text-secondary">{status || 'Unknown'}</span>
        }
    }

    const formatDate = (timestamp) => {
        if (!timestamp) return '-'
        const date =
            typeof timestamp === 'string'
                ? new Date(timestamp)
                : timestamp?.seconds
                  ? new Date(timestamp.seconds * 1000)
                  : new Date(timestamp)
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const rows = compact ? payments.slice(0, 10) : payments

    const inner = (
        <>
            {milestoneOrders.length > 0 && (
                <div className="alert alert-warning border-0 shadow-sm mb-4" role="status">
                    <h6 className="fw-bold mb-3">Pembayaran cicilan kelas (belum lunas)</h6>
                    <div className="d-flex flex-column gap-3">
                        {milestoneOrders.map((ord) => {
                            const paid = ord.paidMilestoneCount ?? 0
                            const total = ord.milestoneCount || 1
                            const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0
                            return (
                                <div key={ord.id} className="border rounded p-3 bg-white">
                                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                                        <div>
                                            <div className="fw-semibold">{ord.serviceName}</div>
                                            <div className="small text-muted">
                                                Tahap {paid} dari {total} sudah lunas · Total kelas{' '}
                                                <strong>Rp {Number(ord.totalPrice || 0).toLocaleString('id-ID')}</strong>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary shrink-0"
                                            onClick={() => handleContinueMilestone(ord.id)}
                                        >
                                            Bayar tahap berikutnya
                                        </button>
                                    </div>
                                    <div className="progress" style={{ height: '8px' }}>
                                        <div
                                            className="progress-bar bg-success"
                                            role="progressbar"
                                            style={{ width: `${pct}%` }}
                                            aria-valuenow={pct}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        />
                                    </div>
                                    <p className="small text-muted mb-0 mt-2">
                                        Setelah semua tahap lunas, kelas akan muncul di tab Kelas Saya.
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1 small">Total nominal (invoice)</p>
                                    <h5 className="fw-bold mb-0">Rp {stats.total.toLocaleString('id-ID')}</h5>
                                </div>
                                <div className="bg-soft-primary p-3 rounded-circle">
                                    <span style={{ fontSize: '24px' }}>💰</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1 small">Berhasil</p>
                                    <h5 className="fw-bold mb-0">{stats.completed} Transaksi</h5>
                                </div>
                                <div className="bg-soft-success p-3 rounded-circle">
                                    <span style={{ fontSize: '24px' }}>✅</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1 small">Pending</p>
                                    <h5 className="fw-bold mb-0">{stats.pending} Transaksi</h5>
                                </div>
                                <div className="bg-soft-warning p-3 rounded-circle">
                                    <span style={{ fontSize: '24px' }}>⏳</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <h5 className="fw-bold mb-0">{compact ? 'Riwayat Pembayaran' : 'Semua invoice'}</h5>
                        {compact ? (
                            <Link href="/payments-history" className="btn btn-sm btn-light-primary">
                                Lihat semua
                            </Link>
                        ) : (
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => load()}>
                                Muat ulang
                            </button>
                        )}
                    </div>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : payments.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0">Invoice</th>
                                        <th className="border-0">Deskripsi</th>
                                        <th className="border-0">Tahap</th>
                                        <th className="border-0">Tanggal</th>
                                        <th className="border-0">Jumlah</th>
                                        <th className="border-0">Metode</th>
                                        <th className="border-0">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((payment) => {
                                        const isHi = highlightId && payment.id === highlightId
                                        const label =
                                            payment.items?.[0]?.name ||
                                            payment.serviceName ||
                                            payment.itemName ||
                                            'Pembayaran'
                                        const milestoneLabel =
                                            payment.isMilestoneInvoice && payment.milestoneTotalCount
                                                ? `${payment.milestoneIndex || '?'}/${payment.milestoneTotalCount}`
                                                : '—'
                                        return (
                                            <tr
                                                key={payment.id}
                                                className={isHi ? 'table-warning' : undefined}
                                                id={isHi ? 'invoice-highlight' : undefined}
                                            >
                                                <td>
                                                    <span className="text-primary fw-medium">
                                                        {payment.invoiceNumber || payment.orderId || payment.id?.substring(0, 8)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="text-truncate" style={{ maxWidth: compact ? 200 : 280 }}>
                                                        {label}
                                                    </div>
                                                </td>
                                                <td className="small text-muted">{milestoneLabel}</td>
                                                <td className="small text-muted">{formatDate(payment.createdAt)}</td>
                                                <td className="fw-medium">
                                                    Rp {parseFloat(payment.grandTotal || payment.amount || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="small">{payment.paymentMethod || '—'}</td>
                                                <td>{getStatusBadge(payment.status, payment.paymentStatus)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5 px-3">
                            <div style={{ fontSize: '48px' }} className="mb-3">
                                💳
                            </div>
                            <h6 className="fw-bold mb-2">Belum ada riwayat pembayaran</h6>
                            <p className="text-muted small mb-3">Invoice dari pembelian kelas/produk akan muncul di sini.</p>
                            <Link href="/services" className="btn btn-primary btn-sm">
                                Jelajahi kelas
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    )

    if (compact) {
        return <div className="tab-pane fade p-4" id="billingTab" role="tabpanel">{inner}</div>
    }

    return (
        <div className="col-12">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <p className="text-muted small mb-0">
                    Invoice dari sistem (kelas, produk, membership). Untuk cicilan, gunakan kartu kuning atau tombol di bawah.
                </p>
                <Link href="/profile" className="btn btn-sm btn-outline-secondary shrink-0">
                    Kembali ke profil
                </Link>
            </div>
            {inner}
        </div>
    )
}
