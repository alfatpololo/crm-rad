'use client'
import React, { useState, useEffect, useRef } from 'react'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload'
import Swal from 'sweetalert2'

const CertificateForm = ({ certificate, participants = [], services = [], onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        participantId: '',
        serviceId: '',
        serviceName: '',
        status: 'on_progress',
        certificateNumber: '',
        certificateUrl: null,
        completedDate: '',
    })

    const certificateUpload = useCloudinaryUpload()
    const certificateFileRef = useRef(null)
    const [certificatePreview, setCertificatePreview] = useState(null)
    const [certificateUrl, setCertificateUrl] = useState(null)

    useEffect(() => {
        if (certificate) {
            setFormData({
                participantId: certificate.participantId || '',
                serviceId: certificate.serviceId || '',
                serviceName: certificate.serviceName || '',
                status: certificate.status || 'on_progress',
                certificateNumber: certificate.certificateNumber || '',
                certificateUrl: certificate.certificateUrl || null,
                completedDate: certificate.completedDate ? new Date(certificate.completedDate).toISOString().split('T')[0] : '',
            })
            if (certificate.certificateUrl) {
                setCertificatePreview(certificate.certificateUrl)
                setCertificateUrl(certificate.certificateUrl)
            }
        }
    }, [certificate])

    const handleServiceChange = (serviceId) => {
        const selectedService = services.find(s => s.id === serviceId)
        setFormData({
            ...formData,
            serviceId,
            serviceName: selectedService?.name || '',
        })
    }

    const handleCertificateUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            Swal.fire('Error', 'File harus berupa gambar atau PDF', 'error')
            return
        }

        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            Swal.fire('Error', 'Ukuran file maksimal 10MB', 'error')
            return
        }

        // Create preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = () => {
                setCertificatePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }

        // Upload to Cloudinary
        const result = await certificateUpload.uploadImage(file, 'certificates')
        
        if (result.success) {
            setCertificateUrl(result.url)
        } else {
            Swal.fire('Error', result.error || 'Gagal mengupload sertifikat', 'error')
            setCertificatePreview(null)
            setCertificateUrl(null)
            if (certificateFileRef.current) {
                certificateFileRef.current.value = ''
            }
        }
    }

    const handleRemoveCertificate = () => {
        setCertificatePreview(null)
        setCertificateUrl(null)
        certificateUpload.resetUpload()
        if (certificateFileRef.current) {
            certificateFileRef.current.value = ''
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!formData.participantId) {
            Swal.fire('Error', 'Pilih peserta', 'error')
            return
        }

        if (!formData.serviceId) {
            Swal.fire('Error', 'Pilih sertifikasi/kelas', 'error')
            return
        }

        const submitData = {
            ...formData,
            id: certificate?.id,
            certificateUrl: certificateUrl || formData.certificateUrl,
            completedDate: formData.completedDate || null,
        }

        onSubmit(submitData)
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label className="form-label">Peserta <span className="text-danger">*</span></label>
                    <select
                        className="form-control"
                        value={formData.participantId}
                        onChange={(e) => setFormData({ ...formData, participantId: e.target.value })}
                        required
                        disabled={!!certificate}
                    >
                        <option value="">Pilih Peserta</option>
                        {participants.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name} ({p.email})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Sertifikasi/Kelas <span className="text-danger">*</span></label>
                    <select
                        className="form-control"
                        value={formData.serviceId}
                        onChange={(e) => handleServiceChange(e.target.value)}
                        required
                    >
                        <option value="">Pilih Sertifikasi/Kelas</option>
                        {services.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Status</label>
                    <select
                        className="form-control"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="on_progress">On Progress</option>
                        <option value="completed">Completed</option>
                        <option value="published">Published</option>
                    </select>
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Nomor Sertifikat</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Contoh: CERT-2024-001"
                        value={formData.certificateNumber}
                        onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                    />
                </div>
                <div className="col-md-6 mb-3">
                    <label className="form-label">Tanggal Selesai</label>
                    <input
                        type="date"
                        className="form-control"
                        value={formData.completedDate}
                        onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                    />
                </div>
                <div className="col-12 mb-3">
                    <label className="form-label">Upload Sertifikat (PDF/Gambar)</label>
                    <div className="d-flex align-items-center gap-3">
                        {certificatePreview ? (
                            <div className="position-relative">
                                {certificatePreview.startsWith('data:') || certificatePreview.includes('image') ? (
                                    <img 
                                        src={certificatePreview} 
                                        alt="Certificate preview" 
                                        className="img-thumbnail" 
                                        style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <div className="border rounded p-3 text-center" style={{ minWidth: '200px', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div>
                                            <FiImage size={32} className="text-muted mb-2" />
                                            <p className="small text-muted mb-0">PDF File</p>
                                            <a href={certificatePreview} target="_blank" rel="noopener noreferrer" className="small">
                                                Lihat File
                                            </a>
                                        </div>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                    onClick={handleRemoveCertificate}
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="border rounded p-3 text-center" style={{ minWidth: '200px', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div>
                                    <FiImage size={32} className="text-muted mb-2" />
                                    <p className="small text-muted mb-0">No Certificate</p>
                                </div>
                            </div>
                        )}
                        <div>
                            <input
                                type="file"
                                ref={certificateFileRef}
                                accept="image/*,application/pdf"
                                onChange={handleCertificateUpload}
                                className="d-none"
                                id="certificate-upload"
                            />
                            <label htmlFor="certificate-upload" className="btn btn-sm btn-primary">
                                <FiUpload size={14} className="me-1" />
                                {certificateUpload.uploading ? 'Uploading...' : 'Upload Sertifikat'}
                            </label>
                            {certificateUpload.uploading && (
                                <div className="progress mt-2" style={{ width: '200px' }}>
                                    <div 
                                        className="progress-bar" 
                                        style={{ width: `${certificateUpload.uploadProgress}%` }}
                                    />
                                </div>
                            )}
                            <p className="small text-muted mt-2 mb-0">Format: JPG, PNG, PDF (Max 10MB)</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="d-flex justify-content-end gap-2">
                <button
                    type="button"
                    className="btn btn-light"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Menyimpan...' : (certificate ? 'Update' : 'Simpan')}
                </button>
            </div>
        </form>
    )
}

export default CertificateForm



