'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { getMembershipType, updateMembershipType } from '@/actions/masterData'

export default function MembershipTypeEdit({ membershipType }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        name: '',
        price: '',
        durationMonths: '',
        description: '',
        status: 'active',
    })

    useEffect(() => {
        if (membershipType) {
            setForm({
                name: membershipType.name || '',
                price: membershipType.price ?? '',
                durationMonths: membershipType.durationMonths ?? '',
                description: membershipType.description || '',
                status: membershipType.status || 'active',
            })
        }
    }, [membershipType])

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            const result = await updateMembershipType(membershipType.id, form)
            if (result.success) {
                await Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Tipe membership berhasil diubah' })
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
                            <a className="nav-link active">Edit Tipe Membership</a>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Nama Membership <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    name="name"
                                    type="text"
                                    className="form-control"
                                    required
                                />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Harga (Rp) <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <input
                                    value={form.price}
                                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                                    name="price"
                                    type="number"
                                    className="form-control"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Durasi (bulan) <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <input
                                    value={form.durationMonths}
                                    onChange={(e) => setForm((f) => ({ ...f, durationMonths: e.target.value }))}
                                    name="durationMonths"
                                    type="number"
                                    className="form-control"
                                    required
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Deskripsi</label>
                            <div className="col-md-8">
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    name="description"
                                    className="form-control"
                                    rows="3"
                                />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Status</label>
                            <div className="col-md-8">
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                                    name="status"
                                    className="form-select"
                                >
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
