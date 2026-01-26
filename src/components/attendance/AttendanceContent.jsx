'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { db } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { FiCheckCircle, FiXCircle, FiClock, FiCalendar, FiBook } from 'react-icons/fi'

const AttendanceContent = () => {
    const { user } = useAuth()
    const [attendanceHistory, setAttendanceHistory] = useState([])
    const [enrolledClasses, setEnrolledClasses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            try {
                const participantDoc = await getDoc(doc(db, 'participants', user.uid))
                if (participantDoc.exists()) {
                    const data = participantDoc.data()
                    setAttendanceHistory(data.attendanceHistory || [])
                    setEnrolledClasses(data.enrolledClasses || [])
                }
            } catch (error) {
                console.error('Error fetching attendance:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return <FiCheckCircle className="text-success" size={20} />
            case 'absent':
                return <FiXCircle className="text-danger" size={20} />
            case 'late':
                return <FiClock className="text-warning" size={20} />
            default:
                return <FiClock className="text-muted" size={20} />
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'present':
                return <span className="badge bg-soft-success text-success">Hadir</span>
            case 'absent':
                return <span className="badge bg-soft-danger text-danger">Tidak Hadir</span>
            case 'late':
                return <span className="badge bg-soft-warning text-warning">Terlambat</span>
            default:
                return <span className="badge bg-soft-info text-info">Pending</span>
        }
    }

    // Group attendance by class
    const attendanceByClass = {}
    attendanceHistory.forEach(record => {
        const className = record.className || record.class || 'Unknown'
        if (!attendanceByClass[className]) {
            attendanceByClass[className] = []
        }
        attendanceByClass[className].push(record)
    })

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
            {/* Summary Stats */}
            <div className="row mb-4">
                <div className="col-md-4 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted small mb-1">Total Kehadiran</p>
                                    <h4 className="fw-bold mb-0 text-success">
                                        {attendanceHistory.filter(a => a.status === 'present').length}
                                    </h4>
                                </div>
                                <FiCheckCircle className="text-success" size={32} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted small mb-1">Ketidakhadiran</p>
                                    <h4 className="fw-bold mb-0 text-danger">
                                        {attendanceHistory.filter(a => a.status === 'absent').length}
                                    </h4>
                                </div>
                                <FiXCircle className="text-danger" size={32} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <p className="text-muted small mb-1">Terlambat</p>
                                    <h4 className="fw-bold mb-0 text-warning">
                                        {attendanceHistory.filter(a => a.status === 'late').length}
                                    </h4>
                                </div>
                                <FiClock className="text-warning" size={32} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance by Class */}
            {Object.keys(attendanceByClass).length > 0 ? (
                Object.entries(attendanceByClass).map(([className, records]) => (
                    <div key={className} className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-transparent border-bottom pb-3">
                            <h5 className="card-title mb-0 fw-bold">
                                <FiBook className="me-2" />
                                {className}
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Tanggal</th>
                                            <th>Waktu</th>
                                            <th>Status</th>
                                            <th>Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map((record, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <FiCalendar className="text-muted me-2" size={16} />
                                                        <span>{record.date ? new Date(record.date).toLocaleDateString('id-ID') : '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="small text-muted">{record.time || '-'}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        {getStatusIcon(record.status)}
                                                        {getStatusBadge(record.status)}
                                                    </div>
                                                </td>
                                                <td className="small text-muted">{record.notes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4 text-center py-5">
                        <FiCalendar size={64} className="text-muted mb-3" />
                        <h5 className="fw-bold mb-2">Belum Ada Riwayat Kehadiran</h5>
                        <p className="text-muted mb-0">Riwayat kehadiran akan muncul setelah Anda mengikuti kelas</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AttendanceContent






