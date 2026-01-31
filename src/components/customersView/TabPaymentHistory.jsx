'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { db } from '@/lib/firebase/config'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import Link from 'next/link'

const TabPaymentHistory = () => {
    const { user } = useAuth()
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0
    })

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            try {
                // Fetch payments from invoices collection
                const paymentsQuery = query(
                    collection(db, 'invoices'),
                    where('client.email', '==', user.email),
                    orderBy('createdAt', 'desc')
                )
                
                const paymentsSnapshot = await getDocs(paymentsQuery)
                const paymentsData = paymentsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))

                setPayments(paymentsData)

                // Calculate stats
                const total = paymentsData.reduce((sum, p) => sum + (parseFloat(p.grandTotal || p.amount) || 0), 0)
                const completed = paymentsData.filter(p => p.status === 'paid' || p.paymentStatus === 'settlement' || p.paymentStatus === 'capture').length
                const pending = paymentsData.filter(p => p.status === 'pending' || p.status === 'unpaid').length

                setStats({ total, completed, pending })
            } catch (error) {
                console.error('Error fetching payment history:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPaymentHistory()
    }, [user])

    const getStatusBadge = (status, paymentStatus) => {
        // Check payment status first (more specific)
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
            }
        }
        
        // Fallback to general status
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
        const date = timestamp?.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp)
        return date.toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="tab-pane fade p-4" id="billingTab" role="tabpanel">
            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="flex-grow-1">
                                    <p className="text-muted mb-1 small">Total Pembayaran</p>
                                    <h5 className="fw-bold mb-0">Rp {stats.total.toLocaleString('id-ID')}</h5>
                                </div>
                                <div className="bg-soft-primary p-3 rounded-circle">
                                    <span style={{fontSize: '24px'}}>💰</span>
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
                                    <span style={{fontSize: '24px'}}>✅</span>
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
                                    <span style={{fontSize: '24px'}}>⏳</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment History Table */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <div className="d-flex align-items-center justify-content-between">
                        <h5 className="fw-bold mb-0">Riwayat Pembayaran</h5>
                        <Link href="/payments-history" className="btn btn-sm btn-light-primary">
                            Lihat Semua
                        </Link>
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
                                        <th className="border-0">Kelas/Layanan</th>
                                        <th className="border-0">Tanggal</th>
                                        <th className="border-0">Jumlah</th>
                                        <th className="border-0">Metode</th>
                                        <th className="border-0">Status</th>
                                        <th className="border-0 text-end">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.slice(0, 10).map((payment) => (
                                        <tr key={payment.id}>
                                            <td>
                                                <Link href={`/payments-history`} className="text-primary fw-medium text-decoration-none">
                                                    {payment.invoiceNumber || payment.orderId || payment.id?.substring(0, 8)}
                                                </Link>
                                            </td>
                                            <td>
                                                <div className="text-truncate" style={{maxWidth: '200px'}}>
                                                    {payment.items?.[0]?.name || payment.serviceName || payment.itemName || 'Layanan'}
                                                </div>
                                            </td>
                                            <td className="small text-muted">{formatDate(payment.createdAt)}</td>
                                            <td className="fw-medium">Rp {parseFloat(payment.grandTotal || payment.amount || 0).toLocaleString('id-ID')}</td>
                                            <td className="small">{payment.paymentMethod || 'Midtrans'}</td>
                                            <td>{getStatusBadge(payment.status, payment.paymentStatus)}</td>
                                            <td className="text-end">
                                                <Link 
                                                    href={`/payments-history`}
                                                    className="btn btn-sm btn-light"
                                                    title="Detail"
                                                >
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <div style={{fontSize: '48px'}} className="mb-3">💳</div>
                            <h6 className="fw-bold mb-2">Belum Ada Riwayat Pembayaran</h6>
                            <p className="text-muted small mb-3">Anda belum melakukan transaksi pembayaran</p>
                            <Link href="/services" className="btn btn-primary btn-sm">
                                Jelajahi Kelas
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TabPaymentHistory
