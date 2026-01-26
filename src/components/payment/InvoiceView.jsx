'use client'
import React, { useRef, useEffect, useState } from 'react'
import { FiDollarSign, FiDownload, FiEdit, FiFacebook, FiGithub, FiInstagram, FiLinkedin, FiPrinter, FiSend, FiTwitter } from 'react-icons/fi'
import Dropdown from '@/components/shared/Dropdown'
import Link from 'next/link'

export const invoiceTempletOptions = [
    { icon: '', label: "Default" },
    { icon: '', label: "Classic" },
    { icon: '', label: "Simple" },
    { icon: '', label: "Modern" },
    { icon: '', label: "Untimate" },
    { icon: '', label: "Essential" },
    { type: "divider" },
    { icon: '', label: "Create Template" },
    { icon: '', label: "Delete Template" },
]

const InvoiceView = ({ invoice }) => {
    const invoiceRef = useRef(null)
    const [html2pdfLoaded, setHtml2pdfLoaded] = useState(false)
    
    // Load html2pdf.js from CDN
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.html2pdf) {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
            script.async = true
            script.onload = () => {
                setHtml2pdfLoaded(true)
            }
            document.head.appendChild(script)
            
            return () => {
                // Cleanup if needed
            }
        } else if (window.html2pdf) {
            setHtml2pdfLoaded(true)
        }
    }, [])
    
    // Debug log
    console.log('InvoiceView received invoice:', {
        id: invoice?.id,
        logoUrl: invoice?.logoUrl,
        signatureUrl: invoice?.signatureUrl,
        signatureText: invoice?.signatureText,
        fullInvoice: invoice
    });

    if (!invoice) {
        return (
            <div className="col-lg-12">
                <div className="card">
                    <div className="card-body text-center py-5">
                        <p className="text-muted">Invoice tidak ditemukan</p>
                    </div>
                </div>
            </div>
        )
    }

    // Download invoice as PDF
    const handleDownloadPDF = async () => {
        try {
            const element = invoiceRef.current
            if (!element) {
                alert('Invoice content not found')
                return
            }

            // Wait for html2pdf to load if not already loaded
            if (!html2pdfLoaded || !window.html2pdf) {
                // Try to load it
                if (!window.html2pdf) {
                    const script = document.createElement('script')
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
                    script.async = true
                    document.head.appendChild(script)
                    
                    await new Promise((resolve, reject) => {
                        script.onload = () => {
                            setHtml2pdfLoaded(true)
                            resolve()
                        }
                        script.onerror = reject
                        setTimeout(() => reject(new Error('Timeout loading html2pdf.js')), 10000)
                    })
                }
            }

            if (!window.html2pdf) {
                throw new Error('html2pdf.js not loaded')
            }

            const opt = {
                margin: [10, 10, 10, 10],
                filename: `Invoice-${invoice.invoiceNumber || invoice.id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    allowTaint: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                }
            }

            await window.html2pdf().set(opt).from(element).save()
        } catch (error) {
            console.error('Error downloading PDF:', error)
            // Fallback to print
            alert('Gagal download PDF. Menggunakan print sebagai alternatif.')
            window.print()
        }
    }

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '-'
        const date = new Date(dateString)
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        })
    }

    // Get invoice items
    const items = invoice.items || []
    const subTotal = invoice.subTotal || 0
    const tax = invoice.tax || 0
    const grandTotal = invoice.grandTotal || invoice.total || 0

    // Get sender and client info
    const sender = invoice.sender || {}
    const client = invoice.client || {}

    // Status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid':
                return <span className="fw-bold text-success">Paid</span>
            case 'cancelled':
                return <span className="fw-bold text-danger">Cancelled</span>
            case 'pending':
                return <span className="fw-bold text-warning">Pending</span>
            default:
                return <span className="fw-bold text-warning">Pending</span>
        }
    }

    return (
        <div className="col-lg-12" ref={invoiceRef}>
            <div className="card invoice-container">
                <div className="card-header">
                    <div>
                        <h2 className="fs-16 fw-700 text-truncate-1-line mb-0 mb-sm-1">Invoice Preview</h2>
                        <Dropdown
                            dropdownItems={invoiceTempletOptions}
                            dropdownParentStyle={"d-none d-sm-block"}
                            triggerClass='dropdown-toggle d-flex align-items-center fs-11 fw-400 text-muted me-2'
                            triggerPosition={"0, 25"}
                            triggerText={"Invoice Templates"}
                            triggerIcon={" "}
                            isAvatar={false}
                            dropdownPosition='dropdown-menu-start'
                        />
                    </div>
                    <div className="d-flex align-items-center justify-content-center">
                        <a href="#" className="d-flex me-1" data-alert-target="invoicSendMessage">
                            <div className="avatar-text avatar-md" data-toggle="tooltip" data-bs-trigger="hover" data-title="Send Invoice">
                                <FiSend strokeWidth={1.6} size={12} />
                            </div>
                        </a>
                        <a href="#" className="d-flex me-1 printBTN" onClick={() => window.print()}>
                            <div className="avatar-text avatar-md" data-toggle="tooltip" data-bs-trigger="hover" data-title="Print Invoice">
                                <FiPrinter strokeWidth={1.6} size={12} />
                            </div>
                        </a>
                        <a href="#" className="d-flex me-1">
                            <div className="avatar-text avatar-md" data-toggle="tooltip" data-bs-trigger="hover" data-title="Add Payment">
                                <FiDollarSign strokeWidth={1.6} size={12} />
                            </div>
                        </a>
                        <a href="#" className="d-flex me-1 file-download" onClick={(e) => { e.preventDefault(); handleDownloadPDF(); }}>
                            <div className="avatar-text avatar-md" data-toggle="tooltip" data-bs-trigger="hover" data-title="Download Invoice">
                                <FiDownload size={12} />
                            </div>
                        </a>
                        <Link href={`/payment?edit=${invoice.id}`} className="d-flex me-1">
                            <div className="avatar-text avatar-md" data-toggle="tooltip" data-bs-trigger="hover" data-title="Edit Invoice">
                                <FiEdit strokeWidth={1.6} size={12} />
                            </div>
                        </Link>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="px-4 pt-4">
                        <div className="d-sm-flex align-items-center justify-content-between">
                            <div>
                                {invoice.logoUrl ? (
                                    <div className="mb-3">
                                        <img 
                                            src={invoice.logoUrl} 
                                            alt="Logo" 
                                            style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain', display: 'block' }}
                                            onError={(e) => {
                                                console.error('Error loading logo:', invoice.logoUrl);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                ) : null}
                                <address className="text-muted">
                                    {sender.address ? (
                                        <>
                                            {sender.address.split('\n').map((line, idx) => (
                                                <React.Fragment key={idx}>
                                                    {line}
                                                    <br />
                                                </React.Fragment>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            {sender.name || 'N/A'}<br />
                                            {sender.email || ''}<br />
                                            {sender.phone || ''}
                                        </>
                                    )}
                                </address>
                            </div>
                            <div className="lh-lg pt-3 pt-sm-0">
                                <h2 className="fs-4 fw-bold text-primary">Invoice</h2>
                                <div>
                                    <span className="fw-bold text-dark">Invoice: </span>
                                    <span className="fw-bold text-primary">
                                        {invoice.invoiceNumber || `#${invoice.id.substring(0, 8).toUpperCase()}`}
                                    </span>
                                </div>
                                <div>
                                    <span className="fw-bold text-dark">Due Date: </span>
                                    <span className="text-muted">{formatDate(invoice.dueDate)}</span>
                                </div>
                                <div>
                                    <span className="fw-bold text-dark">Issued Date: </span>
                                    <span className="text-muted">{formatDate(invoice.issueDate || invoice.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className="border-dashed" />
                    <div className="px-4 py-sm-5">
                        <div className="d-sm-flex gap-4 justify-content-center">
                            <div className="text-sm-end">
                                <h2 className="fs-16 fw-bold text-dark mb-3">Invoiced To:</h2>
                                <address className="text-muted lh-lg">
                                    {client.name || 'N/A'}<br />
                                    {client.email && <>{client.email}<br /></>}
                                    {client.phone && <>{client.phone}<br /></>}
                                    {client.address ? (
                                        <>
                                            {client.address.split('\n').map((line, idx) => (
                                                <React.Fragment key={idx}>
                                                    {line}
                                                    <br />
                                                </React.Fragment>
                                            ))}
                                        </>
                                    ) : null}
                                </address>
                            </div>
                            <div className="border-end border-end-dashed border-gray-500 d-none d-sm-block"></div>
                            <div className="mt-4 mt-sm-0">
                                <h2 className="fs-16 fw-bold text-dark mb-3">Payment Details:</h2>
                                <div className="text-muted lh-lg">
                                    <div>
                                        <span className="text-muted">Total Due:</span>
                                        <span className="fw-bold text-dark"> Rp {grandTotal.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div>
                                        <span className="text-muted">Payout Status:</span>
                                        {getStatusBadge(invoice.status)}
                                    </div>
                                    {invoice.createdAt && (
                                        <div>
                                            <span className="text-muted">Created:</span>
                                            <span className="fw-bold text-dark"> {formatDate(invoice.createdAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className="border-dashed mb-0" />
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Product/Service</th>
                                    <th>QTY</th>
                                    <th>Rate</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length > 0 ? (
                                    items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <a href="#">{item.product || 'N/A'}</a>
                                            </td>
                                            <td>{item.qty || 0}</td>
                                            <td>Rp {(item.price || 0).toLocaleString('id-ID')}</td>
                                            <td className="text-dark fw-semibold">
                                                Rp {((item.qty || 0) * (item.price || 0)).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center text-muted">No items</td>
                                    </tr>
                                )}

                                <tr>
                                    <td colSpan="2"></td>
                                    <td className="fw-semibold text-dark bg-gray-100 text-lg-end">Sub Total</td>
                                    <td className="fw-bold text-dark bg-gray-100">Rp {subTotal.toLocaleString('id-ID')}</td>
                                </tr>
                                {tax > 0 && (
                                    <tr>
                                        <td colSpan="2"></td>
                                        <td className="fw-semibold text-dark bg-gray-100 text-lg-end">Tax (10%)</td>
                                        <td className="fw-bold text-dark bg-gray-100">Rp {parseFloat(tax).toLocaleString('id-ID')}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td colSpan="2"></td>
                                    <td className="fw-semibold text-dark bg-gray-100 text-lg-end">Grand Amount</td>
                                    <td className="fw-bolder text-dark bg-gray-100">= Rp {grandTotal.toLocaleString('id-ID')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <hr className="border-dashed mt-0" />
                    {invoice.note && (
                        <div className="px-4">
                            <div className="alert alert-dismissible p-4 mt-3 alert-soft-warning-message" role="alert">
                                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                <p className="mb-0">
                                    <strong>NOTES:</strong> {invoice.note}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="px-4 pt-4 d-sm-flex align-items-center justify-content-between">
                        <div className="mb-5 mb-sm-0">
                            <h6 className="fs-13 fw-bold mb-3">Terms &amp; Condition :</h6>
                            {invoice.termsAndCondition && Array.isArray(invoice.termsAndCondition) && invoice.termsAndCondition.length > 0 ? (
                                <ul className="list-unstyled lh-lg fs-12">
                                    {invoice.termsAndCondition.map((term, idx) => (
                                        <li key={idx}># {term}</li>
                                    ))}
                                </ul>
                            ) : invoice.termsAndCondition && typeof invoice.termsAndCondition === 'string' ? (
                                <ul className="list-unstyled lh-lg fs-12">
                                    {invoice.termsAndCondition.split('\n').filter(line => line.trim()).map((line, idx) => (
                                        <li key={idx}># {line.trim()}</li>
                                    ))}
                                </ul>
                            ) : (
                                <ul className="list-unstyled lh-lg fs-12">
                                    <li># All accounts are to be paid within 7 days from receipt of invoice.</li>
                                    <li># To be paid by cheque or credit card or direct payment online.</li>
                                    <li># If account is not paid within 7 days the credits details supplied as confirmation.</li>
                                    <li># This is computer generated receipt and does not require physical signature.</li>
                                </ul>
                            )}
                        </div>
                        <div className="text-center">
                            {invoice.signatureUrl ? (
                                <img 
                                    src={invoice.signatureUrl} 
                                    className="img-fluid" 
                                    alt="signature" 
                                    style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                                    onError={(e) => {
                                        console.error('Error loading signature:', invoice.signatureUrl);
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : invoice.signatureText ? (
                                <div style={{ fontFamily: 'cursive', fontSize: '24px', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {invoice.signatureText}
                                </div>
                            ) : (
                                <img src="/images/general/signature.png" className="img-fluid wd-100" alt="signature" />
                            )}
                            <h6 className="fs-13 fw-bold mt-2">{invoice.signatureTitle || 'Account Manager'}</h6>
                            <p className="fs-11 fw-semibold text-muted">
                                {formatDate(invoice.createdAt || new Date().toISOString())}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InvoiceView
