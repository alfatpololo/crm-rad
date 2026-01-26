'use client'
import React, { useState } from 'react'
import Table from '@/components/shared/table/Table'
import { FiPlus, FiEdit3, FiTrash2, FiEye, FiMoreHorizontal } from 'react-icons/fi'
import Dropdown from '@/components/shared/Dropdown'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import { saveCertificate, deleteCertificate } from '@/actions/certificates'
import CertificateForm from './CertificateForm'

const actions = [
    { label: "Edit", icon: <FiEdit3 /> },
    { label: "Preview PDF", icon: <FiEye /> },
    { type: "divider" },
    { label: "Delete", icon: <FiTrash2 /> },
];

const CertificatesManagement = ({ certificates = [], participants = [], services = [] }) => {
    const router = useRouter()
    const [showForm, setShowForm] = useState(false)
    const [editingCertificate, setEditingCertificate] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleCreate = () => {
        setEditingCertificate(null)
        setShowForm(true)
    }

    const handleEdit = (certificate) => {
        setEditingCertificate(certificate)
        setShowForm(true)
    }

    const handleDelete = async (certificate) => {
        const result = await Swal.fire({
            title: 'Hapus Sertifikat?',
            text: `Anda akan menghapus sertifikat untuk "${certificate.serviceName}". Tindakan ini tidak dapat dibatalkan!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            setLoading(true)
            try {
                const deleteResult = await deleteCertificate(certificate.participantId, certificate.id)
                if (deleteResult.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Sertifikat berhasil dihapus',
                        confirmButtonColor: '#198754',
                    })
                    router.refresh()
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: deleteResult.error || 'Gagal menghapus sertifikat',
                        confirmButtonColor: '#dc3545',
                    })
                }
            } catch (error) {
                console.error('Error deleting certificate:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Terjadi kesalahan saat menghapus sertifikat',
                    confirmButtonColor: '#dc3545',
                })
            } finally {
                setLoading(false)
            }
        }
    }

    const handlePreviewPDF = (certificate) => {
        if (certificate.certificateUrl) {
            window.open(certificate.certificateUrl, '_blank')
        } else {
            Swal.fire({
                icon: 'info',
                title: 'Sertifikat Belum Tersedia',
                text: 'Sertifikat belum di-publish atau belum ada file PDF',
                confirmButtonColor: '#198754',
            })
        }
    }

    const handleFormSubmit = async (formData) => {
        setLoading(true)
        try {
            const result = await saveCertificate(formData.participantId, formData)

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: editingCertificate ? 'Sertifikat berhasil diupdate' : 'Sertifikat berhasil dibuat',
                    confirmButtonColor: '#198754',
                })
                setShowForm(false)
                setEditingCertificate(null)
                router.refresh()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: result.error || 'Gagal menyimpan sertifikat',
                    confirmButtonColor: '#dc3545',
                })
            }
        } catch (error) {
            console.error('Error saving certificate:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Terjadi kesalahan saat menyimpan sertifikat',
                confirmButtonColor: '#dc3545',
            })
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            accessorKey: 'participantName',
            header: () => 'Peserta',
            cell: (info) => {
                const row = info.row.original
                return (
                    <div>
                        <div className="fw-bold">{row.participantName}</div>
                        <small className="text-muted">{row.participantEmail}</small>
                    </div>
                )
            }
        },
        {
            accessorKey: 'serviceName',
            header: () => 'Sertifikasi/Kelas',
            cell: (info) => {
                const row = info.row.original
                return (
                    <div>
                        <div className="fw-bold">{row.serviceName}</div>
                        {row.certificateNumber && (
                            <small className="text-muted">No: {row.certificateNumber}</small>
                        )}
                    </div>
                )
            }
        },
        {
            accessorKey: 'status',
            header: () => 'Status',
            cell: (info) => {
                const status = info.getValue()
                let badgeClass = 'bg-soft-warning text-warning'
                let statusText = 'On Progress'
                
                if (status === 'completed') {
                    badgeClass = 'bg-soft-info text-info'
                    statusText = 'Completed'
                } else if (status === 'published') {
                    badgeClass = 'bg-soft-success text-success'
                    statusText = 'Published'
                }
                
                return <span className={`badge ${badgeClass}`}>{statusText}</span>
            }
        },
        {
            accessorKey: 'completedDate',
            header: () => 'Tanggal Selesai',
            cell: (info) => {
                const date = info.getValue()
                return date ? new Date(date).toLocaleDateString('id-ID') : '-'
            }
        },
        {
            accessorKey: 'publishedDate',
            header: () => 'Tanggal Publish',
            cell: (info) => {
                const date = info.getValue()
                return date ? new Date(date).toLocaleDateString('id-ID') : '-'
            }
        },
        {
            accessorKey: 'actions',
            header: () => "Actions",
            cell: info => {
                const rowData = info.row.original
                return (
                    <div className="hstack gap-2 justify-content-end">
                        {rowData.certificateUrl && (
                            <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handlePreviewPDF(rowData)}
                                title="Preview PDF"
                            >
                                <FiEye size={14} />
                            </button>
                        )}
                        <Dropdown 
                            dropdownItems={actions} 
                            triggerIcon={<FiMoreHorizontal />} 
                            triggerClass='btn btn-sm btn-light' 
                            triggerPosition={"0,21"}
                            onClick={(label) => {
                                if (label === 'Edit') {
                                    handleEdit(rowData)
                                } else if (label === 'Preview PDF') {
                                    handlePreviewPDF(rowData)
                                } else if (label === 'Delete') {
                                    handleDelete(rowData)
                                }
                            }}
                            id={rowData.id}
                        />
                    </div>
                );
            },
            meta: {
                headerClassName: 'text-end'
            }
        },
    ]

    return (
        <div className="col-lg-12">
            {showForm ? (
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                {editingCertificate ? 'Edit Sertifikat' : 'Buat Sertifikat Baru'}
                            </h5>
                            <button
                                className="btn btn-sm btn-light"
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingCertificate(null)
                                }}
                            >
                                Batal
                            </button>
                        </div>
                        <div className="card-body">
                            <CertificateForm
                                certificate={editingCertificate}
                                participants={participants}
                                services={services}
                                onSubmit={handleFormSubmit}
                                onCancel={() => {
                                    setShowForm(false)
                                    setEditingCertificate(null)
                                }}
                                loading={loading}
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Daftar Sertifikat</h5>
                        <button
                            className="btn btn-primary"
                            onClick={handleCreate}
                        >
                            <FiPlus size={16} className="me-2" />
                            Buat Sertifikat
                        </button>
                    </div>
                    <div className="card-body">
                        <Table data={certificates} columns={columns} />
                    </div>
                </div>
            )}
        </div>
    )
}

export default CertificatesManagement



