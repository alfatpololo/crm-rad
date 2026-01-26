'use client'
import React, { useState, useEffect } from 'react'
import { getServices } from '@/actions/masterData'
import { getEligibleParticipants, issueCertificate, getServiceCertificates, revokeCertificate } from '@/actions/certificates'
import Swal from 'sweetalert2'

const AdminCertificatesContent = () => {
    const [services, setServices] = useState([])
    const [selectedService, setSelectedService] = useState(null)
    const [participants, setParticipants] = useState([])
    const [issuedCertificates, setIssuedCertificates] = useState([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        setLoading(true)
        try {
            const result = await getServices()
            if (result && Array.isArray(result)) {
                setServices(result)
            }
        } catch (error) {
            console.error('Error fetching services:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleServiceSelect = async (serviceId) => {
        const service = services.find(s => s.id === serviceId)
        setSelectedService(service)
        setLoading(true)

        try {
            // Get participants who attended
            const eligibleResult = await getEligibleParticipants(serviceId)
            if (eligibleResult.success) {
                setParticipants(eligibleResult.participants || [])
            }

            // Get issued certificates
            const certsResult = await getServiceCertificates(serviceId)
            if (certsResult.success) {
                setIssuedCertificates(certsResult.certificates || [])
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUploadCertificate = async (file) => {
        // Validate file
        if (!file) {
            throw new Error('Tidak ada file yang dipilih')
        }

        if (file.size > 10 * 1024 * 1024) {
            throw new Error('File terlalu besar! Maksimal 10MB')
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Format file tidak didukung! Gunakan PDF, JPG, atau PNG')
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default')
        formData.append('folder', 'certificates')

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            )

            const data = await response.json()

            if (!response.ok) {
                console.error('Cloudinary error:', data)
                throw new Error(data.error?.message || 'Upload gagal: ' + response.statusText)
            }

            return data.secure_url
        } catch (error) {
            console.error('Upload error:', error)
            throw new Error(error.message || 'Gagal upload ke Cloudinary')
        }
    }

    const handleIssueCertificate = async (participantId, participantName) => {
        const result = await Swal.fire({
            title: 'Upload Sertifikat',
            html: `
                <div class="text-start">
                    <p>Issue sertifikat untuk:</p>
                    <strong>${participantName}</strong>
                    <p class="text-muted small mt-2">Kelas: ${selectedService.name}</p>
                    <hr>
                    <label class="form-label">Upload File Sertifikat (PDF/Image)</label>
                    <input type="file" id="certificate-file" class="form-control" accept=".pdf,.jpg,.jpeg,.png" required>
                    <small class="text-muted">Format: PDF, JPG, PNG (Max 10MB)</small>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Upload & Issue',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#28a745',
            preConfirm: () => {
                const fileInput = document.getElementById('certificate-file')
                const file = fileInput.files[0]
                
                if (!file) {
                    Swal.showValidationMessage('Pilih file sertifikat!')
                    return false
                }
                
                if (file.size > 10 * 1024 * 1024) {
                    Swal.showValidationMessage('File terlalu besar! Max 10MB')
                    return false
                }
                
                return file
            }
        })

        if (!result.isConfirmed) return

        setProcessing(true)
        try {
            // Upload certificate file
            Swal.fire({
                title: 'Uploading...',
                html: 'Mengupload sertifikat...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })

            const certificateUrl = await handleUploadCertificate(result.value)

            // Issue certificate with URL
            const issueResult = await issueCertificate({
                participantId,
                serviceId: selectedService.id,
                serviceName: selectedService.name,
                certificateUrl
            })

            if (issueResult.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Sertifikat berhasil di-upload dan di-issue',
                    timer: 2000
                })
                // Refresh data
                handleServiceSelect(selectedService.id)
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: issueResult.error || 'Gagal meng-issue sertifikat'
                })
            }
        } catch (error) {
            console.error('Error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal upload sertifikat: ' + error.message
            })
        } finally {
            setProcessing(false)
        }
    }

    const handleRevokeCertificate = async (participantId, participantName) => {
        const result = await Swal.fire({
            title: 'Hapus Sertifikat?',
            html: `
                <p>Hapus sertifikat untuk:</p>
                <strong>${participantName}</strong>
                <p class="text-muted small mt-2">Kelas: ${selectedService.name}</p>
                <p class="text-danger small">⚠️ Tindakan ini tidak bisa dibatalkan!</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#dc3545'
        })

        if (!result.isConfirmed) return

        setProcessing(true)
        try {
            const revokeResult = await revokeCertificate({
                participantId,
                serviceId: selectedService.id
            })

            if (revokeResult.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Sertifikat berhasil dihapus',
                    timer: 2000
                })
                // Refresh data
                handleServiceSelect(selectedService.id)
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: revokeResult.error || 'Gagal menghapus sertifikat'
                })
            }
        } catch (error) {
            console.error('Error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Terjadi kesalahan'
            })
        } finally {
            setProcessing(false)
        }
    }

    const notYetCertified = participants.filter(p => !p.hasCertificate)
    const alreadyCertified = participants.filter(p => p.hasCertificate)

    if (loading && !selectedService) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
                <div className="row g-4">
                    {/* Service Selection */}
                    <div className="col-md-4">
                        <h5 className="fw-bold mb-3">📚 Pilih Kelas</h5>
                        <div className="list-group">
                            {services.map(service => (
                                <button
                                    key={service.id}
                                    className={`list-group-item list-group-item-action ${selectedService?.id === service.id ? 'active' : ''}`}
                                    onClick={() => handleServiceSelect(service.id)}
                                >
                                    <div className="fw-bold">{service.name}</div>
                                    <small>{service.category}</small>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Participants & Certificates */}
                    <div className="col-md-8">
                        {!selectedService ? (
                            <div className="text-center py-5 text-muted">
                                <div style={{fontSize: '48px'}} className="mb-3">📜</div>
                                <p>Pilih kelas untuk melihat peserta dan issue sertifikat</p>
                            </div>
                        ) : loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>
                        ) : (
                            <>
                                {/* Summary */}
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <div className="card bg-warning text-white border-0">
                                            <div className="card-body p-3">
                                                <h4 className="mb-0">{notYetCertified.length}</h4>
                                                <small>⏳ Belum Dapat Sertifikat</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card bg-success text-white border-0">
                                            <div className="card-body p-3">
                                                <h4 className="mb-0">{alreadyCertified.length}</h4>
                                                <small>✓ Sudah Dapat Sertifikat</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Not Yet Certified */}
                                {notYetCertified.length > 0 && (
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-3">⏳ Belum Dapat Sertifikat ({notYetCertified.length})</h6>
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Nama</th>
                                                        <th>Email</th>
                                                        <th>Tanggal Hadir</th>
                                                        <th>Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {notYetCertified.map(participant => (
                                                        <tr key={participant.participantId}>
                                                            <td>{participant.name}</td>
                                                            <td><small>{participant.email}</small></td>
                                                            <td>
                                                                <small>
                                                                    {participant.attendedDate 
                                                                        ? new Date(participant.attendedDate.seconds * 1000 || participant.attendedDate).toLocaleDateString('id-ID')
                                                                        : '-'}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-success"
                                                                    onClick={() => handleIssueCertificate(participant.participantId, participant.name)}
                                                                    disabled={processing}
                                                                >
                                                                    📜 Issue Sertifikat
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Already Certified */}
                                {alreadyCertified.length > 0 && (
                                    <div>
                                        <h6 className="fw-bold mb-3">✓ Sudah Dapat Sertifikat ({alreadyCertified.length})</h6>
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Nama</th>
                                                        <th>Email</th>
                                                        <th>Tanggal Issue</th>
                                                        <th>Status</th>
                                                        <th>Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {alreadyCertified.map(participant => (
                                                        <tr key={participant.participantId}>
                                                            <td>{participant.name}</td>
                                                            <td><small>{participant.email}</small></td>
                                                            <td>
                                                                <small>
                                                                    {participant.certificateIssuedDate 
                                                                        ? new Date(participant.certificateIssuedDate.seconds * 1000 || participant.certificateIssuedDate).toLocaleDateString('id-ID')
                                                                        : '-'}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <span className="badge bg-success">✓ Issued</span>
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleRevokeCertificate(participant.participantId, participant.name)}
                                                                    disabled={processing}
                                                                    title="Hapus Sertifikat"
                                                                >
                                                                    🗑️ Hapus
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {participants.length === 0 && (
                                    <div className="alert alert-info">
                                        Belum ada peserta yang hadir di kelas ini.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminCertificatesContent

