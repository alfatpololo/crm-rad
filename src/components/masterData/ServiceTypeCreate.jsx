'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { createServiceType } from '@/actions/masterData'

const ServiceTypeCreate = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [code, setCode] = useState('')

    const handleCodeChange = (e) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
        setCode(value)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.target)

        const data = {
            name: formData.get('name'),
            code: formData.get('code'),
            description: formData.get('description') || '',
            status: formData.get('status') || 'active',
        }

        try {
            const result = await createServiceType(data)

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Jenis layanan berhasil ditambahkan',
                    showConfirmButton: true,
                })
                router.push('/master-data/service-types')
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    html: `<p>${result.error || 'Gagal menambahkan data'}</p>`,
                    confirmButtonText: 'OK'
                })
                console.error('Create service type failed:', result)
            }
        } catch (error) {
            console.error('Error creating service type:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                html: `<p>${error.message || 'Terjadi kesalahan saat menyimpan data'}</p>`,
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
                            <a className="nav-link active">Detail Jenis Layanan</a>
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
                                    value={code}
                                    onChange={handleCodeChange}
                                    placeholder="contoh: class, event, workshop" 
                                    pattern="[a-z0-9-]+"
                                    title="Hanya huruf kecil, angka, dan tanda strip"
                                />
                                <small className="text-muted">Kode harus unik, hanya huruf kecil, angka, dan tanda strip (contoh: class, event)</small>
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Deskripsi</label>
                            <div className="col-md-8">
                                <textarea 
                                    name="description" 
                                    className="form-control" 
                                    rows="4" 
                                    placeholder="Deskripsi jenis layanan (opsional)"
                                ></textarea>
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Status</label>
                            <div className="col-md-8">
                                <select name="status" className="form-control">
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Tidak Aktif</option>
                                </select>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light" onClick={() => router.back()}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Menyimpan...' : 'Simpan Jenis Layanan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ServiceTypeCreate



