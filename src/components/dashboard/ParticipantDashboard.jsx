import React from 'react'
import ParticipantDashboardStats from './ParticipantDashboardStats'
import { FiBook, FiDollarSign, FiCalendar } from 'react-icons/fi'
import Link from 'next/link'

const ParticipantDashboard = ({ data }) => {
    // Handle null or missing data
    if (!data) {
        return (
            <div className="col-12">
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4 text-center py-5">
                        <h5 className="fw-bold mb-2">Selamat Datang!</h5>
                        <p className="text-muted mb-3">Profil Anda sedang dimuat...</p>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const { stats = {}, enrolledClasses = [], recentInvoices = [] } = data

    return (
        <>
            {/* Stats */}
            <div className='row'>
                <ParticipantDashboardStats stats={stats} />
            </div>

            {/* Enrolled Classes & Recent Invoices */}
            <div className='row'>
                {/* Enrolled Classes */}
                <div className="col-xxl-8 col-xl-6 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-transparent border-bottom pb-3 d-flex align-items-center justify-content-between">
                            <h5 className="card-title mb-0 fw-bold">Kelas Saya</h5>
                            <Link href="/services" className="btn btn-sm btn-primary">Lihat Semua</Link>
                        </div>
                        <div className="card-body p-4">
                            {enrolledClasses && enrolledClasses.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Nama Kelas</th>
                                                <th>Status</th>
                                                <th>Tanggal Daftar</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enrolledClasses.slice(0, 5).map((cls, index) => (
                                                <tr key={index}>
                                                    <td className="fw-medium">{cls.name || cls.title || `Kelas ${index + 1}`}</td>
                                                    <td>
                                                        <span className="badge bg-soft-primary text-primary">Terdaftar</span>
                                                    </td>
                                                    <td className="small text-muted">
                                                        {cls.purchaseDate ? new Date(cls.purchaseDate).toLocaleDateString('id-ID') : '-'}
                                                    </td>
                                                    <td>
                                                        <Link href={`/services/view/${cls.id || cls.serviceId || index}`} className="btn btn-sm btn-light-primary">
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
                                    <FiBook size={48} className="text-muted mb-3" />
                                    <p className="text-muted mb-0">Anda belum terdaftar di kelas manapun</p>
                                    <Link href="/services" className="btn btn-primary mt-3">Jelajahi Kelas</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="col-xxl-4 col-xl-6 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-transparent border-bottom pb-3 d-flex align-items-center justify-content-between">
                            <h5 className="card-title mb-0 fw-bold">Tagihan Terbaru</h5>
                            <Link href="/payments-history" className="btn btn-sm btn-primary">Lihat Semua</Link>
                        </div>
                        <div className="card-body p-4">
                            {recentInvoices && recentInvoices.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {recentInvoices.map((invoice) => (
                                        <div key={invoice.id} className="list-group-item px-0 py-3 border-bottom">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <h6 className="fw-bold mb-1 small">{invoice.invoiceNumber}</h6>
                                                    <p className="text-muted small mb-0">
                                                        {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('id-ID') : '-'}
                                                    </p>
                                                </div>
                                                <span className={`badge ${
                                                    invoice.status === 'paid' ? 'bg-soft-success text-success' :
                                                    invoice.status === 'pending' ? 'bg-soft-warning text-warning' :
                                                    'bg-soft-danger text-danger'
                                                }`}>
                                                    {invoice.status || 'pending'}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-bold">Rp {parseFloat(invoice.grandTotal || 0).toLocaleString('id-ID')}</span>
                                                <Link href={`/payments-history?id=${invoice.id}`} className="btn btn-sm btn-light">
                                                    Detail
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <FiDollarSign size={48} className="text-muted mb-3" />
                                    <p className="text-muted mb-0">Belum ada tagihan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ParticipantDashboard

