'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { sendBlastPromo } from '@/actions/crm'
import { useRouter } from 'next/navigation'
import Table from '@/components/shared/table/Table'
import { normalizePhone } from '@/lib/mekariWa'

const BlastPromoContent = ({ initialParticipants = [] }) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [participants, setParticipants] = useState(initialParticipants)
    const [selectedParticipants, setSelectedParticipants] = useState([])
    const [filter, setFilter] = useState('all')
    const [message, setMessage] = useState('')

    useEffect(() => {
        setParticipants(initialParticipants)
    }, [initialParticipants])

    const phoneValidation = useMemo(() => {
        const selected = participants.filter(p => selectedParticipants.includes(p.id))
        const valid = []
        const invalid = []
        selected.forEach(p => {
            const raw = (p?.phone ?? p?.phoneNumber ?? '').toString().trim()
            const normalized = raw ? normalizePhone(raw) : null
            const label = `${p.name || 'Tanpa nama'}${raw ? ` (${raw})` : ''}`
            if (normalized) {
                valid.push({ id: p.id, name: p.name, phone: raw, normalized })
            } else {
                invalid.push({ id: p.id, name: p.name, raw: raw || '(kosong)' })
            }
        })
        return { valid, invalid, validCount: valid.length, invalidCount: invalid.length }
    }, [participants, selectedParticipants])

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

        if (phoneValidation.validCount === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Tidak ada nomor WA valid',
                html: `<p class="text-start">${phoneValidation.invalidCount} peserta terpilih tidak punya nomor yang valid (min. 10 digit, format 08xxx atau 62xxx).</p>
                    ${phoneValidation.invalid.length ? `<p class="text-start small mt-2">Contoh: ${phoneValidation.invalid.slice(0, 3).map(x => `${x.name}: ${x.raw}`).join('; ')}</p>` : ''}`,
                confirmButtonColor: '#dc3545',
            })
            return
        }

        if (!message.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Peringatan',
                text: 'Pesan harus diisi',
                confirmButtonColor: '#198754',
            })
            return
        }

        const listPreview = phoneValidation.valid.slice(0, 10).map(v => `${v.name} (${v.phone})`).join('<br/>')
        const more = phoneValidation.validCount > 10 ? `<br/><small>... dan ${phoneValidation.validCount - 10} lainnya</small>` : ''
        const confirm = await Swal.fire({
            title: 'Konfirmasi Kirim Promo WA',
            html: `<p><b>${phoneValidation.validCount}</b> peserta dengan nomor WA valid akan menerima pesan:</p>
                <div class="text-start small bg-light p-2 rounded mt-2 mb-2" style="max-height:200px; overflow:auto;">${listPreview}${more}</div>
                <p class="mb-0">Lanjutkan kirim?</p>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Kirim',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#198754',
        })

        if (confirm.isConfirmed) {
            setLoading(true)
            try {
                const selectedPhones = phoneValidation.valid.map(v => ({ id: v.id, phone: v.phone }))
                const idsToSend = phoneValidation.valid.map(v => v.id)
                const result = await sendBlastPromo(
                    idsToSend,
                    '',
                    message.trim(),
                    'whatsapp',
                    selectedPhones
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
                    setMessage('')
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
                            <h5 className="mb-0">Blast Promo WhatsApp</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSend}>
                                {selectedParticipants.length > 0 && (
                                    <div className="mb-3 p-3 rounded border bg-light">
                                        <strong className="d-block mb-2">Validasi nomor WA (sebelum kirim)</strong>
                                        {phoneValidation.validCount > 0 ? (
                                            <div className="mb-2">
                                                <span className="text-success d-flex align-items-center gap-1">
                                                    <FiCheckCircle size={16} />
                                                    <strong>{phoneValidation.validCount}</strong> nomor valid — akan dikirim:
                                                </span>
                                                <ul className="small mb-0 mt-1 ps-3" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                                                    {phoneValidation.valid.map(v => (
                                                        <li key={v.id}>{v.name}: <code>{v.phone}</code></li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : null}
                                        {phoneValidation.invalidCount > 0 && (
                                            <div className="text-danger small">
                                                <span className="d-flex align-items-center gap-1">
                                                    <FiAlertCircle size={14} />
                                                    <strong>{phoneValidation.invalidCount}</strong> tanpa nomor valid (08xxx/62xxx, min. 10 digit):
                                                </span>
                                                <ul className="mb-0 mt-1 ps-3" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                                    {phoneValidation.invalid.map(x => (
                                                        <li key={x.id}>{x.name}: {x.raw}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="mb-3">
                                    <label className="form-label">Pesan <span className="text-danger">*</span></label>
                                    <textarea
                                        rows={8}
                                        className="form-control"
                                        placeholder="Isi pesan promo yang akan dikirim via WA..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    />
                                    <small className="text-muted">Pesan akan dikirim ke nomor WA yang valid di atas.</small>
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-success w-100"
                                    disabled={loading || selectedParticipants.length === 0 || phoneValidation.validCount === 0}
                                >
                                    <FiSend size={16} className="me-2" />
                                    {loading ? 'Mengirim...' : phoneValidation.validCount > 0
                                        ? `Kirim WA ke ${phoneValidation.validCount} Peserta`
                                        : selectedParticipants.length === 0
                                            ? 'Pilih peserta'
                                            : 'Tidak ada nomor valid'}
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



