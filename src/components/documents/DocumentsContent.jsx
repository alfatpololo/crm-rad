'use client'

import React, { useState } from 'react'
import Swal from 'sweetalert2'
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload'
import { submitParticipantDocuments } from '@/actions/participants'
import { FiFileText, FiCheck } from 'react-icons/fi'

const PDF_MAX_MB = 10

export default function DocumentsContent({ status }) {
    const classesNeedingDocs = status?.classesNeedingDocs || []
    const requiredTypes = status?.requiredDocumentTypes || [
        { id: 'cv', label: 'CV (Curriculum Vitae)' },
        { id: 'ijazah', label: 'Ijazah Terakhir' },
    ]
    const [selectedClass, setSelectedClass] = useState(classesNeedingDocs[0] || null)
    const [files, setFiles] = useState({})
    const [submitting, setSubmitting] = useState(false)
    const { uploadPdf, uploading, error: uploadError } = useCloudinaryUpload()

    const alreadySubmitted = !status?.needsUpload && (status?.cvUrl && status?.ijazahUrl || classesNeedingDocs.length === 0)

    const handleFileChange = (typeId, file) => {
        setFiles(prev => ({ ...prev, [typeId]: file || null }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (classesNeedingDocs.length === 0) return

        const serviceId = selectedClass?.serviceId
        if (!serviceId) {
            Swal.fire('Perhatian', 'Pilih kelas dulu.', 'warning')
            return
        }

        const toUpload = requiredTypes.filter(t => files[t.id])
        if (toUpload.length !== requiredTypes.length) {
            Swal.fire('Perhatian', `Upload semua dokumen wajib: ${requiredTypes.map(t => t.label).join(', ')}`, 'warning')
            return
        }

        for (const t of toUpload) {
            const f = files[t.id]
            if (f.type !== 'application/pdf') {
                Swal.fire('Perhatian', `${t.label} harus format PDF.`, 'warning')
                return
            }
            if (f.size > PDF_MAX_MB * 1024 * 1024) {
                Swal.fire('Perhatian', `Ukuran ${t.label} maksimal ${PDF_MAX_MB} MB.`, 'warning')
                return
            }
        }

        setSubmitting(true)
        try {
            const documents = {}
            for (const t of requiredTypes) {
                const result = await uploadPdf(files[t.id], 'participant-docs')
                if (!result.success) {
                    Swal.fire('Error', result.error || `Gagal upload ${t.label}`, 'error')
                    setSubmitting(false)
                    return
                }
                documents[t.id] = result.url
            }
            const result = await submitParticipantDocuments(null, null, serviceId, documents)
            if (result.success) {
                await Swal.fire('Berhasil', result.message || 'Dokumen berhasil disimpan untuk kelas ini.', 'success')
                window.location.reload()
            } else {
                Swal.fire('Error', result.error || 'Gagal menyimpan', 'error')
            }
        } catch (err) {
            Swal.fire('Error', err.message || 'Terjadi kesalahan', 'error')
        } finally {
            setSubmitting(false)
        }
    }

    if (alreadySubmitted && !status?.needsUpload) {
        return (
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">
                            <FiCheck className="text-success mb-3" size={48} />
                            <h5 className="fw-bold">Dokumen Sudah Diserahkan</h5>
                            <p className="text-muted mb-0">
                                Semua dokumen wajib untuk kelas Anda sudah terupload. Terima kasih.
                            </p>
                            {status?.submittedAt && (
                                <p className="small text-muted mt-2">
                                    Terakhir diserahkan: {new Date(status.submittedAt).toLocaleDateString('id-ID')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (classesNeedingDocs.length === 0) {
        return (
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">
                            <FiFileText className="text-muted mb-3" size={48} />
                            <h5 className="fw-bold">Upload Dokumen</h5>
                            <p className="text-muted mb-0">
                                Tidak ada kelas yang membutuhkan upload dokumen saat ini. Setelah Anda membayar DP untuk sebuah kelas, Anda bisa upload dokumen wajib di sini.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const currentClass = selectedClass || classesNeedingDocs[0]
    const allFilesSelected = requiredTypes.every(t => files[t.id])

    return (
        <div className="row justify-content-center">
            <div className="col-lg-8">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-bottom">
                        <h5 className="card-title mb-0 fw-bold">Upload Dokumen Wajib</h5>
                    </div>
                    <div className="card-body p-4">
                        <p className="text-muted small mb-4">
                            Setelah pembayaran DP, pilih kelas lalu upload dokumen berikut (format PDF, maks. {PDF_MAX_MB} MB per file):
                        </p>

                        <div className="mb-4">
                            <label className="form-label fw-medium">Pilih kelas <span className="text-danger">*</span></label>
                            <select
                                className="form-select"
                                value={currentClass?.serviceId || ''}
                                onChange={(e) => {
                                    const c = classesNeedingDocs.find(x => x.serviceId === e.target.value)
                                    setSelectedClass(c || null)
                                    setFiles({})
                                }}
                            >
                                {classesNeedingDocs.map((c) => (
                                    <option key={c.serviceId} value={c.serviceId}>
                                        {c.serviceName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {requiredTypes.map((t) => (
                                <div key={t.id} className="mb-4">
                                    <label className="form-label fw-medium">{t.label} <span className="text-danger">*</span></label>
                                    <input
                                        type="file"
                                        className="form-control"
                                        accept=".pdf,application/pdf"
                                        onChange={(e) => handleFileChange(t.id, e.target.files?.[0] || null)}
                                    />
                                    <small className="text-muted">Format PDF</small>
                                </div>
                            ))}
                            {uploadError && <div className="alert alert-danger py-2">{uploadError}</div>}
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || uploading || !allFilesSelected}
                            >
                                {submitting || uploading ? 'Mengupload...' : 'Simpan Dokumen untuk Kelas Ini'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
