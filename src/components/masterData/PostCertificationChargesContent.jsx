'use client'

import React, { useState } from 'react'
import { FiPlus, FiEdit3, FiTrash2, FiMoreHorizontal } from 'react-icons/fi'
import Swal from 'sweetalert2'
import Dropdown from '@/components/shared/Dropdown'
import Table from '@/components/shared/table/Table'
import {
    getPostCertificationCharges,
    createPostCertificationCharge,
    updatePostCertificationCharge,
    deletePostCertificationCharge,
} from '@/actions/postCertificationCharges'
import { formatShortCurrency } from '@/utils/formatCurrency'

const actions = [{ label: 'Edit', icon: <FiEdit3 /> }, { label: 'Hapus', icon: <FiTrash2 /> }]

export default function PostCertificationChargesContent({ data: initialData }) {
    const [list, setList] = useState(initialData || [])
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: '', amount: '' })
    const [loading, setLoading] = useState(false)

    const loadList = async () => {
        const data = await getPostCertificationCharges()
        setList(data)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        const name = (form.name || '').trim()
        const amount = parseFloat(form.amount)
        if (!name || isNaN(amount) || amount < 0) {
            Swal.fire('Perhatian', 'Nama dan jumlah wajib diisi.', 'warning')
            return
        }
        setLoading(true)
        try {
            if (editing) {
                const res = await updatePostCertificationCharge(editing.id, { name, amount })
                if (res.success) {
                    await Swal.fire('Berhasil', 'Tagihan diperbarui.', 'success')
                    setEditing(null)
                    setForm({ name: '', amount: '' })
                    setShowForm(false)
                    loadList()
                } else Swal.fire('Error', res.error || 'Gagal update', 'error')
            } else {
                const res = await createPostCertificationCharge({ name, amount })
                if (res.success) {
                    await Swal.fire('Berhasil', 'Tagihan ditambahkan.', 'success')
                    setForm({ name: '', amount: '' })
                    setShowForm(false)
                    loadList()
                } else Swal.fire('Error', res.error || 'Gagal simpan', 'error')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (row) => {
        const confirm = await Swal.fire({
            title: 'Hapus tagihan?',
            text: `"${row.name}" akan dihapus dari daftar.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
        })
        if (!confirm.isConfirmed) return
        setLoading(true)
        try {
            const res = await deletePostCertificationCharge(row.id)
            if (res.success) {
                await Swal.fire('Berhasil', 'Tagihan dihapus.', 'success')
                loadList()
            } else Swal.fire('Error', res.error || 'Gagal hapus', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleAction = (action, rowData) => {
        if (action === 'Edit') {
            setEditing(rowData)
            setForm({ name: rowData.name || '', amount: String(rowData.amount ?? '') })
            setShowForm(true)
        } else if (action === 'Hapus') {
            handleDelete(rowData)
        }
    }

    const columns = [
        { accessorKey: 'name', header: () => 'Nama Tagihan', cell: (info) => <span className="fw-bold">{info.getValue() || '-'}</span> },
        {
            accessorKey: 'amount',
            header: () => 'Jumlah (Rp)',
            cell: (info) => <span>{formatShortCurrency(info.getValue())}</span>,
        },
        {
            accessorKey: 'actions',
            header: () => 'Aksi',
            cell: (info) => {
                const rowData = info.row.original
                return (
                    <div className="hstack gap-2 justify-content-end">
                        <Dropdown
                            dropdownItems={actions}
                            triggerIcon={<FiMoreHorizontal />}
                            triggerClass="avatar-md"
                            triggerPosition={"0,21"}
                            onClick={(label) => handleAction(label, rowData)}
                            id={rowData.id}
                        />
                    </div>
                )
            },
            meta: { headerClassName: 'text-end' },
        },
    ]

    return (
        <div className="row">
            <div className="col-12">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-bottom d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-0 fw-bold">Tagihan Pasca-Sertifikasi</h5>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                setEditing(null)
                                setForm({ name: '', amount: '' })
                                setShowForm(!showForm)
                            }}
                        >
                            <FiPlus size={16} className="me-1" />
                            {showForm ? 'Tutup' : 'Tambah Tagihan'}
                        </button>
                    </div>
                    <div className="card-body">
                        {showForm && (
                            <form onSubmit={handleSave} className="border rounded p-3 bg-light mb-4">
                                <h6 className="mb-3">{editing ? 'Edit Tagihan' : 'Tambah Tagihan'}</h6>
                                <div className="row g-2 align-items-end">
                                    <div className="col-md-5">
                                        <label className="form-label small">Nama (misal: Membership CMA Australia)</label>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Nama tagihan"
                                            value={form.name}
                                            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label small">Jumlah (Rp)</label>
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            min="0"
                                            placeholder="0"
                                            value={form.amount}
                                            onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <button type="submit" className="btn btn-primary btn-sm me-2" disabled={loading}>
                                            {loading ? '...' : editing ? 'Update' : 'Simpan'}
                                        </button>
                                        {editing && (
                                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { setEditing(null); setForm({ name: '', amount: '' }) }}>
                                                Batal
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        )}
                        <Table data={list} columns={columns} />
                        {list.length === 0 && !showForm && (
                            <p className="text-muted text-center py-4 mb-0">Belum ada tagihan. Klik &quot;Tambah Tagihan&quot; untuk menambah (misal: Membership CMA Australia).</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
