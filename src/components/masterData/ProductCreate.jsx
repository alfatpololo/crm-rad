'use client'
import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { createProduct } from '@/actions/masterData'
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import Image from 'next/image'

const ProductCreate = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef(null)
    const { uploadImage, uploading, uploadedUrl, error: uploadError, resetUpload } = useCloudinaryUpload()
    const [imagePreview, setImagePreview] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) {
            Swal.fire('Error', 'File harus berupa gambar', 'error')
            return
        }
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            Swal.fire('Error', 'Ukuran gambar maksimal 10MB', 'error')
            return
        }
        setSelectedFile(file)
        const reader = new FileReader()
        reader.onload = () => setImagePreview(reader.result)
        reader.readAsDataURL(file)

        const result = await uploadImage(file, 'products')
        if (!result.success) {
            Swal.fire('Error', result.error || 'Gagal mengupload gambar', 'error')
            setSelectedFile(null)
            setImagePreview(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleRemoveImage = () => {
        setSelectedFile(null)
        setImagePreview(null)
        resetUpload()
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.target)

        let imageUrl = uploadedUrl || (formData.get('imageUrl') || '').trim() || undefined
        if (selectedFile && !uploadedUrl && !uploading) {
            const uploadResult = await uploadImage(selectedFile, 'products')
            if (uploadResult.success && uploadResult.url) imageUrl = uploadResult.url
        } else if (uploading && selectedFile) {
            await Swal.fire('Info', 'Tunggu gambar selesai diupload...', 'info')
            setLoading(false)
            return
        }

        const data = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')),
            category: formData.get('category'),
            imageUrl: imageUrl || undefined,
            status: 'active'
        }

        const result = await createProduct(data)

        if (result.success) {
            Swal.fire('Success', 'Product created successfully', 'success')
            router.push('/master-data/products')
        } else {
            Swal.fire('Error', result.error, 'error')
        }
        setLoading(false)
    }

    return (
        <div className="col-lg-12">
            <div className="card border-top-0">
                <div className="card-header p-0">
                    <ul className="nav nav-tabs flex-wrap w-100 text-center" role="tablist">
                        <li className="nav-item flex-fill border-top">
                            <a className="nav-link active">Product Details</a>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Product Name</label>
                            <div className="col-md-8">
                                <input name="name" type="text" className="form-control" required />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Price</label>
                            <div className="col-md-8">
                                <input name="price" type="number" className="form-control" required />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Stock</label>
                            <div className="col-md-8">
                                <input name="stock" type="number" className="form-control" defaultValue="0" required />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Category</label>
                            <div className="col-md-8">
                                <input name="category" type="text" className="form-control" placeholder="e.g., Merchandise" />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Gambar Produk</label>
                            <div className="col-md-8">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="form-control"
                                    style={{ display: 'none' }}
                                />
                                {imagePreview || uploadedUrl ? (
                                    <div className="position-relative" style={{ maxWidth: '400px' }}>
                                        <div
                                            className="border rounded p-2 position-relative"
                                            style={{ width: '100%', height: '200px', overflow: 'hidden', backgroundColor: '#f8f9fa' }}
                                        >
                                            <Image
                                                src={uploadedUrl || imagePreview}
                                                alt="Preview"
                                                fill
                                                className="object-cover rounded"
                                                sizes="(max-width: 400px) 100vw, 400px"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger mt-2"
                                            onClick={handleRemoveImage}
                                            disabled={uploading}
                                        >
                                            <FiX size={14} className="me-1" />
                                            Hapus Gambar
                                        </button>
                                        {uploading && (
                                            <div className="mt-2">
                                                <div className="progress" style={{ height: '6px' }}>
                                                    <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: '100%' }} />
                                                </div>
                                                <small className="text-muted">Mengupload...</small>
                                            </div>
                                        )}
                                        {uploadedUrl && !uploading && (
                                            <div className="mt-2">
                                                <small className="text-success">
                                                    <FiImage size={14} className="me-1" />
                                                    Gambar sudah diupload
                                                </small>
                                            </div>
                                        )}
                                        {uploadError && (
                                            <div className="mt-2">
                                                <small className="text-danger">{uploadError}</small>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                        >
                                            <FiUpload size={16} className="me-2" />
                                            {uploading ? 'Mengupload...' : 'Upload Gambar'}
                                        </button>
                                        <p className="text-muted small mt-2 mb-0">atau isi URL di bawah (opsional)</p>
                                    </div>
                                )}
                                <div className="mt-2">
                                    <input name="imageUrl" type="url" className="form-control form-control-sm" placeholder="https://... (opsional jika sudah upload)" />
                                </div>
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Description</label>
                            <div className="col-md-8">
                                <textarea name="description" className="form-control" rows="4"></textarea>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light" onClick={() => router.back()}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Product'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ProductCreate
