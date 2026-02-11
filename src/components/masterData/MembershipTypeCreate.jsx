'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { createMembershipType } from '@/actions/masterData'

export default function MembershipTypeCreate() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.target)
        const data = {
            name: formData.get('name'),
            price: formData.get('price'),
            durationMonths: formData.get('durationMonths'),
            description: formData.get('description') || '',
            status: formData.get('status') || 'active',
        }
        try {
            const result = await createMembershipType(data)
            if (result.success) {
                await Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Tipe membership berhasil ditambahkan' })
                router.push('/master-data/membership-types')
            } else {
                Swal.fire({ icon: 'error', title: 'Gagal', text: result.error })
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="col-lg-12">
            <div className="card border-top-0">
                <div className="card-header p-0">
                    <ul className="nav nav-tabs flex-wrap w-100 text-center" role="tablist">
                        <li className="nav-item flex-fill border-top">
                            <a className="nav-link active">Tambah Tipe Membership</a>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Nama Membership <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <input name="name" type="text" className="form-control" required placeholder="Contoh: Premium 1 Tahun" />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Harga (Rp) <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <input name="price" type="number" className="form-control" required min="0" step="1" placeholder="0" />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Durasi (bulan) <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <input name="durationMonths" type="number" className="form-control" required min="1" placeholder="12" />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Deskripsi</label>
                            <div className="col-md-8">
                                <textarea name="description" className="form-control" rows="3" placeholder="Manfaat membership..." />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Status</label>
                            <div className="col-md-8">
                                <select name="status" className="form-select">
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                </select>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light" onClick={() => router.back()}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
