'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'
import { updateService, getCategories, getServiceTypes } from '@/actions/masterData'
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload'
import { FiUpload, FiX, FiImage } from 'react-icons/fi'
import Image from 'next/image'

const defaultTier = () => ({ label: '', price: '', startDate: '', endDate: '' })

const ServiceEdit = ({ service }) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [type, setType] = useState(service?.type || '')
    const [categories, setCategories] = useState([])
    const [serviceTypes, setServiceTypes] = useState([])
    const [usePriceTiers, setUsePriceTiers] = useState(Array.isArray(service?.priceTiers) && service.priceTiers.length > 0)
    const [priceTiers, setPriceTiers] = useState(
        Array.isArray(service?.priceTiers) && service.priceTiers.length > 0
            ? service.priceTiers.map(t => {
                const start = t.startDate && (typeof t.startDate === 'string' ? t.startDate : t.startDate?.toDate?.()?.toISOString?.()?.split('T')[0]);
                const end = t.endDate && (typeof t.endDate === 'string' ? t.endDate : t.endDate?.toDate?.()?.toISOString?.()?.split('T')[0]);
                return {
                    label: t.label || '',
                    price: t.price ?? '',
                    startDate: start || '',
                    endDate: end || '',
                };
            })
            : [defaultTier()]
    )
    const [paymentModel, setPaymentModel] = useState(
        () => (service?.paymentMilestoneCount >= 3 ? 'installment3' : 'full')
    )
    const [markAsFree, setMarkAsFree] = useState(() => !!(service?.isFree || service?.price === 0))
    const [promo, setPromo] = useState(() => {
        const p = service?.promo
        if (!p || !p.enabled) return { enabled: false, type: 'percent', value: '', code: '', label: '', startDate: '', endDate: '' }
        return {
            enabled: true,
            type: p.type || 'percent',
            value: p.value ?? '',
            code: p.code ?? '',
            label: p.label ?? '',
            startDate: (p.startDate && typeof p.startDate === 'string') ? p.startDate.split('T')[0] : (p.startDate || ''),
            endDate: (p.endDate && typeof p.endDate === 'string') ? p.endDate.split('T')[0] : (p.endDate || ''),
        }
    })
    const fileInputRef = useRef(null)
    
    // Cloudinary upload hook
    const { uploadImage, uploading, uploadedUrl, error: uploadError, resetUpload } = useCloudinaryUpload()
    const [imagePreview, setImagePreview] = useState(null)
    const [selectedFile, setSelectedFile] = useState(null)
    const [currentImageUrl, setCurrentImageUrl] = useState(service?.imageUrl || null)

    // Load categories and service types from database
    useEffect(() => {
        const loadData = async () => {
            try {
                const [cats, types] = await Promise.all([
                    getCategories(),
                    getServiceTypes()
                ])
                const activeCategories = cats.filter(cat => cat.status === 'active')
                setCategories(activeCategories)
                const activeTypes = types.filter(type => type.status === 'active')
                setServiceTypes(activeTypes)
                // Set type from service if available
                if (service?.type && !type) {
                    setType(service.type)
                }
            } catch (error) {
                console.error('Error loading data:', error)
            }
        }
        loadData()
    }, [service])

    const handleImageSelect = async (e) => {
        const file = e.target.files[0]
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
        reader.onload = () => {
            setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)

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
        setCurrentImageUrl(null)
        resetUpload()
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        
        // Check if free checkbox is checked and remove required from price input
        const isFreeCheckbox = document.getElementById('isFree-checkbox-edit')
        const priceInput = document.getElementById('price-input-edit')
        if (isFreeCheckbox && isFreeCheckbox.checked && priceInput) {
            priceInput.removeAttribute('required')
            priceInput.value = '0'
        }
        
        setLoading(true)
        const formData = new FormData(e.target)

        const startDateStr = formData.get('startDate') || null
        const endDateStr = formData.get('endDate') || null
        const isFree = formData.get('isFree') === 'on' || parseFloat(formData.get('price') || 0) === 0
        const price = isFree ? 0 : parseFloat(formData.get('price') || 0)
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

        let imageUrl = currentImageUrl // Keep existing image if no new upload
        if (uploadedUrl) {
            imageUrl = uploadedUrl // Use new uploaded image
        } else if (selectedFile && !uploading) {
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

        if (uploading) {
            Swal.fire({
                title: 'Mengupload gambar...',
                text: 'Mohon tunggu hingga upload selesai',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })
            
            let attempts = 0
            const maxAttempts = 60
            while (uploading && !uploadedUrl && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                attempts++
            }
            
            Swal.close()
            
            if (uploadedUrl) {
                imageUrl = uploadedUrl
            }
        }

        const pmRaw = formData.get('paymentModel') || paymentModel || 'full'
        const paymentMilestoneCount = isFree ? '1' : pmRaw === 'installment3' ? '3' : '1'

        const data = {
            type: formData.get('type') || 'class',
            name: formData.get('name'),
            description: formData.get('description'),
            price: price,
            isFree: isFree,
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
        } else {
            data.priceTiers = []
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
            const result = await updateService(service.id, data)

            if (result.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: data.type === 'event' ? 'Event berhasil diupdate' : 'Kelas berhasil diupdate',
                    showConfirmButton: true,
                })
                router.push('/master-data/services')
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    html: `<p>${result.error || 'Gagal mengupdate data'}</p>`,
                    confirmButtonText: 'OK'
                })
                console.error('Update service failed:', result)
            }
        } catch (error) {
            console.error('Error updating service:', error)
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

    if (!service) {
        return <div>Loading...</div>
    }

    return (
        <div className="col-lg-12">
            <div className="card border-top-0">
                <div className="card-header p-0">
                    <ul className="nav nav-tabs flex-wrap w-100 text-center" role="tablist">
                        <li className="nav-item flex-fill border-top">
                            <a className="nav-link active">Edit {type === 'event' ? 'Event' : 'Kelas'}</a>
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
                            <label className="col-md-4 col-form-label">Nama Layanan <span className="text-danger">*</span></label>
                            <div className="col-md-8">
                                <input 
                                    name="name" 
                                    type="text" 
                                    className="form-control" 
                                    required 
                                    defaultValue={service.name}
                                    placeholder={`Nama ${type === 'event' ? 'event' : 'kelas'}...`} 
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
                                    defaultValue={service.description || ''}
                                    placeholder="Deskripsi lengkap..."
                                ></textarea>
                            </div>
                        </div>
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Harga</label>
                            <div className="col-md-8">
                                <div className="form-check mb-3">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="usePriceTiers-edit"
                                        checked={usePriceTiers}
                                        onChange={(e) => setUsePriceTiers(e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor="usePriceTiers-edit">
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
                                            id="price-input-edit"
                                            min="0" 
                                            defaultValue={service.price || 0}
                                            placeholder="0" 
                                            disabled={service.isFree || service.price === 0}
                                        />
                                        <div className="form-check mt-2">
                                            <input 
                                                className="form-check-input" 
                                                type="checkbox" 
                                                name="isFree"
                                                id="isFree-checkbox-edit"
                                                defaultChecked={service.isFree || service.price === 0}
                                                onChange={(e) => {
                                                    const priceInput = document.getElementById('price-input-edit')
                                                    const asterisk = document.getElementById('price-required-asterisk-edit')
                                                    setMarkAsFree(e.target.checked)
                                                    if (asterisk) asterisk.style.display = e.target.checked ? 'none' : 'inline'
                                                    if (priceInput) {
                                                        priceInput.value = e.target.checked ? '0' : (service.price || '0')
                                                        priceInput.disabled = e.target.checked
                                                    }
                                                    if (e.target.checked) setPaymentModel('full')
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor="isFree-checkbox-edit">
                                                Kelas Gratis (Bypass Payment)
                                            </label>
                                        </div>
                                    </>
                                )}
                                {usePriceTiers && (
                                    <div className="border rounded p-3 bg-light">
                                        <p className="small text-muted mb-3">
                                            <strong>Tier</strong>: nama + harga + periode aktif.
                                        </p>
                                        {priceTiers.map((tier, idx) => (
                                            <div key={idx} className="row g-2 mb-3 align-items-end">
                                                <div className="col-md-3">
                                                    <label className="form-label small">Nama Tier</label>
                                                    <input type="text" className="form-control form-control-sm" placeholder="e.g. Early Bird" value={tier.label}
                                                        onChange={(e) => { const next = [...priceTiers]; next[idx] = { ...next[idx], label: e.target.value }; setPriceTiers(next) }} />
                                                </div>
                                                <div className="col-md-2">
                                                    <label className="form-label small">Harga (Rp)</label>
                                                    <input type="number" className="form-control form-control-sm" min="0" placeholder="0" value={tier.price}
                                                        onChange={(e) => { const next = [...priceTiers]; next[idx] = { ...next[idx], price: e.target.value }; setPriceTiers(next) }} />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label small">Aktif dari</label>
                                                    <input type="date" className="form-control form-control-sm" value={tier.startDate || ''}
                                                        onChange={(e) => { const next = [...priceTiers]; next[idx] = { ...next[idx], startDate: e.target.value }; setPriceTiers(next) }} />
                                                </div>
                                                <div className="col-md-3">
                                                    <label className="form-label small">Aktif sampai</label>
                                                    <input type="date" className="form-control form-control-sm" value={tier.endDate || ''}
                                                        onChange={(e) => { const next = [...priceTiers]; next[idx] = { ...next[idx], endDate: e.target.value }; setPriceTiers(next) }} />
                                                </div>
                                                <div className="col-md-1">
                                                    <button type="button" className="btn btn-sm btn-outline-danger"
                                                        onClick={() => setPriceTiers(priceTiers.filter((_, i) => i !== idx))} disabled={priceTiers.length <= 1} title="Hapus tier">
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
                                            Kapan peserta boleh akses materi setelah bayar — <strong>tidak dicampur</strong> dengan pengaturan tier. Nominal mengikuti tier yang sedang aktif.
                                        </p>
                                        <div className="border rounded p-3 bg-light">
                                            <div className="form-check mb-2">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="paymentModel"
                                                    id="pm-full-edit"
                                                    value="full"
                                                    checked={paymentModel === 'full'}
                                                    onChange={() => setPaymentModel('full')}
                                                />
                                                <label className="form-check-label" htmlFor="pm-full-edit">
                                                    <strong>Bayar penuh sekali</strong> — total (tier aktif) 1×; setelah lunas langsung akses.
                                                </label>
                                            </div>
                                            <div className="form-check mb-0">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="paymentModel"
                                                    id="pm-inst3-edit"
                                                    value="installment3"
                                                    checked={paymentModel === 'installment3'}
                                                    onChange={() => setPaymentModel('installment3')}
                                                />
                                                <label className="form-check-label" htmlFor="pm-inst3-edit">
                                                    <strong>Cicilan 3× ke gateway</strong> — total dibagi 3; akses setelah pembayaran ke-3 lunas.
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
                                    <input type="checkbox" className="form-check-input" id="promo-enable-edit" checked={promo.enabled} onChange={(e) => setPromo(p => ({ ...p, enabled: e.target.checked }))} />
                                    <label className="form-check-label" htmlFor="promo-enable-edit">Aktifkan promo / diskon untuk kelas ini</label>
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
                                <select name="category" className="form-control" defaultValue={service.category || ''}>
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
                                
                                {(imagePreview || uploadedUrl || currentImageUrl) ? (
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
                                                src={uploadedUrl || imagePreview || currentImageUrl}
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
                                                    Gambar baru sudah diupload
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
                                        <input 
                                            name="capacity" 
                                            type="number" 
                                            className="form-control" 
                                            defaultValue={service.capacity || ''}
                                            placeholder="e.g., 30" 
                                            min="1" 
                                        />
                                    </div>
                                </div>
                                <div className="row mb-4">
                                    <label className="col-md-4 col-form-label">Instruktur</label>
                                    <div className="col-md-8">
                                        <input 
                                            name="instructor" 
                                            type="text" 
                                            className="form-control" 
                                            defaultValue={service.instructor || ''}
                                            placeholder="e.g., John Doe" 
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="row mb-4">
                                    <label className="col-md-4 col-form-label">Lokasi</label>
                                    <div className="col-md-8">
                                        <input 
                                            name="location" 
                                            type="text" 
                                            className="form-control" 
                                            defaultValue={service.location || ''}
                                            placeholder="e.g., Jakarta Convention Center" 
                                        />
                                    </div>
                                </div>
                                <div className="row mb-4">
                                    <label className="col-md-4 col-form-label">Kapasitas Peserta</label>
                                    <div className="col-md-8">
                                        <input 
                                            name="capacity" 
                                            type="number" 
                                            className="form-control" 
                                            defaultValue={service.capacity || ''}
                                            placeholder="e.g., 100" 
                                            min="1" 
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="row mb-4">
                            <label className="col-md-4 col-form-label">Status</label>
                            <div className="col-md-8">
                                <select name="status" className="form-control" defaultValue={service.status || 'active'}>
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Tidak Aktif</option>
                                </select>
                            </div>
                        </div>
                        <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-light" onClick={() => router.back()}>Batal</button>
                            <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
                                {loading || uploading ? 'Menyimpan...' : `Update ${type === 'event' ? 'Event' : 'Kelas'}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ServiceEdit

