'use client'
import React, { useState, useEffect } from 'react'
import { FiDownload, FiCopy, FiCheck } from 'react-icons/fi'
import Swal from 'sweetalert2'

const QRCodeDisplay = ({ qrCodeData, serviceName, className = '' }) => {
    const [copied, setCopied] = useState(false)
    const [QRCodeSVG, setQRCodeSVG] = useState(null)

    useEffect(() => {
        // Dynamic import to avoid SSR issues
        import('qrcode.react').then((module) => {
            setQRCodeSVG(() => module.QRCodeSVG)
        })
    }, [])

    const handleDownload = () => {
        const svg = document.getElementById(`qrcode-${qrCodeData}`)
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `QR-${serviceName || 'Kelas'}-${Date.now()}.png`
                link.click()
                URL.revokeObjectURL(url)
            })
        }

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(qrCodeData)
            setCopied(true)
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'QR Code data berhasil disalin',
                timer: 2000,
                showConfirmButton: false,
            })
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: 'Gagal menyalin QR Code data',
            })
        }
    }

    if (!qrCodeData) {
        return null
    }

    if (!QRCodeSVG) {
        return (
            <div className={`text-center ${className}`}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading QR Code...</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`text-center ${className}`}>
            <div className="card border-0 shadow-sm p-3 mb-3" style={{ display: 'inline-block' }}>
                <QRCodeSVG
                    id={`qrcode-${qrCodeData}`}
                    value={qrCodeData}
                    size={200}
                    level="H"
                    includeMargin={true}
                />
            </div>
            <div className="d-flex gap-2 justify-content-center">
                <button
                    className="btn btn-sm btn-primary"
                    onClick={handleDownload}
                >
                    <FiDownload size={16} className="me-1" />
                    Download
                </button>
                <button
                    className="btn btn-sm btn-light"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <>
                            <FiCheck size={16} className="me-1" />
                            Tersalin!
                        </>
                    ) : (
                        <>
                            <FiCopy size={16} className="me-1" />
                            Salin Data
                        </>
                    )}
                </button>
            </div>
            <p className="text-muted small mt-2 mb-0">
                Tunjukkan QR Code ini saat check-in di lokasi kelas
            </p>
        </div>
    )
}

export default QRCodeDisplay

