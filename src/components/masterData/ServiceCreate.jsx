'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { createService, getCategories, getServiceTypes } from '@/actions/masterData'
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import Image from 'next/image'

const ServiceCreate = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState('') // Will be set from service types
    const [categories, setCategories] = useState([])
    const [serviceTypes, setServiceTypes] = useState([])
    const fileInputRef = useRef(null)
    
    // Cloudinary upload hook
    const { uploadImage, uploading, uploadedUrl, error: uploadError, resetUpload } = useCloudinaryUpload()
    const [imagePreview, setImagePreview] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)

    // Load categories and service types from database
    useEffect(() => {
        const loadData = async () => {
            try {
                const [cats, types] = await Promise.all([
                    getCategories(),
                    getServiceTypes()
                ])
                // Filter only active categories
                const activeCategories = cats.filter(cat => cat.status === 'active')
                setCategories(activeCategories)
                // Filter only active service types
                const activeTypes = types.filter(type => type.status === 'active')
                setServiceTypes(activeTypes)
                // Set default type to first active type if available
                if (activeTypes.length > 0 && !type) {
                    setType(activeTypes[0].code)
                }
            } catch (error) {
                console.error('Error loading data:', error)
            }
        }
        loadData()
    }, [])

    const handleImageSelect = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            Swal.fire('Error', 'File harus berupa gambar', 'error')
            return
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
            Swal.fire('Error', 'Ukuran gambar maksimal 10MB', 'error')
            return
        }

        setSelectedFile(file)

        // Create preview
        const reader = new FileReader()
        reader.onload = () => {
            setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)

        // Upload to Cloudinary
        const result = await uploadImage(file, 'services')
        
        if (!result.success) {
            Swal.fire('Error', result.error || 'Gagal mengupload gambar', 'error')
            setSelectedFile(null)
            setImagePreview(null)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemoveImage = () => {
        setSelectedFile(null)
        setImagePreview(null)
        resetUpload()
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        
        // Check if free checkbox is checked and remove required from price input
        const isFreeCheckbox = document.getElementById('isFree-checkbox-create')
        const priceInputElement = document.getElementById('price-input-create')
        if (isFreeCheckbox && isFreeCheckbox.checked && priceInputElement) {
            priceInputElement.removeAttribute('required')
            priceInputElement.value = '0'
        }
        
        setLoading(true)
        const formData = new FormData(e.target)

        const startDateStr = formData.get('startDate')
        const endDateStr = formData.get('endDate')
        const isFreeChecked = formData.get('isFree') === 'on'
        const priceValue = parseFloat(formData.get('price') || 0)
        const isFree = isFreeChecked || priceValue === 0
        const price = isFree ? 0 : priceValue

        // Validate dates (required for both class and event)
        if (!startDateStr || !endDateStr) {
            Swal.fire('Error', 'Tanggal mulai dan akhir harus diisi', 'error')
            setLoading(false)
            return
        }
        
        if (new Date(endDateStr) < new Date(startDateStr)) {
            Swal.fire('Error', 'Tanggal akhir tidak boleh lebih awal dari tanggal mulai', 'error')
            setLoading(false)
            return
        }

        // Validate price only if not free
        if (!isFree && (!price || price <= 0)) {
            Swal.fire('Error', 'Harga harus diisi dan lebih dari 0', 'error')
            setLoading(false)
            return
        }

        // If image selected but not yet uploaded, upload it first
        let imageUrl = uploadedUrl
        if (selectedFile && !uploadedUrl && !uploading) {
            Swal.fire({
                title: 'Mengupload gambar...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })
            
            const uploadResult = await uploadImage(selectedFile, 'services')
            
            if (!uploadResult.success) {
                Swal.fire('Error', uploadResult.error || 'Gagal mengupload gambar', 'error')
                setLoading(false)
                return
            }
            
            imageUrl = uploadResult.url
            Swal.close()
        }

        // Wait for upload to complete if still uploading
        if (uploading) {
            Swal.fire({
                title: 'Mengupload gambar...',
                text: 'Mohon tunggu hingga upload selesai',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })
            
            // Wait for upload to complete (polling)
            let attempts = 0
            const maxAttempts = 60 // 60 seconds timeout
            while (uploading && !uploadedUrl && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                attempts++
            }
            
            Swal.close()
            
            if (!uploadedUrl && selectedFile) {
                Swal.fire('Error', 'Upload gambar gagal atau timeout', 'error')
                setLoading(false)
                return
            }
            
            imageUrl = uploadedUrl
        }

        // Determine final price and isFree status
        const finalIsFree = isFree || price === 0
        const finalPrice = finalIsFree ? 0 : price

        const data = {
            type: formData.get('type') || 'class',
            name: formData.get('name'),
            description: formData.get('description'),
            price: finalPrice,
            isFree: finalIsFree,
            category: formData.get('category') || '',
            capacity: parseInt(formData.get('capacity') || 0),
            instructor: formData.get('instructor') || '',
            startDate: startDateStr,
            endDate: endDateStr,
            location: formData.get('location') || '',
            status: formData.get('status') || 'active',
            imageUrl: imageUrl || null, // Add image URL from Cloudinary
        }

        try {
            console.log('Submitting form with data:', data)
            const result = await createService(data)
            console.log('Create service result:', result)

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: data.type === 'event' ? 'Event berhasil ditambahkan' : 'Kelas berhasil ditambahkan',
                    showConfirmButton: true,
                })
                router.push('/master-data/services')
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    html: `<p>${result.error || 'Gagal menambahkan data'}</p><p class="small text-muted mt-2">Silakan cek console untuk detail error.</p>`,
                    confirmButtonText: 'OK'
                })
                console.error('Create service failed:', result)
            }
        } catch (error) {
            console.error('Error creating service:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                html: `<p>${error.message || 'Terjadi kesalahan saat menyimpan data'}</p><p class="small text-muted mt-2">Silakan cek console untuk detail error.</p>`,
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
                            <a className="nav-link active">Detail {type === 'event' ? 'Event' : 'Kelas'}</a>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Jenis <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <select 
                                    name="type" 
                                    className="form-control" 
                                    required
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="">Pilih Jenis Layanan</option>
                                    {serviceTypes.map((st) => (
                                        <option key={st.id} value={st.code}>
                                            {st.name}
                                        </option>
                                    ))}
                                </select>
                                {serviceTypes.length === 0 && (
                                    <small className="text-warning d-block mt-1">
                                        Belum ada jenis layanan. <a href="/master-data/service-types/create" className="text-primary">Buat jenis layanan baru</a>
                                    </small>
                                )}
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Nama {type === 'event' ? 'Event' : 'Kelas'} <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <input name="name" type="text" className="form-control" required placeholder={`Nama ${type === 'event' ? 'event' : 'kelas'}...`} />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Deskripsi</label>
                            <div className="col-md-8">
                                <textarea name="description" className="form-control" rows="4" placeholder="Deskripsi lengkap..."></textarea>
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Harga (Rp) <span className="text-danger" id="price-required-asterisk">*</span></label>
                            <div className="col-md-8">
                                <input 
                                    name="price" 
                                    type="number" 
                                    className="form-control" 
                                    id="price-input-create"
                                    min="0" 
                                    placeholder="0" 
                                />
                                <div className="form-check mt-2">
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        name="isFree"
                                        id="isFree-checkbox-create"
                                        onChange={(e) => {
                                            const priceInput = document.getElementById('price-input-create')
                                            const asterisk = document.getElementById('price-required-asterisk')
                                            if (e.target.checked) {
                                                priceInput.value = '0'
                                                priceInput.required = false
                                                priceInput.disabled = true
                                                priceInput.removeAttribute('required')
                                                priceInput.setAttribute('data-free', 'true')
                                                if (asterisk) asterisk.style.display = 'none'
                                            } else {
                                                priceInput.required = true
                                                priceInput.disabled = false
                                                priceInput.setAttribute('required', 'required')
                                                priceInput.removeAttribute('data-free')
                                                if (asterisk) asterisk.style.display = 'inline'
                                            }
                                        }}
                                    />
                                    <label className="form-check-label" htmlFor="isFree-checkbox-create">
                                        Kelas Gratis (Bypass Payment)
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Kategori</label>
                            <div className="col-md-8">
                                <select name="category" className="form-control">
                                    <option value="">Pilih Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <small className="text-muted">
                                    Pilih kategori yang sesuai dengan {type === 'event' ? 'event' : 'kelas'} ini. 
                                    {categories.length === 0 && (
                                        <span className="text-warning ms-1">Belum ada kategori. <a href="/master-data/categories/create" className="text-primary">Buat kategori baru</a></span>
                                    )}
                                </small>
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Gambar {type === 'event' ? 'Event' : 'Kelas'}</label>
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
                                            style={{ 
                                                width: '100%', 
                                                height: '200px', 
                                                overflow: 'hidden',
                                                backgroundColor: '#f8f9fa'
                                            }}
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
                                                    <div 
                                                        className="progress-bar progress-bar-striped progress-bar-animated" 
                                                        role="progressbar" 
                                                        style={{ width: '100%' }}
                                                    ></div>
                                                </div>
                                                <small className="text-muted">Mengupload ke Cloudinary...</small>
                                            </div>
                                        )}
                                        {uploadedUrl && !uploading && (
                                            <div className="mt-2">
                                                <small className="text-success">
                                                    <FiImage size={14} className="me-1" />
                                                    Gambar sudah diupload ke Cloudinary
                                                </small>
                                            </div>
                                        )}
                                        {uploadError && (
                                            <div className="mt-2">
                                                <small className="text-danger">Error: {uploadError}</small>
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
                                            {uploading ? 'Mengupload...' : 'Pilih Gambar'}
                                        </button>
                                        <small className="d-block text-muted mt-1">
                                            Format: JPG, PNG, GIF, WEBP (Max 10MB)
                                        </small>
                                        {uploadError && (
                                            <div className="mt-2">
                                                <small className="text-danger">Error: {uploadError}</small>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Tanggal Mulai <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <input 
                                    name="startDate" 
                                    type="date" 
                                    className="form-control" 
                                    onClick={(e) => e.target.showPicker?.()} 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Tanggal Akhir <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <input 
                                    name="endDate" 
                                    type="date" 
                                    className="form-control" 
                                    onClick={(e) => e.target.showPicker?.()} 
                                    required 
                                />
                            </div>
                        </div>
                        {type === 'class' ? (
                            <>
                                <div className="row mb-4">
                                    <label className="col-md-4 col-form-label">Kapasitas Peserta</label>
                                    <div className="col-md-8">
                                        <input name="capacity" type="number" className="form-control" placeholder="e.g., 30" min="1" />
                                    </div>
                                </div>
                                <div className="row mb-4">
                                    <label className="col-md-4 col-form-label">Instruktur</label>
                                    <div className="col-md-8">
                                        <input name="instructor" type="text" className="form-control" placeholder="e.g., John Doe" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="row mb-4">
                                    <label className="col-md-4 col-form-label">Lokasi</label>
                                    <div className="col-md-8">
                                        <input name="location" type="text" className="form-control" placeholder="e.g., Jakarta Convention Center" />
                                    </div>
                                </div>
                                <div className="row mb-4">
                                    <label className="col-md-4 col-form-label">Kapasitas Peserta</label>
                                    <div className="col-md-8">
                                        <input name="capacity" type="number" className="form-control" placeholder="e.g., 100" min="1" />
                                    </div>
                                </div>
                            </>
                        )}
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
                            <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                                {loading || uploading ? 'Menyimpan...' : `Simpan ${type === 'event' ? 'Event' : 'Kelas'}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ServiceCreate
