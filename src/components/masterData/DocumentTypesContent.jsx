'use client'

import React, { useState } from 'react'
import Swal from 'sweetalert2'
import { getRequiredDocumentTypes, setRequiredDocumentTypes } from '@/actions/documentTypes'
import { FiPlus, FiTrash2 } from 'react-icons/fi'

export default function DocumentTypesContent({ initialTypes = [] }) {
    const [types, setTypes] = useState(initialTypes)
    const [saving, setSaving] = useState(false)
    const [newLabel, setNewLabel] = useState('')

    const handleAdd = () => {
        const label = newLabel.trim()
        if (!label) {
            Swal.fire('Perhatian', 'Isi nama dokumen', 'warning')
            return
        }
        const id = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        if (!id) {
            Swal.fire('Perhatian', 'Nama dokumen tidak valid', 'warning')
            return
        }
        if (types.some(t => t.id === id)) {
            Swal.fire('Perhatian', 'Jenis dokumen ini sudah ada', 'warning')
            return
        }
        setTypes([...types, { id, label }])
        setNewLabel('')
    }

    const handleRemove = (id) => {
        setTypes(types.filter(t => t.id !== id))
    }

    const handleLabelChange = (id, label) => {
        setTypes(types.map(t => t.id === id ? { ...t, label } : t))
    }

    const handleSave = async () => {
        if (types.length === 0) {
            Swal.fire('Perhatian', 'Minimal satu jenis dokumen wajib', 'warning')
            return
        }
        setSaving(true)
        try {
            const result = await setRequiredDocumentTypes(types)
            if (result.success) {
                await Swal.fire('Berhasil', 'Dokumen wajib berhasil disimpan.', 'success')
                const fresh = await getRequiredDocumentTypes()
                if (fresh.types) setTypes(fresh.types)
            } else {
                Swal.fire('Error', result.error || 'Gagal menyimpan', 'error')
            }
        } catch (err) {
            Swal.fire('Error', err.message || 'Terjadi kesalahan', 'error')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-bottom">
                <h5 className="card-title mb-0 fw-bold">Dokumen Wajib (Upload Peserta)</h5>
            </div>
            <div className="card-body">
                <p className="text-muted small mb-4">
                    Daftar dokumen yang harus diupload peserta setelah pembayaran DP. Peserta akan memilih kelas lalu mengupload sesuai daftar ini.
                </p>

                <div className="mb-4 d-flex gap-2 flex-wrap align-items-end">
                    <div className="flex-grow-1" style={{ minWidth: '200px' }}>
                        <label className="form-label small">Tambah jenis dokumen</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Contoh: KTP, Surat Keterangan Kerja"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                        />
                    </div>
                    <button type="button" className="btn btn-outline-primary" onClick={handleAdd}>
                        <FiPlus size={16} className="me-1" /> Tambah
                    </button>
                </div>

                <ul className="list-group list-group-flush mb-4">
                    {types.map((t) => (
                        <li key={t.id} className="list-group-item d-flex align-items-center gap-2 px-0">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                value={t.label}
                                onChange={(e) => handleLabelChange(t.id, e.target.value)}
                                style={{ maxWidth: '320px' }}
                            />
                            <span className="text-muted small">(id: {t.id})</span>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger ms-auto"
                                onClick={() => handleRemove(t.id)}
                                title="Hapus"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        </li>
                    ))}
                </ul>

                {types.length === 0 && (
                    <p className="text-muted small">Belum ada jenis dokumen. Default: CV dan Ijazah Terakhir.</p>
                )}

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving || types.length === 0}
                >
                    {saving ? 'Menyimpan...' : 'Simpan Daftar Dokumen Wajib'}
                </button>
            </div>
        </div>
    )
}
