'use client'
import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { db } from '@/lib/firebase/config'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
// import { FiDownload, FiArrowLeft, FiLoader } from 'react-icons/fi'
import Link from 'next/link'
import Swal from 'sweetalert2'

const QRCodePage = ({ serviceId }) => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [classData, setClassData] = useState(null)
    const [qrCodeData, setQrCodeData] = useState(null)
    const [QRCodeSVG, setQRCodeSVG] = useState(null)
    const qrRef = useRef(null)

    useEffect(() => {
        // Load QRCode library
        import('qrcode.react').then((module) => {
            setQRCodeSVG(() => module.QRCodeSVG)
        }).catch(err => {
            console.error('Failed to load QR Code library:', err)
        })
    }, [])

    useEffect(() => {
        const fetchClassData = async () => {
            if (!user || !serviceId) {
                setLoading(false)
                return
            }

            try {
                // Get participant data
                const participantDoc = await getDoc(doc(db, 'participants', user.uid))
                if (!participantDoc.exists()) {
                    setLoading(false)
                    return
                }

                const participantData = participantDoc.data()
                const enrolledClasses = participantData.enrolledClasses || []
                
                // Find the class
                const foundClass = enrolledClasses.find(
                    cls => cls.id === serviceId || cls.serviceId === serviceId
                )

                if (foundClass) {
                    setClassData(foundClass)
                    
                    // Check if QR code data exists
                    if (foundClass.qrCodeData) {
                        setQrCodeData(foundClass.qrCodeData)
                    } else {
                        // Generate QR code data
                        const { generateQRCodeData } = await import('@/utils/qrCode')
                        const purchaseDate = foundClass.purchaseDate ? new Date(foundClass.purchaseDate) : new Date()
                        const generated = generateQRCodeData(serviceId, user.uid, purchaseDate)
                        setQrCodeData(generated)
                        
                        // Update in Firestore
                        const classIndex = enrolledClasses.findIndex(
                            cls => cls.id === serviceId || cls.serviceId === serviceId
                        )
                        if (classIndex !== -1) {
                            enrolledClasses[classIndex] = { ...enrolledClasses[classIndex], qrCodeData: generated }
                            await updateDoc(doc(db, 'participants', user.uid), {
                                enrolledClasses: enrolledClasses,
                                updatedAt: new Date()
                            })
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching class data:', error)
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Gagal memuat data kelas',
                })
            } finally {
                setLoading(false)
            }
        }

        fetchClassData()
    }, [user, serviceId])

    const handleDownload = () => {
        if (!qrRef.current) return

        const svg = qrRef.current.querySelector('svg')
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `QR-${classData?.name || 'Kelas'}-${Date.now()}.png`
                link.click()
                URL.revokeObjectURL(url)
            })
        }

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
    }

    if (loading) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-3 mb-0">Memuat QR Code...</p>
                </div>
            </div>
        )
    }

    if (!classData) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                    <h5 className="mb-3">Kelas Tidak Ditemukan</h5>
                    <p className="text-muted mb-4">Anda belum terdaftar di kelas ini</p>
                    <Link href="/profile" className="btn btn-primary">
                        ← Kembali ke Profile
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
                <div className="mb-4">
                    <Link href="/profile" className="btn btn-sm btn-light mb-3">
                        ← Kembali
                    </Link>
                    <h5 className="fw-bold mb-2">QR Code Kehadiran</h5>
                    <p className="text-muted mb-0">{classData.name || classData.title}</p>
                </div>

                <div className="row justify-content-center">
                    <div className="col-lg-8 col-xl-6">
                        <div className="card border-0 shadow-sm bg-light">
                            <div className="card-body text-center p-5">
                                {qrCodeData && QRCodeSVG ? (
                                    <>
                                        <div 
                                            ref={qrRef}
                                            className="bg-white p-4 rounded-3 d-inline-block mb-4"
                                            style={{ boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}
                                        >
                                            {React.createElement(QRCodeSVG, {
                                                value: qrCodeData,
                                                size: 280,
                                                level: "H",
                                                includeMargin: true
                                            })}
                                        </div>
                                        <div className="d-flex justify-content-center mb-3">
                                            <button
                                                className="btn btn-primary btn-lg px-5"
                                                onClick={handleDownload}
                                            >
                                                💾 Download QR Code
                                            </button>
                                        </div>
                                        <div className="alert alert-info mb-0">
                                            <small className="d-block mb-2">
                                                <strong>📋 Cara Penggunaan:</strong>
                                            </small>
                                            <small className="d-block text-start">
                                                1. <strong>Download</strong> QR Code dengan klik tombol di atas<br />
                                                2. Atau <strong>screenshot</strong> langsung dari halaman ini<br />
                                                3. <strong>Tunjukkan</strong> QR Code ke panitia saat check-in<br />
                                                4. Kehadiran Anda akan <strong>tercatat otomatis</strong> ✓
                                            </small>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-4">
                                        <div className="spinner-border text-primary mb-3" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="text-muted">Membuat QR Code...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Class Details */}
                        <div className="card border-0 shadow-sm mt-3">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3">Detail Kelas</h6>
                                <div className="row g-3">
                                    <div className="col-6">
                                        <div className="small text-muted">Nama Kelas</div>
                                        <div className="fw-medium">{classData.name || classData.title}</div>
                                    </div>
                                    <div className="col-6">
                                        <div className="small text-muted">Status</div>
                                        <div>
                                            <span className="badge bg-soft-success text-success">
                                                {classData.status === 'enrolled' ? 'Terdaftar' : classData.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="small text-muted">Tanggal Daftar</div>
                                        <div className="fw-medium">
                                            {classData.purchaseDate 
                                                ? new Date(classData.purchaseDate).toLocaleDateString('id-ID') 
                                                : '-'}
                                        </div>
                                    </div>
                                    {classData.duration && (
                                        <div className="col-6">
                                            <div className="small text-muted">Durasi</div>
                                            <div className="fw-medium">{classData.duration}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QRCodePage


