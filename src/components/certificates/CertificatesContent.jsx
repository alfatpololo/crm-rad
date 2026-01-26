'use client'
import React, { useState, useEffect } from 'react'
import { getUserCertificates } from '@/actions/certificates'

const CertificatesContent = ({ initialCertificates = [] }) => {
    const [certificates, setCertificates] = useState(initialCertificates)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (initialCertificates.length === 0) {
            fetchCertificates()
        }
    }, [])

    const fetchCertificates = async () => {
        setLoading(true)
        try {
            const result = await getUserCertificates()
            if (result.success) {
                setCertificates(result.certificates || [])
            }
        } catch (error) {
            console.error('Error fetching certificates:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'issued':
                return <span className="badge bg-success">✓ Issued</span>
            case 'published':
                return <span className="badge bg-soft-success text-success">Published</span>
            case 'completed':
                return <span className="badge bg-soft-info text-info">Completed</span>
            case 'on_progress':
            default:
                return <span className="badge bg-soft-warning text-warning">On Progress</span>
        }
    }

    const handlePreviewPDF = (certificate) => {
        if (certificate.certificateUrl) {
            window.open(certificate.certificateUrl, '_blank')
        } else {
            alert('Sertifikat belum tersedia')
        }
    }

    const handleDownloadPDF = (certificate) => {
        if (certificate.certificateUrl) {
            const link = document.createElement('a')
            link.href = certificate.certificateUrl
            link.download = `Sertifikat-${certificate.serviceName}-${certificate.certificateNumber || certificate.id}.pdf`
            link.click()
        } else {
            alert('Sertifikat belum tersedia')
        }
    }

    if (loading) {
        return (
            <div className="col-lg-12">
                <div className="card">
                    <div className="card-body text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (certificates.length === 0) {
        return (
            <div className="col-lg-12">
                <div className="card">
                    <div className="card-body text-center py-5">
                        <div style={{fontSize: '48px'}} className="mb-3">📜</div>
                        <h6 className="fw-bold mb-2">Belum Ada Sertifikat</h6>
                        <p className="text-muted small">Sertifikat akan muncul setelah Anda menyelesaikan kelas dan admin meng-issue sertifikat</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="col-lg-12">
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Tracking Sertifikat Saya</h5>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Sertifikasi/Kelas</th>
                                    <th>Nomor Sertifikat</th>
                                    <th>Tanggal Issue</th>
                                    <th>Tanggal Hadir</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certificates.map((cert, index) => (
                                    <tr key={cert.certificateNumber || index}>
                                        <td>
                                            <div className="fw-bold">{cert.serviceName}</div>
                                            <small className="text-muted">Peserta: {cert.participantName}</small>
                                        </td>
                                        <td>
                                            <code className="small">{cert.certificateNumber || '-'}</code>
                                        </td>
                                        <td>
                                            {cert.issuedDate ? new Date(cert.issuedDate).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td>
                                            {cert.attendedDate ? new Date(cert.attendedDate).toLocaleDateString('id-ID') : '-'}
                                        </td>
                                        <td>
                                            {getStatusBadge(cert.status)}
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                {cert.certificateUrl && cert.status === 'issued' && (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-primary"
                                                            onClick={() => handlePreviewPDF(cert)}
                                                            title="Preview"
                                                        >
                                                            👁️ Lihat
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleDownloadPDF(cert)}
                                                            title="Download"
                                                        >
                                                            📥 Download
                                                        </button>
                                                    </>
                                                )}
                                                {!cert.certificateUrl && (
                                                    <span className="text-muted small">Belum di-upload admin</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CertificatesContent
