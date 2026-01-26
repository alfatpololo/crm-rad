'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { db } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import Link from 'next/link'

const UserAttendanceContent = () => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [attendanceHistory, setAttendanceHistory] = useState([])
    const [enrolledClasses, setEnrolledClasses] = useState([])

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

    const getClassInfo = (serviceId) => {
        return enrolledClasses.find(cls => cls.id === serviceId || cls.serviceId === serviceId)
    }

    const attendedClasses = attendanceHistory.filter(att => att.status === 'attended')
    const attendedIds = attendedClasses.map(att => att.serviceId || att.eventId)
    const notAttendedClasses = enrolledClasses.filter(cls => 
        !attendedIds.includes(cls.id) && !attendedIds.includes(cls.serviceId)
    )

    if (loading) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-3 mb-0">Memuat data kehadiran...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
                {/* Summary Stats */}
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="card border-0 bg-success text-white">
                            <div className="card-body p-3">
                                <h3 className="mb-0">{attendedClasses.length}</h3>
                                <small>✓ Sudah Hadir</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 bg-warning text-white">
                            <div className="card-body p-3">
                                <h3 className="mb-0">{notAttendedClasses.length}</h3>
                                <small>⏳ Belum Hadir</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 bg-primary text-white">
                            <div className="card-body p-3">
                                <h3 className="mb-0">{enrolledClasses.length}</h3>
                                <small>📚 Total Kelas</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attended Classes */}
                <div className="mb-4">
                    <h5 className="fw-bold mb-3">✓ Sudah Hadir ({attendedClasses.length})</h5>
                    {attendedClasses.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Kelas</th>
                                        <th>Tanggal Hadir</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendedClasses.map((att, index) => {
                                        const classInfo = getClassInfo(att.serviceId || att.eventId)
                                        return (
                                            <tr key={index}>
                                                <td>
                                                    <div className="fw-bold">{att.serviceName || classInfo?.name || 'Unknown'}</div>
                                                    {classInfo?.category && (
                                                        <small className="text-muted">{classInfo.category}</small>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="small">
                                                        {att.attendedDate 
                                                            ? new Date(att.attendedDate.seconds * 1000 || att.attendedDate).toLocaleString('id-ID')
                                                            : '-'}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge bg-success">✓ Hadir</span>
                                                </td>
                                                <td>
                                                    <Link 
                                                        href={`/services/view/${att.serviceId || att.eventId}`}
                                                        className="btn btn-sm btn-light-primary"
                                                    >
                                                        Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="alert alert-info">
                            <small>Belum ada kehadiran tercatat. Tunjukkan QR Code Anda ke panitia saat check-in.</small>
                        </div>
                    )}
                </div>

                {/* Not Attended Classes */}
                <div>
                    <h5 className="fw-bold mb-3">⏳ Belum Hadir ({notAttendedClasses.length})</h5>
                    {notAttendedClasses.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Kelas</th>
                                        <th>Tanggal Daftar</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notAttendedClasses.map((cls, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="fw-bold">{cls.name || cls.title || 'Unknown'}</div>
                                                {cls.category && (
                                                    <small className="text-muted">{cls.category}</small>
                                                )}
                                            </td>
                                            <td>
                                                <div className="small">
                                                    {cls.purchaseDate 
                                                        ? new Date(cls.purchaseDate).toLocaleDateString('id-ID')
                                                        : '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-warning">⏳ Belum Hadir</span>
                                            </td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Link 
                                                        href={`/qr-code/${cls.id || cls.serviceId}`}
                                                        className="btn btn-sm btn-success"
                                                        title="Tampilkan QR Code"
                                                    >
                                                        📱 QR Code
                                                    </Link>
                                                    <Link 
                                                        href={`/services/view/${cls.id || cls.serviceId}`}
                                                        className="btn btn-sm btn-light-primary"
                                                    >
                                                        Detail
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="alert alert-success">
                            <small>✓ Semua kelas sudah hadir!</small>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserAttendanceContent

