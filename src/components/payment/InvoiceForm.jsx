'use client'
import React, { useState, useEffect, useRef } from 'react'
import { FiPlus, FiX, FiInfo, FiUpload, FiImage } from 'react-icons/fi'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload'
import Swal from 'sweetalert2'

const InvoiceForm = ({ invoice, masterData = [], onSubmit, onCancel, loading }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [items, setItems] = useState([{ id: 1, product: '', qty: 1, price: 0, total: 0 }]);
    const [formData, setFormData] = useState({
        invoiceNumber: '',
        label: '',
        product: '',
        sender: { name: '', email: '', phone: '', address: '' },
        client: { name: '', email: '', phone: '', address: '' },
        note: '',
        status: 'pending'
    });
    
    // Logo upload
    const logoUpload = useCloudinaryUpload()
    const logoFileRef = useRef(null)
    const [logoPreview, setLogoPreview] = useState(null)
    const [logoUrl, setLogoUrl] = useState(null)
    
    // Signature
    const signatureUpload = useCloudinaryUpload()
    const signatureFileRef = useRef(null)
    const [signaturePreview, setSignaturePreview] = useState(null)
    const [signatureUrl, setSignatureUrl] = useState(null)
    const [signatureText, setSignatureText] = useState('')
    const [signatureTitle, setSignatureTitle] = useState('')
    const [signatureMode, setSignatureMode] = useState('text') // 'text' or 'upload'
    const [termsAndCondition, setTermsAndCondition] = useState([{ id: 1, text: '' }])
    const signatureCanvasRef = useRef(null)

    useEffect(() => {
        if (invoice) {
            // Load invoice data for editing
            setFormData({
                invoiceNumber: invoice.invoiceNumber || '',
                label: invoice.label || '',
                product: invoice.product || '',
                sender: invoice.sender || { name: '', email: '', phone: '', address: '' },
                client: invoice.client || { name: '', email: '', phone: '', address: '' },
                note: invoice.note || '',
                status: invoice.status || 'pending'
            });
            setItems(invoice.items && invoice.items.length > 0 ? invoice.items.map((item, idx) => ({
                id: idx + 1,
                product: item.product || '',
                qty: item.qty || 1,
                price: item.price || 0,
                total: (item.qty || 1) * (item.price || 0)
            })) : [{ id: 1, product: '', qty: 1, price: 0, total: 0 }]);
            if (invoice.issueDate) {
                const issueDate = invoice.issueDate instanceof Date ? invoice.issueDate : new Date(invoice.issueDate);
                setStartDate(issueDate);
            }
            if (invoice.dueDate) {
                const dueDate = invoice.dueDate instanceof Date ? invoice.dueDate : new Date(invoice.dueDate);
                setEndDate(dueDate);
            }
            // Load logo and signature
            if (invoice.logoUrl) {
                setLogoPreview(invoice.logoUrl);
                setLogoUrl(invoice.logoUrl);
            }
            if (invoice.signatureUrl) {
                setSignaturePreview(invoice.signatureUrl);
                setSignatureUrl(invoice.signatureUrl);
                setSignatureMode('upload');
            } else if (invoice.signatureText) {
                setSignatureText(invoice.signatureText);
                setSignatureMode('text');
            }
            if (invoice.signatureTitle) {
                setSignatureTitle(invoice.signatureTitle);
            }
            if (invoice.termsAndCondition) {
                // If it's a string, convert to array
                if (typeof invoice.termsAndCondition === 'string') {
                    const lines = invoice.termsAndCondition.split('\n').filter(line => line.trim());
                    setTermsAndCondition(lines.length > 0 ? lines.map((line, idx) => ({ id: idx + 1, text: line.trim() })) : [{ id: 1, text: '' }]);
                } else if (Array.isArray(invoice.termsAndCondition)) {
                    setTermsAndCondition(invoice.termsAndCondition.length > 0 ? invoice.termsAndCondition.map((item, idx) => 
                        typeof item === 'string' ? { id: idx + 1, text: item } : { id: item.id || idx + 1, text: item.text || '' }
                    ) : [{ id: 1, text: '' }]);
                }
            }
        } else {
            // Reset form for new invoice
            setFormData({
                invoiceNumber: '',
                label: '',
                product: '',
                sender: { name: '', email: '', phone: '', address: '' },
                client: { name: '', email: '', phone: '', address: '' },
                note: '',
                status: 'pending'
            });
            setItems([{ id: 1, product: '', qty: 1, price: 0, total: 0 }]);
            setStartDate(new Date());
            setEndDate(new Date());
            setLogoPreview(null);
            setSignaturePreview(null);
            setSignatureText('');
            setSignatureTitle('');
            setTermsAndCondition([{ id: 1, text: '' }]);
            setSignatureMode('text');
        }
    }, [invoice]);

    const subTotal = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = (subTotal * 0.1).toFixed(2);
    const grandTotal = Number(subTotal + Number(tax)).toFixed(2);

    const addItem = () => {
        const newItem = {
            id: items.length + 1,
            product: '',
            qty: 1,
            price: 0,
            total: 0
        };
        setItems([...items, newItem]);
    };

    const removeItem = () => {
        if (items.length > 1) {
            setItems(items.slice(0, -1));
        }
    };

    // Terms and Condition handlers
    const addTermsItem = () => {
        const newItem = {
            id: termsAndCondition.length + 1,
            text: ''
        };
        setTermsAndCondition([...termsAndCondition, newItem]);
    };

    const removeTermsItem = () => {
        if (termsAndCondition.length > 1) {
            setTermsAndCondition(termsAndCondition.slice(0, -1));
        }
    };

    const handleTermsChange = (id, value) => {
        const updatedTerms = termsAndCondition.map(item => 
            item.id === id ? { ...item, text: value } : item
        );
        setTermsAndCondition(updatedTerms);
    };

    const handleInputChange = (id, field, value) => {
        const updatedItems = items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'qty' || field === 'price') {
                    updatedItem.total = updatedItem.qty * updatedItem.price;
                }
                return updatedItem;
            }
            return item;
        });
        setItems(updatedItems);
    };

    const handleProductChange = (id, productName) => {
        const selectedItem = masterData.find(m => m.name === productName);
        const newPrice = selectedItem ? selectedItem.price : 0;

        const updatedItems = items.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    product: productName,
                    price: newPrice,
                    total: item.qty * newPrice
                };
            }
            return item;
        });
        setItems(updatedItems);
    };

    // Logo upload handler
    const handleLogoSelect = async (e) => {
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

        // Create preview
        const reader = new FileReader()
        reader.onload = () => {
            setLogoPreview(reader.result)
        }
        reader.readAsDataURL(file)

        // Upload to Cloudinary
        const result = await logoUpload.uploadImage(file, 'invoices/logo')
        
        if (result.success) {
            setLogoUrl(result.url)
        } else {
            Swal.fire('Error', result.error || 'Gagal mengupload logo', 'error')
            setLogoPreview(null)
            setLogoUrl(null)
            if (logoFileRef.current) {
                logoFileRef.current.value = ''
            }
        }
    }

    const handleRemoveLogo = () => {
        setLogoPreview(null)
        setLogoUrl(null)
        logoUpload.resetUpload()
        if (logoFileRef.current) {
            logoFileRef.current.value = ''
        }
    }

    // Signature upload handler
    const handleSignatureUpload = async (e) => {
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

        // Create preview
        const reader = new FileReader()
        reader.onload = () => {
            setSignaturePreview(reader.result)
        }
        reader.readAsDataURL(file)

        // Upload to Cloudinary
        const result = await signatureUpload.uploadImage(file, 'invoices/signature')
        
        if (result.success) {
            setSignatureUrl(result.url)
            setSignatureMode('upload')
        } else {
            Swal.fire('Error', result.error || 'Gagal mengupload signature', 'error')
            setSignaturePreview(null)
            setSignatureUrl(null)
            if (signatureFileRef.current) {
                signatureFileRef.current.value = ''
            }
        }
    }

    const handleRemoveSignature = () => {
        setSignaturePreview(null)
        setSignatureUrl(null)
        setSignatureText('')
        signatureUpload.resetUpload()
        if (signatureFileRef.current) {
            signatureFileRef.current.value = ''
        }
        setSignatureMode('text')
    }

    // Generate signature from text using canvas
    const generateSignatureFromText = async (text) => {
        if (!text || text.trim() === '') return null

        return new Promise((resolve) => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            // Set canvas size
            canvas.width = 300
            canvas.height = 100

            // Set background to transparent
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Set font style (cursive/signature-like)
            ctx.font = 'italic 32px "Brush Script MT", "Lucida Handwriting", cursive'
            ctx.fillStyle = '#000000'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            // Draw text
            ctx.fillText(text, canvas.width / 2, canvas.height / 2)

            // Convert to blob and upload
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    resolve(null)
                    return
                }

                // Create file from blob
                const file = new File([blob], 'signature.png', { type: 'image/png' })
                
                // Upload to Cloudinary
                const result = await signatureUpload.uploadImage(file, 'invoices/signature')
                
                if (result.success) {
                    setSignaturePreview(result.url)
                    setSignatureUrl(result.url)
                    resolve(result.url)
                } else {
                    resolve(null)
                }
            }, 'image/png')
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataObj = new FormData(e.target);
        
        // Handle signature generation if text mode
        let finalSignatureUrl = signatureUrl || signatureUpload.uploadedUrl || null
        if (signatureMode === 'text' && signatureText && !finalSignatureUrl) {
            finalSignatureUrl = await generateSignatureFromText(signatureText)
        }
        
        const invoiceData = {
            invoiceNumber: formDataObj.get('invoiceNumber') || `INV-${Date.now()}`,
            label: formDataObj.get('label') || '',
            product: formDataObj.get('product') || '',
            sender: {
                name: formDataObj.get('senderName') || '',
                email: formDataObj.get('senderEmail') || '',
                phone: formDataObj.get('senderPhone') || '',
                address: formDataObj.get('senderAddress') || ''
            },
            client: {
                name: formDataObj.get('clientName') || '',
                email: formDataObj.get('clientEmail') || '',
                phone: formDataObj.get('clientPhone') || '',
                address: formDataObj.get('clientAddress') || ''
            },
            items: items,
            note: formDataObj.get('note') || '',
            subTotal: subTotal,
            grandTotal: grandTotal,
            tax: tax,
            status: formDataObj.get('status') || 'pending',
            issueDate: startDate || new Date(),
            dueDate: endDate || new Date(),
            logoUrl: logoUrl || logoUpload.uploadedUrl || null,
            signatureUrl: finalSignatureUrl,
            signatureText: signatureMode === 'text' ? signatureText : null,
            signatureTitle: signatureTitle || '',
            termsAndCondition: termsAndCondition.filter(item => item.text.trim()).map(item => item.text.trim()),
        };

        // Debug log
        console.log('InvoiceForm submitting data:', {
            logoUrl: invoiceData.logoUrl,
            signatureUrl: invoiceData.signatureUrl,
            signatureText: invoiceData.signatureText,
            logoUrlState: logoUrl,
            logoUploadUrl: logoUpload.uploadedUrl,
            signatureUrlState: signatureUrl,
            signatureUploadUrl: signatureUpload.uploadedUrl
        });

        onSubmit(invoiceData);
    };

    return (
        <form onSubmit={handleSubmit} className="w-100">
            <div className="row">
                <div className="col-xl-8">
                    <div className="card">
                        <div className="card-header">
                            <h5>{invoice ? 'Edit Invoice' : 'Buat Invoice Baru'}</h5>
                        </div>
                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <label className="form-label">Invoice Number</label>
                                    <input 
                                        type="text" 
                                        name="invoiceNumber" 
                                        className="form-control" 
                                        defaultValue={formData.invoiceNumber}
                                        placeholder="#INV-2024" 
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Issue Date</label>
                                    <DatePicker
                                        selected={startDate}
                                        onChange={(date) => setStartDate(date)}
                                        className='form-control'
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Pilih tanggal"
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Due Date</label>
                                    <DatePicker
                                        selected={endDate}
                                        onChange={(date) => setEndDate(date)}
                                        className='form-control'
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Pilih tanggal"
                                    />
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Invoice Label</label>
                                    <input 
                                        type="text" 
                                        name="label" 
                                        className="form-control" 
                                        defaultValue={formData.label}
                                        placeholder="Invoice Label" 
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Status</label>
                                    <select name="status" className="form-control" defaultValue={formData.status}>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div className="row mb-3">
                                <div className="col-12">
                                    <label className="form-label">Logo Perusahaan</label>
                                    <div className="d-flex align-items-center gap-3">
                                        {logoPreview ? (
                                            <div className="position-relative">
                                                <img 
                                                    src={logoPreview} 
                                                    alt="Logo preview" 
                                                    className="img-thumbnail" 
                                                    style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                                    onClick={handleRemoveLogo}
                                                >
                                                    <FiX size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border rounded p-3 text-center" style={{ minWidth: '150px', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div>
                                                    <FiImage size={32} className="text-muted mb-2" />
                                                    <p className="small text-muted mb-0">No Logo</p>
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <input
                                                type="file"
                                                ref={logoFileRef}
                                                accept="image/*"
                                                onChange={handleLogoSelect}
                                                className="d-none"
                                                id="logo-upload"
                                            />
                                            <label htmlFor="logo-upload" className="btn btn-sm btn-primary">
                                                <FiUpload size={14} className="me-1" />
                                                {logoUpload.uploading ? 'Uploading...' : 'Upload Logo'}
                                            </label>
                                            {logoUpload.uploading && (
                                                <div className="progress mt-2" style={{ width: '200px' }}>
                                                    <div 
                                                        className="progress-bar" 
                                                        style={{ width: `${logoUpload.uploadProgress}%` }}
                                                    />
                                                </div>
                                            )}
                                            <p className="small text-muted mt-2 mb-0">Format: JPG, PNG (Max 10MB)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <h6 className="fw-bold mb-3">Invoice From:</h6>
                                    <div className="mb-2">
                                        <label className="form-label small">Name</label>
                                        <input 
                                            type="text" 
                                            name="senderName" 
                                            className="form-control form-control-sm" 
                                            defaultValue={formData.sender.name}
                                            placeholder="Business Name" 
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small">Email</label>
                                        <input 
                                            type="email" 
                                            name="senderEmail" 
                                            className="form-control form-control-sm" 
                                            defaultValue={formData.sender.email}
                                            placeholder="Email Address" 
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small">Phone</label>
                                        <input 
                                            type="text" 
                                            name="senderPhone" 
                                            className="form-control form-control-sm" 
                                            defaultValue={formData.sender.phone}
                                            placeholder="Phone Number" 
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small">Address</label>
                                        <textarea 
                                            rows={3} 
                                            name="senderAddress" 
                                            className="form-control form-control-sm" 
                                            defaultValue={formData.sender.address}
                                            placeholder="Address" 
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <h6 className="fw-bold mb-3">Invoice To:</h6>
                                    <div className="mb-2">
                                        <label className="form-label small">Name</label>
                                        <input 
                                            type="text" 
                                            name="clientName" 
                                            className="form-control form-control-sm" 
                                            defaultValue={formData.client.name}
                                            placeholder="Client Name" 
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small">Email</label>
                                        <input 
                                            type="email" 
                                            name="clientEmail" 
                                            className="form-control form-control-sm" 
                                            defaultValue={formData.client.email}
                                            placeholder="Email Address" 
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small">Phone</label>
                                        <input 
                                            type="text" 
                                            name="clientPhone" 
                                            className="form-control form-control-sm" 
                                            defaultValue={formData.client.phone}
                                            placeholder="Phone Number" 
                                        />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small">Address</label>
                                        <textarea 
                                            rows={3} 
                                            name="clientAddress" 
                                            className="form-control form-control-sm" 
                                            defaultValue={formData.client.address}
                                            placeholder="Address" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr />

                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="fw-bold mb-0">Items:</h6>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn btn-sm btn-danger" onClick={removeItem}>Hapus Item</button>
                                        <button type="button" className="btn btn-sm btn-primary" onClick={addItem}>
                                            <FiPlus size={14} className="me-1" />
                                            Tambah Item
                                        </button>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-sm">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th style={{ width: '100px' }}>Qty</th>
                                                <th style={{ width: '150px' }}>Price</th>
                                                <th style={{ width: '150px' }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map((item) => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <input
                                                            list={`master-data-${item.id}`}
                                                            className="form-control form-control-sm"
                                                            placeholder="Select or Type Product"
                                                            defaultValue={item.product}
                                                            onChange={(e) => handleProductChange(item.id, e.target.value)}
                                                        />
                                                        <datalist id={`master-data-${item.id}`}>
                                                            {masterData.map((m, i) => (
                                                                <option key={i} value={m.name}>
                                                                    {m.name} - Rp {m.price?.toLocaleString('id-ID')} ({m.type})
                                                                </option>
                                                            ))}
                                                        </datalist>
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="number" 
                                                            className="form-control form-control-sm" 
                                                            step="1" 
                                                            min="1" 
                                                            defaultValue={item.qty} 
                                                            onChange={(e) => handleInputChange(item.id, 'qty', parseInt(e.target.value))} 
                                                        />
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="number" 
                                                            className="form-control form-control-sm" 
                                                            step="0.01" 
                                                            min="0" 
                                                            defaultValue={item.price} 
                                                            onChange={(e) => handleInputChange(item.id, 'price', parseFloat(e.target.value))} 
                                                        />
                                                    </td>
                                                    <td>
                                                        <input 
                                                            type="number" 
                                                            className="form-control form-control-sm" 
                                                            readOnly 
                                                            value={item.qty * item.price} 
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Note</label>
                                <textarea 
                                    rows={3} 
                                    name="note" 
                                    className="form-control" 
                                    defaultValue={formData.note}
                                    placeholder="Invoice note..." 
                                />
                            </div>

                            {/* Signature */}
                            <div className="mb-3">
                                <label className="form-label">Tanda Tangan</label>
                                <div className="mb-2">
                                    <div className="btn-group" role="group">
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${signatureMode === 'text' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setSignatureMode('text')}
                                        >
                                            Tulis Nama
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn btn-sm ${signatureMode === 'upload' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setSignatureMode('upload')}
                                        >
                                            Upload Gambar
                                        </button>
                                    </div>
                                </div>
                                
                                {signatureMode === 'text' ? (
                                    <div>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Masukkan nama untuk tanda tangan"
                                            value={signatureText}
                                            onChange={(e) => setSignatureText(e.target.value)}
                                        />
                                        <small className="text-muted">Nama akan di-generate menjadi tanda tangan otomatis</small>
                                        {signatureText && (
                                            <div className="mt-2 p-2 border rounded bg-light">
                                                <p className="small mb-0">Preview: <span style={{ fontFamily: 'cursive', fontSize: '20px' }}>{signatureText}</span></p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center gap-3">
                                        {signaturePreview ? (
                                            <div className="position-relative">
                                                <img 
                                                    src={signaturePreview} 
                                                    alt="Signature preview" 
                                                    className="img-thumbnail bg-white" 
                                                    style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                                    onClick={handleRemoveSignature}
                                                >
                                                    <FiX size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="border rounded p-3 text-center" style={{ minWidth: '200px', minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div>
                                                    <FiImage size={24} className="text-muted mb-2" />
                                                    <p className="small text-muted mb-0">No Signature</p>
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <input
                                                type="file"
                                                ref={signatureFileRef}
                                                accept="image/*"
                                                onChange={handleSignatureUpload}
                                                className="d-none"
                                                id="signature-upload"
                                            />
                                            <label htmlFor="signature-upload" className="btn btn-sm btn-primary">
                                                <FiUpload size={14} className="me-1" />
                                                {signatureUpload.uploading ? 'Uploading...' : 'Upload Signature'}
                                            </label>
                                            {signatureUpload.uploading && (
                                                <div className="progress mt-2" style={{ width: '200px' }}>
                                                    <div 
                                                        className="progress-bar" 
                                                        style={{ width: `${signatureUpload.uploadProgress}%` }}
                                                    />
                                                </div>
                                            )}
                                            <p className="small text-muted mt-2 mb-0">Format: JPG, PNG (Max 10MB)</p>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Signature Title/Jabatan */}
                                <div className="mt-3">
                                    <label className="form-label small">Jabatan/Posisi</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Contoh: Account Manager, Direktur, dll"
                                        value={signatureTitle}
                                        onChange={(e) => setSignatureTitle(e.target.value)}
                                    />
                                    <small className="text-muted">Jabatan yang akan ditampilkan di bawah tanda tangan</small>
                                </div>
                            </div>

                            {/* Terms and Condition */}
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <label className="form-label mb-0">Terms &amp; Condition</label>
                                    <div className="d-flex gap-2">
                                        <button type="button" className="btn btn-sm btn-danger" onClick={removeTermsItem}>Hapus</button>
                                        <button type="button" className="btn btn-sm btn-primary" onClick={addTermsItem}>
                                            <FiPlus size={14} className="me-1" />
                                            Tambah
                                        </button>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-sm">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}>#</th>
                                                <th>Item</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {termsAndCondition.map((term, index) => (
                                                <tr key={term.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="Masukkan terms and condition..."
                                                            value={term.text}
                                                            onChange={(e) => handleTermsChange(term.id, e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <small className="text-muted">Kosongkan semua untuk menggunakan default terms and condition</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-4">
                    <div className="card">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Summary:</h6>
                            <div className="table-responsive">
                                <table className="table table-bordered table-sm">
                                    <tbody>
                                        <tr>
                                            <th>Sub Total</th>
                                            <td className="text-end">Rp {subTotal.toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr>
                                            <th>Tax (10%)</th>
                                            <td className="text-end">Rp {parseFloat(tax).toLocaleString('id-ID')}</td>
                                        </tr>
                                        <tr className="table-active">
                                            <th>Grand Total</th>
                                            <td className="text-end fw-bold">Rp {parseFloat(grandTotal).toLocaleString('id-ID')}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="d-flex gap-2 mt-3">
                                <button type="button" className="btn btn-light flex-fill" onClick={onCancel} disabled={loading}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary flex-fill" disabled={loading}>
                                    {loading ? 'Menyimpan...' : (invoice ? 'Update Invoice' : 'Buat Invoice')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default InvoiceForm

