'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { updateCategory } from '@/actions/masterData'

const CategoryEdit = ({ category }) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active'
    })

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                description: category.description || '',
                status: category.status || 'active'
            })
        }
    }, [category])

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await updateCategory(category.id, formData)

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Kategori berhasil diupdate',
                    showConfirmButton: true,
                })
                router.push('/master-data/categories')
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    html: `<p>${result.error || 'Gagal mengupdate data'}</p>`,
                    confirmButtonText: 'OK'
                })
                console.error('Update category failed:', result)
            }
        } catch (error) {
            console.error('Error updating category:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                html: `<p>${error.message || 'Terjadi kesalahan saat mengupdate data'}</p>`,
                confirmButtonText: 'OK'
            })
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
                            <a className="nav-link active">Detail Kategori</a>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Nama Kategori <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <input 
                                    name="name" 
                                    type="text" 
                                    className="form-control" 
                                    required 
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Teknologi, Bisnis, Kesehatan..." 
                                />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Deskripsi</label>
                            <div className="col-md-8">
                                <textarea 
                                    name="description" 
                                    className="form-control" 
                                    rows="4" 
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Deskripsi kategori (opsional)"
                                ></textarea>
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Status</label>
                            <div className="col-md-8">
                                <select 
                                    name="status" 
                                    className="form-control"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Tidak Aktif</option>
                                </select>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light" onClick={() => router.back()}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Menyimpan...' : 'Update Kategori'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CategoryEdit



