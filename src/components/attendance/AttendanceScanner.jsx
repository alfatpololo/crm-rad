'use client'
import React, { useState, useRef, useEffect } from 'react'
import { FiCamera, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi'
import { scanAttendance } from '@/actions/attendance'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

// Dynamic import for html5-qrcode to avoid SSR issues
let Html5Qrcode = null
if (typeof window !== 'undefined') {
    import('html5-qrcode').then((module) => {
        Html5Qrcode = module.Html5Qrcode
    })
}

const AttendanceScanner = () => {
    const router = useRouter()
    const [scanning, setScanning] = useState(false)
    const [scannedData, setScannedData] = useState(null)
    const [loading, setLoading] = useState(false)
    const scannerRef = useRef(null)
    const html5QrCodeRef = useRef(null)

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(() => {})
            }
        }
    }, [])

    const startScan = async () => {
        try {
            setScanning(true)
            setScannedData(null)

            // Dynamic import if not loaded
            if (!Html5Qrcode) {
                const module = await import('html5-qrcode')
                Html5Qrcode = module.Html5Qrcode
            }

            // Initialize HTML5 QR Code Scanner
            const html5QrCode = new Html5Qrcode("reader")
            html5QrCodeRef.current = html5QrCode

            await html5QrCode.start(
                { facingMode: "environment" }, // Use back camera
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 }
                },
                (decodedText, decodedResult) => {
                    // QR Code detected
                    handleScanResult(decodedText)
                },
                (errorMessage) => {
                    // Ignore errors, just keep scanning
                }
            )
        } catch (error) {
            console.error('Error starting scanner:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.',
                confirmButtonColor: '#dc3545',
            })
            setScanning(false)
        }
    }

    const stopScan = async () => {
        try {
            if (html5QrCodeRef.current) {
                await html5QrCodeRef.current.stop()
                html5QrCodeRef.current.clear()
                html5QrCodeRef.current = null
            }
        } catch (error) {
            console.error('Error stopping scanner:', error)
        }
        setScanning(false)
    }

    const handleScanResult = async (qrData) => {
        // Stop scanning
        await stopScan()

        setLoading(true)
        try {
            const result = await scanAttendance(qrData)

            if (result.success) {
                setScannedData({
                    success: true,
                    participant: result.participant,
                    service: result.service,
                    attendance: result.attendance,
                })

                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    html: `
                        <p><strong>Kehadiran berhasil dicatat!</strong></p>
                        <p class="mb-1">Peserta: <strong>${result.participant.name}</strong></p>
                        <p class="mb-1">Kelas: <strong>${result.service.name}</strong></p>
                        <p class="mb-0 small text-muted">Waktu: ${new Date(result.attendance.attendedDate).toLocaleString('id-ID')}</p>
                    `,
                    confirmButtonColor: '#198754',
                })

                // Auto refresh after 2 seconds
                setTimeout(() => {
                    setScannedData(null)
                }, 2000)
            } else {
                setScannedData({
                    success: false,
                    error: result.error,
                    alreadyScanned: result.alreadyScanned,
                })

                if (result.alreadyScanned) {
                    await Swal.fire({
                        icon: 'info',
                        title: 'Sudah Di-scan',
                        html: `
                            <p>Peserta <strong>${result.participant?.name || 'Unknown'}</strong> sudah pernah di-scan untuk kelas ini.</p>
                            <p class="small text-muted mb-0">Waktu scan sebelumnya: ${result.attendanceData?.attendedDate ? new Date(result.attendanceData.attendedDate).toLocaleString('id-ID') : '-'}</p>
                        `,
                        confirmButtonColor: '#198754',
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: result.error || 'Gagal memproses scan QR code',
                        confirmButtonColor: '#dc3545',
                    })
                }
            }
        } catch (error) {
            console.error('Error processing scan:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Terjadi kesalahan saat memproses scan',
                confirmButtonColor: '#dc3545',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleManualInput = async () => {
        const { value: qrData } = await Swal.fire({
            title: 'Input QR Code Manual',
            input: 'text',
            inputLabel: 'Masukkan data QR Code',
            inputPlaceholder: 'Paste QR Code data di sini...',
            showCancelButton: true,
            confirmButtonText: 'Scan',
            cancelButtonText: 'Batal',
            inputValidator: (value) => {
                if (!value) {
                    return 'QR Code data tidak boleh kosong!'
                }
            }
        })

        if (qrData) {
            await handleScanResult(qrData)
        }
    }

    return (
        <div className="col-lg-12">
            <div className="row">
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Scanner QR Code</h5>
                        </div>
                        <div className="card-body">
                            <div className="text-center mb-3">
                                {!scanning ? (
                                    <div>
                                        <div className="mb-3" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                            <div>
                                                <FiCamera size={64} className="text-muted mb-3" />
                                                <p className="text-muted">Klik tombol di bawah untuk mulai scan</p>
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-primary btn-lg"
                                            onClick={startScan}
                                        >
                                            <FiCamera size={20} className="me-2" />
                                            Mulai Scan
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <div id="reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
                                        <button
                                            className="btn btn-danger mt-3"
                                            onClick={stopScan}
                                        >
                                            <FiXCircle size={16} className="me-2" />
                                            Stop Scan
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="text-center">
                                <button
                                    className="btn btn-light"
                                    onClick={handleManualInput}
                                    disabled={scanning || loading}
                                >
                                    <FiRefreshCw size={16} className="me-2" />
                                    Input Manual
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Hasil Scan</h5>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Memproses...</span>
                                    </div>
                                    <p className="text-muted mt-3 mb-0">Memproses QR Code...</p>
                                </div>
                            ) : scannedData ? (
                                <div>
                                    {scannedData.success ? (
                                        <div className="alert alert-success">
                                            <FiCheckCircle size={24} className="me-2" />
                                            <strong>Kehadiran Berhasil Dicatat!</strong>
                                        </div>
                                    ) : (
                                        <div className="alert alert-warning">
                                            <FiXCircle size={24} className="me-2" />
                                            <strong>{scannedData.error}</strong>
                                        </div>
                                    )}

                                    {scannedData.participant && (
                                        <div className="mt-3">
                                            <h6>Informasi Peserta</h6>
                                            <p className="mb-1"><strong>Nama:</strong> {scannedData.participant.name}</p>
                                            <p className="mb-0"><strong>Email:</strong> {scannedData.participant.email}</p>
                                        </div>
                                    )}

                                    {scannedData.service && (
                                        <div className="mt-3">
                                            <h6>Informasi Kelas</h6>
                                            <p className="mb-0"><strong>Nama Kelas:</strong> {scannedData.service.name}</p>
                                        </div>
                                    )}

                                    {scannedData.attendance && (
                                        <div className="mt-3">
                                            <h6>Waktu Kehadiran</h6>
                                            <p className="mb-0">
                                                {new Date(scannedData.attendance.attendedDate).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted mb-0">Belum ada hasil scan</p>
                                    <p className="text-muted small mt-2">Gunakan scanner untuk scan QR Code peserta</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AttendanceScanner

