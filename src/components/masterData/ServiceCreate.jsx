'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { createService, getCategories, getServiceTypes } from '@/actions/masterData'
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import Image from 'next/image'

const defaultTier = () => ({ label: '', price: '', startDate: '', endDate: '' })

const ServiceCreate = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState('')
    const [categories, setCategories] = useState([])
    const [serviceTypes, setServiceTypes] = useState([])
    const [usePriceTiers, setUsePriceTiers] = useState(false)
    const [priceTiers, setPriceTiers] = useState([defaultTier()])
    const [promo, setPromo] = useState({ enabled: false, type: 'percent', value: '', code: '', label: '', startDate: '', endDate: '' })
    /** full = lunas 1× langsung akses; installment3 = cicilan 3×, akses setelah tahap ke-3 lunas — aturan kelas, bukan bagian dari tier */
    const [paymentModel, setPaymentModel] = useState('full')
    /** Harga tunggal + centang gratis */
    const [markAsFree, setMarkAsFree] = useState(false)
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

        const startDateStr = formData.get('startDate') || null
        const endDateStr = formData.get('endDate') || null
        const isFreeChecked = formData.get('isFree') === 'on'
        const priceValue = parseFloat(formData.get('price') || 0)
        const isFree = isFreeChecked || priceValue === 0
        const price = isFree ? 0 : priceValue
        const useTiers = usePriceTiers && priceTiers.length > 0

        if (useTiers) {
            const tiersToSend = priceTiers.filter(t => t.label.trim())
            if (tiersToSend.length === 0) {
                Swal.fire('Error', 'Minimal satu tier harga harus diisi (label + harga)', 'error')
                setLoading(false)
                return
            }
        } else if (!isFree && (!price || price <= 0)) {
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

        const pmRaw = formData.get('paymentModel') || paymentModel || 'full'
        const paymentMilestoneCount = finalIsFree ? '1' : pmRaw === 'installment3' ? '3' : '1'

        const data = {
            type: formData.get('type') || 'class',
            name: formData.get('name'),
            description: formData.get('description'),
            price: finalPrice,
            isFree: finalIsFree,
            category: formData.get('category') || '',
            capacity: parseInt(formData.get('capacity') || 0),
            instructor: formData.get('instructor') || '',
            startDate: startDateStr || null,
            endDate: endDateStr || null,
            location: formData.get('location') || '',
            status: formData.get('status') || 'active',
            imageUrl: imageUrl || null,
            installmentTerms: '3, 4, 5',
            minDp: null,
            paymentMilestoneCount,
        }
        if (useTiers) {
            data.priceTiers = priceTiers.filter(t => t.label.trim()).map(t => ({
                label: t.label.trim(),
                price: parseFloat(t.price) || 0,
                startDate: t.startDate || null,
                endDate: t.endDate || null,
            }))
        }
        data.promo = promo.enabled ? {
            enabled: true,
            type: promo.type,
            value: parseFloat(promo.value) || 0,
            code: promo.code.trim() || null,
            label: promo.label.trim() || null,
            startDate: promo.startDate || null,
            endDate: promo.endDate || null,
        } : { enabled: false }

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
                            <label className="col-md-4 col-form-label">Harga</label>
                            <div className="col-md-8">
                                <div className="form-check mb-3">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="usePriceTiers-create"
                                        checked={usePriceTiers}
                                        onChange={(e) => setUsePriceTiers(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="usePriceTiers-create">
                                        Gunakan tier harga (Early Bird, Presale, Normal, dll.)
                                    </label>
                                </div>
                                {!usePriceTiers && (
                                    <>
                                        <label className="form-label small text-muted">Harga tunggal (Rp) <span className="text-danger">*</span></label>
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
                                                    setMarkAsFree(e.target.checked)
                                                    if (e.target.checked) {
                                                        priceInput.value = '0'
                                                        priceInput.required = false
                                                        priceInput.disabled = true
                                                        if (asterisk) asterisk.style.display = 'none'
                                                        setPaymentModel('full')
                                                    } else {
                                                        priceInput.required = true
                                                        priceInput.disabled = false
                                                        if (asterisk) asterisk.style.display = 'inline'
                                                    }
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor="isFree-checkbox-create">
                                                Kelas Gratis (Bypass Payment)
                                            </label>
                                        </div>
                                    </>
                                )}
                                {usePriceTiers && (
                                    <div className="border rounded p-3 bg-light">
                                        <p className="small text-muted mb-3">
                                            <strong>Tier</strong>: nama + harga + periode aktif (mis. Early Bird sampai tanggal tertentu).
                                        </p>
                                        {priceTiers.map((tier, idx) => (
                                            <div key={idx} className="row g-2 mb-3 align-items-end">
                                                <div className="col-md-3">
                                                    <label className="form-label small">Nama Tier</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="e.g. Early Bird"
                                                        value={tier.label}
                                                        onChange={(e) => { const next = [...priceTiers]; next[idx] = { ...next[idx], label: e.target.value }; setPriceTiers(next) }}
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="form-label small">Harga (Rp)</label>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        min="0"
                                                        placeholder="0"
                                                        value={tier.price}
                                                        onChange={(e) => { const next = [...priceTiers]; next[idx] = { ...next[idx], price: e.target.value }; setPriceTiers(next) }}
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label small">Aktif dari</label>
                                                    <input
                                                        type="date"
                                                        className="form-control form-control-sm"
                                                        value={tier.startDate || ''}
                                                        onChange={(e) => { const next = [...priceTiers]; next[idx] = { ...next[idx], startDate: e.target.value }; setPriceTiers(next) }}
                                                    />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label small">Aktif sampai</label>
                                                    <input
                                                        type="date"
                                                        className="form-control form-control-sm"
                                                        value={tier.endDate || ''}
                                                        onChange={(e) => { const next = [...priceTiers]; next[idx] = { ...next[idx], endDate: e.target.value }; setPriceTiers(next) }}
                                                    />
                                                </div>
                                                <div className="col-md-1">
                                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setPriceTiers(priceTiers.filter((_, i) => i !== idx))} disabled={priceTiers.length <= 1} title="Hapus tier">
                                                        <FiX size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setPriceTiers([...priceTiers, defaultTier()])}>
                                            + Tambah Tier
                                        </button>
                                    </div>
                                )}

                                {(usePriceTiers || !markAsFree) && (
                                    <div className="mt-3 pt-3 border-top">
                                        <label className="form-label small fw-semibold d-block mb-1">Akses kelas (aturan pembayaran)</label>
                                        <p className="small text-muted mb-3">
                                            Ini mengatur <strong>kapan peserta boleh akses materi</strong> setelah bayar di payment gateway — terpisah dari daftar tier di atas. Harga yang dipakai tetap mengikuti tier yang aktif.
                                        </p>
                                        <div className="border rounded p-3 bg-light">
                                            <div className="form-check mb-2">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="paymentModel"
                                                    id="pm-full-create"
                                                    value="full"
                                                    checked={paymentModel === 'full'}
                                                    onChange={() => setPaymentModel('full')}
                                                />
                                                <label className="form-check-label" htmlFor="pm-full-create">
                                                    <strong>Bayar penuh sekali</strong> — total (sesuai tier aktif) dibayar 1×; setelah lunas langsung dapat akses.
                                                </label>
                                            </div>
                                            <div className="form-check mb-0">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="paymentModel"
                                                    id="pm-inst3-create"
                                                    value="installment3"
                                                    checked={paymentModel === 'installment3'}
                                                    onChange={() => setPaymentModel('installment3')}
                                                />
                                                <label className="form-check-label" htmlFor="pm-inst3-create">
                                                    <strong>Cicilan 3× ke gateway</strong> — total dibagi 3 invoice; <strong>akses kelas baru setelah pembayaran ke-3</strong> lunas.
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Promo</label>
                            <div className="col-md-8">
                                <div className="form-check mb-3">
                                    <input type="checkbox" className="form-check-input" id="promo-enable-create" checked={promo.enabled} onChange={(e) => setPromo(p => ({ ...p, enabled: e.target.checked }))} />
                                    <label className="form-check-label" htmlFor="promo-enable-create">Aktifkan promo / diskon untuk kelas ini</label>
                                </div>
                                {promo.enabled && (
                                    <div className="border rounded p-3 bg-light">
                                        <div className="row g-2 mb-2">
                                            <div className="col-md-6">
                                                <label className="form-label small">Tipe diskon</label>
                                                <select className="form-control form-control-sm" value={promo.type} onChange={(e) => setPromo(p => ({ ...p, type: e.target.value }))}>
                                                    <option value="percent">Persentase (%)</option>
                                                    <option value="fixed">Potongan harga (Rp)</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small">{promo.type === 'percent' ? 'Diskon (%)' : 'Potongan (Rp)'}</label>
                                                <input type="number" className="form-control form-control-sm" min="0" max={promo.type === 'percent' ? 100 : undefined} placeholder={promo.type === 'percent' ? '10' : '50000'} value={promo.value} onChange={(e) => setPromo(p => ({ ...p, value: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="row g-2 mb-2">
                                            <div className="col-md-6">
                                                <label className="form-label small">Nama promo (opsional)</label>
                                                <input type="text" className="form-control form-control-sm" placeholder="e.g. Early Bird" value={promo.label} onChange={(e) => setPromo(p => ({ ...p, label: e.target.value }))} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small">Kode promo (kosong = otomatis untuk semua)</label>
                                                <input type="text" className="form-control form-control-sm" placeholder="e.g. GRATIS50" value={promo.code} onChange={(e) => setPromo(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                                            </div>
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-md-6">
                                                <label className="form-label small">Masa berlaku mulai</label>
                                                <input type="date" className="form-control form-control-sm" value={promo.startDate} onChange={(e) => setPromo(p => ({ ...p, startDate: e.target.value }))} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small">Masa berlaku selesai</label>
                                                <input type="date" className="form-control form-control-sm" value={promo.endDate} onChange={(e) => setPromo(p => ({ ...p, endDate: e.target.value }))} />
                                            </div>
                                        </div>
                                    </div>
                                )}
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
