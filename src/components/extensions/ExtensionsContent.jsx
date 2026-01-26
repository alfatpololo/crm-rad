'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { db } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import { FiClock, FiCalendar, FiCheckCircle, FiXCircle, FiSend } from 'react-icons/fi'
import Swal from 'sweetalert2'

const ExtensionsContent = () => {
    const { user } = useAuth()
    const [enrolledClasses, setEnrolledClasses] = useState([])
    const [extensionRequests, setExtensionRequests] = useState([])
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
                    setEnrolledClasses(data.enrolledClasses || [])
                    setExtensionRequests(data.extensionRequests || [])
                }
            } catch (error) {
                console.error('Error fetching extensions:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    const handleRequestExtension = async (classItem) => {
        try {
            const result = await Swal.fire({
                title: 'Ajukan Perpanjangan',
                html: `
                    <div class="text-start">
                        <p>Kelas: <strong>${classItem.name || classItem.title || 'Kelas'}</strong></p>
                        <p class="small text-muted mb-3">Silakan masukkan alasan perpanjangan</p>
                        <textarea id="extensionReason" class="form-control" rows="3" placeholder="Alasan perpanjangan..."></textarea>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Kirim Permohonan',
                cancelButtonText: 'Batal',
                preConfirm: () => {
                    const reason = document.getElementById('extensionReason').value
                    if (!reason) {
                        Swal.showValidationMessage('Alasan harus diisi')
                        return false
                    }
                    return reason
                }
            })

            if (result.isConfirmed) {
                // In real app, this would create an extension request in Firestore
                Swal.fire({
                    icon: 'success',
                    title: 'Permohonan Terkirim',
                    text: 'Permohonan perpanjangan Anda telah dikirim. Admin akan meninjau permohonan Anda.',
                    showConfirmButton: false,
                    timer: 2000
                })
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
            })
        }
    }

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
            {/* Extension Requests */}
            {extensionRequests.length > 0 && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-transparent border-bottom pb-3">
                        <h5 className="card-title mb-0 fw-bold">Permohonan Perpanjangan</h5>
                    </div>
                    <div className="card-body p-4">
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Kelas</th>
                                        <th>Alasan</th>
                                        <th>Tanggal Ajuan</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {extensionRequests.map((request, index) => (
                                        <tr key={index}>
                                            <td className="fw-medium">{request.className || 'Kelas'}</td>
                                            <td className="small">{request.reason || '-'}</td>
                                            <td className="small text-muted">
                                                {request.requestDate ? new Date(request.requestDate).toLocaleDateString('id-ID') : '-'}
                                            </td>
                                            <td>
                                                {request.status === 'approved' ? (
                                                    <span className="badge bg-soft-success text-success">
                                                        <FiCheckCircle className="me-1" />Disetujui
                                                    </span>
                                                ) : request.status === 'rejected' ? (
                                                    <span className="badge bg-soft-danger text-danger">
                                                        <FiXCircle className="me-1" />Ditolak
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-soft-warning text-warning">
                                                        <FiClock className="me-1" />Menunggu
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Enrolled Classes for Extension */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-transparent border-bottom pb-3">
                    <h5 className="card-title mb-0 fw-bold">Ajukan Perpanjangan Kelas</h5>
                </div>
                <div className="card-body p-4">
                    {enrolledClasses.length === 0 ? (
                        <div className="text-center py-5">
                            <FiClock size={64} className="text-muted mb-3" />
                            <h5 className="fw-bold mb-2">Belum Ada Kelas</h5>
                            <p className="text-muted mb-0">Anda belum terdaftar di kelas manapun</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {enrolledClasses.map((classItem, index) => (
                                <div key={index} className="col-lg-4 col-md-6">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body p-4">
                                            <div className="mb-3">
                                                <h6 className="fw-bold mb-2">{classItem.name || classItem.title || `Kelas ${index + 1}`}</h6>
                                                {classItem.purchaseDate && (
                                                    <p className="text-muted small mb-2">
                                                        Terdaftar: {new Date(classItem.purchaseDate).toLocaleDateString('id-ID')}
                                                    </p>
                                                )}
                                                {classItem.expiryDate && (
                                                    <p className="text-muted small mb-0">
                                                        Berakhir: {new Date(classItem.expiryDate).toLocaleDateString('id-ID')}
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleRequestExtension(classItem)}
                                                className="btn btn-primary w-100"
                                            >
                                                <FiSend size={16} className="me-1" />
                                                Ajukan Perpanjangan
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

export default ExtensionsContent






