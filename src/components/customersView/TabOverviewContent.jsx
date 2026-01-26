'use client'
import React, { useEffect, useState } from 'react'
// import { FiBook, FiClock, FiQrCode } from 'react-icons/fi'
import { useAuth } from '@/context/AuthProvider'
import { db } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import Link from 'next/link'

const TabOverviewContent = () => {
    const { user } = useAuth()
    const [enrolledClasses, setEnrolledClasses] = useState([])
    const [attendanceHistory, setAttendanceHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEnrolledClasses = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            try {
                const participantDoc = await getDoc(doc(db, 'participants', user.uid))
                if (participantDoc.exists()) {
                    const data = participantDoc.data()
                    setEnrolledClasses(data.enrolledClasses || [])
                    setAttendanceHistory(data.attendanceHistory || [])
                }
            } catch (error) {
                console.error('Error fetching enrolled classes:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchEnrolledClasses()
    }, [user])

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="badge bg-soft-success text-success">Aktif</span>
            case 'enrolled':
                return <span className="badge bg-soft-success text-success">Terdaftar & Aktif</span>
            case 'completed':
                return <span className="badge bg-soft-info text-info">Selesai</span>
            case 'pending_payment':
                return <span className="badge bg-soft-warning text-warning">Menunggu Pembayaran</span>
            default:
                return <span className="badge bg-soft-primary text-primary">Terdaftar</span>
        }
    }

    const getAttendanceStatus = (classId) => {
        const attendance = attendanceHistory.find(att => 
            (att.serviceId === classId || att.eventId === classId) && att.status === 'attended'
        )
        return attendance
    }

    return (
        <div
            className="tab-pane fade show active p-4"
            id="overviewTab"
            role="tabpanel"
        >
            {/* Enrolled Classes Section */}
            <div className="mb-5">
                <div className="mb-4 d-flex align-items-center justify-content-between">
                    <h5 className="fw-bold mb-0">Kelas Saya</h5>
                    <Link href="/services" className="btn btn-sm btn-primary">
                        📚 Jelajahi Kelas
                    </Link>
                </div>
                
                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : enrolledClasses.length > 0 ? (
                    <div className="row g-3">
                        {enrolledClasses.map((cls, index) => {
                            const classId = cls.id || cls.serviceId
                            const attendance = getAttendanceStatus(classId)
                            
                            return (
                            <div key={index} className="col-12">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-start justify-content-between mb-3">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <h6 className="fw-bold mb-0">{cls.name || cls.title || `Kelas ${index + 1}`}</h6>
                                                    {attendance && (
                                                        <span className="badge bg-success" title="Sudah Hadir">
                                                            ✓ Hadir
                                                        </span>
                                                    )}
                                                </div>
                                                {cls.description && (
                                                    <p className="text-muted small mb-2">{cls.description}</p>
                                                )}
                                                <div className="d-flex flex-wrap gap-3 mb-2">
                                                    {cls.category && (
                                                        <span className="badge bg-soft-primary text-primary">
                                                            {cls.category}
                                                        </span>
                                                    )}
                                                    {cls.duration && (
                                                        <span className="small text-muted">
                                                            🕒 {cls.duration}
                                                        </span>
                                                    )}
                                                    {cls.instructor && (
                                                        <span className="small text-muted">
                                                            Instruktur: {cls.instructor}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                {getStatusBadge(cls.status)}
                                            </div>
                                        </div>
                                        
                                        {attendance && (
                                            <div className="alert alert-success mb-3 py-2" style={{ fontSize: '13px' }}>
                                                <strong>✓ Kehadiran Tercatat</strong>
                                                <br />
                                                <small className="text-muted">
                                                    {attendance.attendedDate 
                                                        ? new Date(attendance.attendedDate.seconds * 1000 || attendance.attendedDate).toLocaleString('id-ID')
                                                        : 'Sudah absen'}
                                                </small>
                                            </div>
                                        )}
                                        
                                        <div className="border-top pt-3">
                                            <div className="row g-3">
                                                <div className="col-md-3">
                                                    <div className="small text-muted">Harga</div>
                                                    <div className="fw-bold text-primary">
                                                        Rp {parseFloat(cls.price || 0).toLocaleString('id-ID')}
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="small text-muted">Tanggal Daftar</div>
                                                    <div className="small">
                                                        {cls.purchaseDate ? new Date(cls.purchaseDate).toLocaleDateString('id-ID') : '-'}
                                                    </div>
                                                </div>
                                                {cls.invoiceNumber && (
                                                    <div className="col-md-3">
                                                        <div className="small text-muted">Invoice</div>
                                                        <div className="small">
                                                            <Link href="/payments-history" className="text-primary text-decoration-none">
                                                                {cls.invoiceNumber}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="col-md-3 text-end">
                                                    <div className="d-flex gap-2 justify-content-end">
                                                        <Link 
                                                            href={`/qr-code/${cls.id || cls.serviceId}`} 
                                                            className="btn btn-sm btn-light-primary"
                                                            title="Tampilkan QR Code"
                                                        >
                                                            📱
                                                        </Link>
                                                        <Link href={`/services/view/${cls.id || cls.serviceId}`} className="btn btn-sm btn-light-primary">
                                                            Detail
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )})}
                    </div>
                ) : (
                    <div className="text-center py-5 border rounded-3 bg-light">
                        <div style={{fontSize: '48px'}} className="mb-3">📚</div>
                        <h6 className="fw-bold mb-2">Belum Ada Kelas</h6>
                        <p className="text-muted small mb-3">Anda belum terdaftar di kelas manapun</p>
                        <Link href="/services" className="btn btn-primary btn-sm">
                            📚 Jelajahi Kelas
                        </Link>
                    </div>
                )}
            </div>
        </div>

    )
}

export default TabOverviewContent
