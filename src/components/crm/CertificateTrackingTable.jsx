'use client'
import React, { useState } from 'react'
import Table from '@/components/shared/table/Table'
import { FiEye, FiEdit3, FiMoreHorizontal } from 'react-icons/fi'
import Dropdown from '@/components/shared/Dropdown'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import { updateCertificateStatus } from '@/actions/crm'

const actions = [
    { label: "Update Status", icon: <FiEdit3 /> },
    { label: "Preview PDF", icon: <FiEye /> },
];

const CertificateTrackingTable = ({ data = [] }) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleUpdateStatus = async (certificate) => {
        const { value: status } = await Swal.fire({
            title: 'Update Status Sertifikat',
            input: 'select',
            inputOptions: {
                'on_progress': 'On Progress',
                'completed': 'Completed',
                'published': 'Published'
            },
            inputValue: certificate.status || 'on_progress',
            showCancelButton: true,
            confirmButtonText: 'Update',
            cancelButtonText: 'Batal',
            inputValidator: (value) => {
                if (!value) {
                    return 'Pilih status!'
                }
            }
        })

        if (status) {
            setLoading(true)
            try {
                const result = await updateCertificateStatus(
                    certificate.participantId,
                    certificate.id,
                    status
                )

                if (result.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Status sertifikat berhasil diupdate',
                        confirmButtonColor: '#198754',
                    })
                    router.refresh()
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: result.error || 'Gagal mengupdate status',
                        confirmButtonColor: '#dc3545',
                    })
                }
            } catch (error) {
                console.error('Error updating certificate:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Terjadi kesalahan',
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
                                if (label === 'Update Status') {
                                    handleUpdateStatus(rowData)
                                } else if (label === 'Preview PDF') {
                                    handlePreviewPDF(rowData)
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
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Tracking Sertifikat</h5>
                </div>
                <div className="card-body">
                    <Table data={data} columns={columns} />
                </div>
            </div>
        </div>
    )
}

export default CertificateTrackingTable



