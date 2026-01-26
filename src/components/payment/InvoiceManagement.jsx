'use client'
import React, { useState, useEffect } from 'react'
import { FiPlus, FiEdit3, FiTrash2, FiEye, FiX } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import { createInvoice, updateInvoice, deleteInvoice } from '@/actions/invoices'
import InvoiceForm from './InvoiceForm'
import Table from '@/components/shared/table/Table'
import Dropdown from '@/components/shared/Dropdown'
import Link from 'next/link'

const actions = [
    { label: "Edit", icon: <FiEdit3 /> },
    { label: "View", icon: <FiEye /> },
    { type: "divider" },
    { label: "Delete", icon: <FiTrash2 /> },
];

const InvoiceManagement = ({ invoices, masterData }) => {
    const router = useRouter()
    const [showForm, setShowForm] = useState(false)
    const [editingInvoice, setEditingInvoice] = useState(null)
    const [loading, setLoading] = useState(false)
    const [invoiceList, setInvoiceList] = useState(invoices || [])

    useEffect(() => {
        setInvoiceList(invoices || [])
    }, [invoices])

    // Transform invoices for table
    const tableData = invoiceList.map(inv => {
        let statusContent = 'Unpaid';
        let statusColor = 'bg-soft-warning text-warning';

        if (inv.status === 'paid') {
            statusContent = 'Paid';
            statusColor = 'bg-soft-success text-success';
        } else if (inv.status === 'cancelled') {
            statusContent = 'Cancelled';
            statusColor = 'bg-soft-danger text-danger';
        } else if (inv.status === 'pending') {
            statusContent = 'Pending';
            statusColor = 'bg-soft-warning text-warning';
        }

        // Ensure we only pass serializable data
        const rawData = {
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            label: inv.label,
            product: inv.product,
            sender: inv.sender,
            client: inv.client,
            items: inv.items,
            note: inv.note,
            subTotal: inv.subTotal,
            grandTotal: inv.grandTotal,
            tax: inv.tax,
            status: inv.status,
            issueDate: inv.issueDate,
            dueDate: inv.dueDate,
            createdAt: inv.createdAt,
            updatedAt: inv.updatedAt,
            participantName: inv.participantName,
            participantEmail: inv.participantEmail,
            total: inv.total,
        };

        return {
            id: inv.id,
            invoice: inv.invoiceNumber || '#' + inv.id.substring(0, 8).toUpperCase(),
            client: {
                name: inv.client?.name || inv.participantName || 'Unknown',
                email: inv.client?.email || inv.participantEmail || '',
                img: ''
            },
            amount: `Rp ${(inv.grandTotal || inv.total || 0).toLocaleString('id-ID')}`,
            date: inv.createdAt ? (typeof inv.createdAt === 'string' ? new Date(inv.createdAt).toLocaleDateString('id-ID') : inv.createdAt) : '',
            status: {
                content: statusContent,
                color: statusColor
            },
            rawData: rawData
        };
    });

    const handleCreate = () => {
        setEditingInvoice(null)
        setShowForm(true)
    }

    const handleEdit = (invoice) => {
        setEditingInvoice(invoice)
        setShowForm(true)
    }

    const handleDelete = async (invoice) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Anda akan menghapus invoice "${invoice.invoice}". Tindakan ini tidak dapat dibatalkan!`,
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
                const deleteResult = await deleteInvoice(invoice.id)
                if (deleteResult.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Invoice berhasil dihapus',
                        confirmButtonColor: '#198754',
                    })
                    router.refresh()
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: deleteResult.error || 'Gagal menghapus invoice',
                        confirmButtonColor: '#dc3545',
                    })
                }
            } catch (error) {
                console.error('Error deleting invoice:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Terjadi kesalahan saat menghapus invoice',
                    confirmButtonColor: '#dc3545',
                })
            } finally {
                setLoading(false)
            }
        }
    }

    const handleView = (invoice) => {
        router.push(`/payment/view?id=${invoice.id}`)
    }

    const handleFormSubmit = async (formData) => {
        setLoading(true)
        try {
            // Convert dates to Date objects if they're strings
            const processedData = {
                ...formData,
                issueDate: formData.issueDate instanceof Date ? formData.issueDate : new Date(formData.issueDate),
                dueDate: formData.dueDate instanceof Date ? formData.dueDate : new Date(formData.dueDate),
            }

            // Debug log
            console.log('InvoiceManagement submitting data:', {
                logoUrl: processedData.logoUrl,
                signatureUrl: processedData.signatureUrl,
                signatureText: processedData.signatureText,
                isEdit: !!editingInvoice
            });

            let result
            if (editingInvoice) {
                result = await updateInvoice(editingInvoice.id, processedData)
            } else {
                result = await createInvoice(processedData)
            }

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: editingInvoice ? 'Invoice berhasil diupdate' : 'Invoice berhasil dibuat',
                    confirmButtonColor: '#198754',
                })
                setShowForm(false)
                setEditingInvoice(null)
                router.refresh()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: result.error || 'Gagal menyimpan invoice',
                    confirmButtonColor: '#dc3545',
                })
            }
        } catch (error) {
            console.error('Error saving invoice:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Terjadi kesalahan saat menyimpan invoice',
                confirmButtonColor: '#dc3545',
            })
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {
            accessorKey: 'invoice',
            header: () => 'Invoice',
            cell: (info) => (
                <a href='#' className='fw-bold' onClick={(e) => {
                    e.preventDefault()
                    handleView(info.row.original.rawData)
                }}>
                    {info.getValue()}
                </a>
            )
        },
        {
            accessorKey: 'client',
            header: () => 'Client',
            cell: (info) => {
                const client = info.getValue();
                return (
                    <div className="hstack gap-3">
                        {client?.img ? (
                            <div className="avatar-image avatar-md">
                                <img src={client?.img} alt="" className="img-fluid" />
                            </div>
                        ) : (
                            <div className="text-white avatar-text user-avatar-text avatar-md">
                                {client?.name?.substring(0, 1)?.toUpperCase() || '?'}
                            </div>
                        )}
                        <div>
                            <span className="text-truncate-1-line d-block">{client?.name || 'Unknown'}</span>
                            <small className="fs-12 fw-normal text-muted">{client?.email || ''}</small>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: 'amount',
            header: () => 'Amount',
            meta: {
                className: "fw-bold text-dark"
            }
        },
        {
            accessorKey: 'date',
            header: () => 'Tanggal',
        },
        {
            accessorKey: 'status',
            header: () => 'Status',
            cell: (info) => {
                const status = info.getValue()
                return <span className={`badge ${status?.color}`}>{status?.content}</span>
            }
        },
        {
            accessorKey: 'actions',
            header: () => "Actions",
            cell: info => {
                const rowData = info.row.original.rawData
                return (
                    <div className="hstack gap-2 justify-content-end">
                        <Link 
                            href={`/payment/view?id=${rowData.id}`}
                            className="avatar-text avatar-md"
                            title="View"
                        >
                            <FiEye />
                        </Link>
                        <Dropdown 
                            dropdownItems={actions} 
                            triggerIcon={<FiEdit3 />} 
                            triggerClass='avatar-md' 
                            triggerPosition={"0,21"}
                            onClick={(label) => {
                                if (label === 'Edit') {
                                    handleEdit(rowData)
                                } else if (label === 'Delete') {
                                    handleDelete({ id: rowData.id, invoice: info.row.original.invoice })
                                } else if (label === 'View') {
                                    handleView(rowData)
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
        <div className='row'>
            <div className="col-lg-12">
                <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Daftar Invoice</h5>
                        <button 
                            className="btn btn-primary"
                            onClick={handleCreate}
                            disabled={loading}
                        >
                            <FiPlus size={16} className='me-2' />
                            Buat Invoice
                        </button>
                    </div>
                    <div className="card-body">
                        {showForm && (
                            <div className="mb-4 p-3 border rounded bg-light">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0">{editingInvoice ? 'Edit Invoice' : 'Buat Invoice Baru'}</h6>
                                    <button 
                                        className="btn btn-sm btn-light"
                                        onClick={() => {
                                            setShowForm(false)
                                            setEditingInvoice(null)
                                        }}
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                                <InvoiceForm 
                                    invoice={editingInvoice}
                                    masterData={masterData}
                                    onSubmit={handleFormSubmit}
                                    onCancel={() => {
                                        setShowForm(false)
                                        setEditingInvoice(null)
                                    }}
                                    loading={loading}
                                />
                            </div>
                        )}
                        <Table data={tableData || []} columns={columns} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InvoiceManagement

