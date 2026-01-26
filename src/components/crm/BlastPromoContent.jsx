'use client'
import React, { useState, useEffect } from 'react'
import { FiSend, FiUsers, FiMail } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { sendBlastPromo } from '@/actions/crm'
import { useRouter } from 'next/navigation'
import Table from '@/components/shared/table/Table'

const BlastPromoContent = ({ initialParticipants = [] }) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [participants, setParticipants] = useState(initialParticipants)
    const [selectedParticipants, setSelectedParticipants] = useState([])
    const [filter, setFilter] = useState('all') // all, active, enrolled
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        type: 'email' // email, whatsapp
    })

    useEffect(() => {
        setParticipants(initialParticipants)
    }, [initialParticipants])

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedParticipants(participants.map(p => p.id))
        } else {
            setSelectedParticipants([])
        }
    }

    const handleSelectParticipant = (participantId, checked) => {
        if (checked) {
            setSelectedParticipants([...selectedParticipants, participantId])
        } else {
            setSelectedParticipants(selectedParticipants.filter(id => id !== participantId))
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()

        if (selectedParticipants.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Peringatan',
                text: 'Pilih minimal 1 peserta',
                confirmButtonColor: '#198754',
            })
            return
        }

        if (!formData.subject || !formData.message) {
            Swal.fire({
                icon: 'warning',
                title: 'Peringatan',
                text: 'Subject dan Message harus diisi',
                confirmButtonColor: '#198754',
            })
            return
        }

        const confirm = await Swal.fire({
            title: 'Konfirmasi Kirim Promo',
            html: `Anda akan mengirim promo ke <b>${selectedParticipants.length}</b> peserta. Lanjutkan?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Kirim',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#198754',
        })

        if (confirm.isConfirmed) {
            setLoading(true)
            try {
                const result = await sendBlastPromo(
                    selectedParticipants,
                    formData.subject,
                    formData.message,
                    formData.type
                )

                if (result.error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: result.error,
                        confirmButtonColor: '#dc3545',
                    })
                } else {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: result.message || `Promo berhasil dikirim ke ${result.sentCount} peserta`,
                        confirmButtonColor: '#198754',
                    })
                    setFormData({ subject: '', message: '', type: 'email' })
                    setSelectedParticipants([])
                    router.refresh()
                }
            } catch (error) {
                console.error('Error sending blast:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'Terjadi kesalahan saat mengirim promo',
                    confirmButtonColor: '#dc3545',
                })
            } finally {
                setLoading(false)
            }
        }
    }

    const columns = [
        {
            accessorKey: 'id',
            header: ({ table }) => (
                <input
                    type="checkbox"
                    className="custom-table-checkbox"
                    checked={selectedParticipants.length === participants.length && participants.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    className="custom-table-checkbox"
                    checked={selectedParticipants.includes(row.original.id)}
                    onChange={(e) => handleSelectParticipant(row.original.id, e.target.checked)}
                />
            ),
            meta: {
                headerClassName: 'width-30',
            },
        },
        {
            accessorKey: 'name',
            header: () => 'Nama',
            cell: (info) => {
                const row = info.row.original
                return (
                    <div>
                        <div className="fw-bold">{row.name}</div>
                        <small className="text-muted">{row.email}</small>
                    </div>
                )
            }
        },
        {
            accessorKey: 'phone',
            header: () => 'Telepon',
        },
        {
            accessorKey: 'enrolledClasses',
            header: () => 'Kelas Terdaftar',
            cell: (info) => info.getValue() || 0
        },
        {
            accessorKey: 'completedClasses',
            header: () => 'Kelas Selesai',
            cell: (info) => info.getValue() || 0
        },
    ]

    return (
        <div className="col-lg-12">
            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Daftar Peserta</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label className="form-label">Filter:</label>
                                <select 
                                    className="form-control form-control-sm" 
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    style={{ maxWidth: '200px' }}
                                >
                                    <option value="all">Semua Peserta</option>
                                    <option value="active">Peserta Aktif</option>
                                    <option value="enrolled">Peserta dengan Kelas</option>
                                </select>
                            </div>
                            <Table data={participants} columns={columns} />
                            <div className="mt-3">
                                <small className="text-muted">
                                    Terpilih: <strong>{selectedParticipants.length}</strong> dari <strong>{participants.length}</strong> peserta
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Form Blast Promo</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSend}>
                                <div className="mb-3">
                                    <label className="form-label">Tipe Pengiriman</label>
                                    <select
                                        className="form-control"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="email">Email</option>
                                        <option value="whatsapp">WhatsApp</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Subject <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Subject promo..."
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Message <span className="text-danger">*</span></label>
                                    <textarea
                                        rows={8}
                                        className="form-control"
                                        placeholder="Isi pesan promo..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={loading || selectedParticipants.length === 0}
                                >
                                    <FiSend size={16} className="me-2" />
                                    {loading ? 'Mengirim...' : `Kirim ke ${selectedParticipants.length} Peserta`}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BlastPromoContent



