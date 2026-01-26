'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { updateServiceType } from '@/actions/masterData'

const ServiceTypeEdit = ({ serviceType }) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        status: 'active'
    })

    useEffect(() => {
        if (serviceType) {
            setFormData({
                name: serviceType.name || '',
                code: serviceType.code || '',
                description: serviceType.description || '',
                status: serviceType.status || 'active'
            })
        }
    }, [serviceType])

    const handleCodeChange = (e) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
        setFormData({ ...formData, code: value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await updateServiceType(serviceType.id, formData)

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Jenis layanan berhasil diupdate',
                    showConfirmButton: true,
                })
                router.push('/master-data/service-types')
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    html: `<p>${result.error || 'Gagal mengupdate data'}</p>`,
                    confirmButtonText: 'OK'
                })
                console.error('Update service type failed:', result)
            }
        } catch (error) {
            console.error('Error updating service type:', error)
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

    if (!serviceType) {
        return <div>Loading...</div>
    }

    return (
        <div className="col-lg-12">
            <div className="card border-top-0">
                <div className="card-header p-0">
                    <ul className="nav nav-tabs flex-wrap w-100 text-center" role="tablist">
                        <li className="nav-item flex-fill border-top">
                            <a className="nav-link active">Edit Jenis Layanan</a>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Nama Jenis <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <input 
                                    name="name" 
                                    type="text" 
                                    className="form-control" 
                                    required 
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Contoh: Kelas, Event, Workshop..." 
                                />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Kode <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <input 
                                    name="code" 
                                    type="text" 
                                    className="form-control" 
                                    required 
                                    value={formData.code}
                                    onChange={handleCodeChange}
                                    placeholder="contoh: class, event, workshop" 
                                    pattern="[a-z0-9-]+"
                                    title="Hanya huruf kecil, angka, dan tanda strip"
                                />
                                <small className="text-muted">Kode harus unik, hanya huruf kecil, angka, dan tanda strip</small>
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
                                    placeholder="Deskripsi jenis layanan (opsional)"
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
                                {loading ? 'Menyimpan...' : 'Update Jenis Layanan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ServiceTypeEdit



