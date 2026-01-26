'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { getParticipantsWithDetails, getAdminDashboardStats } from '@/actions/admin'
import Link from 'next/link'
import { FiUsers, FiBook, FiDollarSign, FiFileText, FiEye, FiTrendingUp } from 'react-icons/fi'
import { db } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import Image from 'next/image'

const AdminProfileContent = () => {
    const { user } = useAuth()
    const [profileData, setProfileData] = useState(null)
    const [stats, setStats] = useState(null)
    const [participants, setParticipants] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return

            try {
                // Fetch admin profile
                let userDoc = await getDoc(doc(db, 'users', user.uid))
                if (!userDoc.exists()) {
                    userDoc = await getDoc(doc(db, 'participants', user.uid))
                }

                if (userDoc.exists()) {
                    const data = userDoc.data()
                    setProfileData({
                        displayName: data.name || data.displayName || user.displayName || user.email?.split('@')[0] || 'Admin',
                        email: data.email || user.email,
                        photoURL: data.photoURL || data.avatar || user.photoURL || '/images/avatar/1.png',
                    })
                } else {
                    setProfileData({
                        displayName: user.displayName || user.email?.split('@')[0] || 'Admin',
                        email: user.email,
                        photoURL: user.photoURL || '/images/avatar/1.png',
                    })
                }

                // Fetch admin stats
                const statsResult = await getAdminDashboardStats()
                if (statsResult && !statsResult.error) {
                    setStats(statsResult)
                }

                // Fetch participants with details
                const participantsResult = await getParticipantsWithDetails()
                if (participantsResult && !participantsResult.error) {
                    setParticipants(participantsResult.participants || [])
                }
            } catch (error) {
                console.error('Error fetching admin data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    const avatarSrc = profileData?.photoURL || '/images/avatar/1.png'
    const displayName = profileData?.displayName || 'Admin'

    return (
        <>
            {/* Admin Profile Card */}
            <div className="col-xxl-4 col-xl-6 mb-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        <div className="text-center mb-4">
                            <div className="position-relative d-inline-block mb-3">
                                <div className="avatar-image wd-150 ht-150 border border-4 border-primary rounded-circle position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                    <Image width={140} height={140} sizes='100vw' src={avatarSrc} alt={displayName} className="img-fluid rounded-circle" />
                                </div>
                                <div className="position-absolute bottom-0 end-0 bg-white rounded-circle p-1 border border-2 border-white shadow-sm">
                                    <span className="badge bg-success">ADMIN</span>
                                </div>
                            </div>
                            <div className="mb-3">
                                <h5 className="fw-bold mb-1">{displayName}</h5>
                                <p className="text-muted mb-2 small">{profileData?.email}</p>
                                <span className="badge bg-soft-danger text-danger px-3 py-2">Administrator</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Stats */}
                {stats && (
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-transparent border-bottom pb-3">
                            <h5 className="card-title mb-0 fw-bold">Dashboard Stats</h5>
                        </div>
                        <div className="card-body p-4">
                            <div className="row g-3">
                                <div className="col-12">
                                    <div className="p-3 bg-soft-primary rounded-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <p className="small text-muted mb-1">Total Peserta</p>
                                                <h4 className="fw-bold mb-0 text-primary">{stats.totalParticipants || 0}</h4>
                                            </div>
                                            <FiUsers className="text-primary" size={32} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="p-3 bg-soft-success rounded-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <p className="small text-muted mb-1">Kelas Terdaftar</p>
                                                <h4 className="fw-bold mb-0 text-success">{stats.totalEnrolledClasses || 0}</h4>
                                            </div>
                                            <FiBook className="text-success" size={32} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="p-3 bg-soft-warning rounded-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <p className="small text-muted mb-1">Total Revenue</p>
                                                <h6 className="fw-bold mb-0 text-warning">{stats.totalRevenue || 'Rp 0'}</h6>
                                            </div>
                                            <FiDollarSign className="text-warning" size={32} />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="p-3 bg-soft-danger rounded-3">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div>
                                                <p className="small text-muted mb-1">Unpaid Bills</p>
                                                <h6 className="fw-bold mb-0 text-danger">{stats.totalUnpaid || 'Rp 0'}</h6>
                                            </div>
                                            <FiFileText className="text-danger" size={32} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Participants List */}
            <div className="col-xxl-8 col-xl-6">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-bottom pb-3">
                        <div className="d-flex align-items-center justify-content-between">
                            <h5 className="card-title mb-0 fw-bold">Data Peserta</h5>
                            <Link href="/customers/list" className="btn btn-sm btn-primary">
                                Lihat Semua
                            </Link>
                        </div>
                    </div>
                    <div className="card-body p-4">
                        {participants.length === 0 ? (
                            <div className="text-center py-5">
                                <p className="text-muted">Belum ada peserta terdaftar</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nama</th>
                                            <th>Email</th>
                                            <th>Kelas Dibeli</th>
                                            <th>Kelas Diikuti</th>
                                            <th>Pembelian</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {participants.slice(0, 10).map((participant) => (
                                            <tr key={participant.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar-text bg-soft-primary me-2 rounded-circle" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <span className="text-primary fw-bold small">
                                                                {(participant.name || 'U')[0].toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <span className="fw-medium">{participant.name}</span>
                                                    </div>
                                                </td>
                                                <td className="small">{participant.email}</td>
                                                <td>
                                                    <span className="badge bg-soft-primary text-primary">
                                                        {participant.enrolledClasses || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-soft-success text-success">
                                                        {participant.completedClasses || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="badge bg-soft-info text-info">
                                                        {participant.purchases || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link href={`/customers/view?id=${participant.id}`} className="btn btn-sm btn-light-primary">
                                                        <FiEye size={14} className="me-1" />
                                                        Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminProfileContent






