'use client'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Swal from 'sweetalert2'

// Dynamic import to avoid SSR issues
const Html5QrcodeScanner = dynamic(
    () => import('./Html5QrcodeScanner'),
    { ssr: false }
)

const MobileScannerContent = () => {
    const [scanResult, setScanResult] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [recentScans, setRecentScans] = useState([])
    const [scanMode, setScanMode] = useState('camera') // 'camera' or 'upload'

    // Hide main layout elements on mount
    useEffect(() => {
        // Hide sidebar, header, and other layout elements
        const elementsToHide = [
            'header',
            '.sidebar',
            '.page-header',
            'nav',
            '.breadcrumb'
        ]
        
        const hiddenElements = []
        elementsToHide.forEach(selector => {
            const elements = document.querySelectorAll(selector)
            elements.forEach(el => {
                hiddenElements.push({ el, display: el.style.display })
                el.style.display = 'none'
            })
        })

        // Set body to full screen
        document.body.style.margin = '0'
        document.body.style.padding = '0'
        document.body.style.overflow = 'hidden'

        return () => {
            // Restore on unmount
            hiddenElements.forEach(({ el, display }) => {
                el.style.display = display
            })
            document.body.style.margin = ''
            document.body.style.padding = ''
            document.body.style.overflow = ''
        }
    }, [])

    const handleScanSuccess = async (decodedText) => {
        if (isProcessing) return // Prevent double scan
        
        setIsProcessing(true)
        setScanResult(decodedText)
        await processQRCode(decodedText)
    }

    const handleScanError = (error) => {
        // Ignore common errors (camera still scanning)
        if (error.includes('NotFoundException')) return
        console.error('Scanner error:', error)
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (isProcessing) return

        setIsProcessing(true)

        try {
            // Import QR code reader
            const { Html5Qrcode } = await import('html5-qrcode')
            const html5QrCode = new Html5Qrcode('file-qr-reader')

            // Scan file
            const decodedText = await html5QrCode.scanFile(file, true)
            
            // Process the result (same as camera scan)
            await processQRCode(decodedText)
            
            // Clear file input
            event.target.value = ''
        } catch (error) {
            console.error('File scan error:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Gagal membaca QR Code dari gambar. Pastikan gambar mengandung QR Code yang valid.',
                confirmButtonText: 'OK'
            })
            setIsProcessing(false)
        }
    }

    const processQRCode = async (decodedText) => {
        try {
            // Import and call scan attendance action
            const { scanAttendance } = await import('@/actions/attendance')
            const result = await scanAttendance(decodedText)

            if (result.success) {
                // Success feedback
                const audio = new Audio('/sounds/success.mp3')
                audio.play().catch(() => {}) // Play sound if available

                // Add to recent scans
                setRecentScans(prev => [{
                    name: result.data.participantName,
                    className: result.data.className,
                    time: new Date().toLocaleTimeString('id-ID'),
                    status: 'success'
                }, ...prev.slice(0, 4)])

                // Show success modal
                await Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    html: `
                        <div style="text-align: left; padding: 10px;">
                            <p style="margin: 5px 0;"><strong>Nama:</strong> ${result.data.participantName}</p>
                            <p style="margin: 5px 0;"><strong>Kelas:</strong> ${result.data.className}</p>
                            <p style="margin: 5px 0;"><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID')}</p>
                            ${result.data.alreadyAttended ? '<p style="color: #b45309; margin-top: 10px;">Sudah absen sebelumnya.</p>' : ''}
                        </div>
                    `,
                    confirmButtonText: 'OK',
                    timer: 3000,
                    timerProgressBar: true
                })
            } else {
                // Error feedback
                await Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: result.error || 'QR Code tidak valid',
                    confirmButtonText: 'OK'
                })
            }
        } catch (error) {
            console.error('Process error:', error)
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Terjadi kesalahan saat memproses QR Code',
                confirmButtonText: 'OK'
            })
        } finally {
            setIsProcessing(false)
            setScanResult(null)
        }
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999
        }}>
            {/* Header */}
            <div style={{
                background: 'rgba(255,255,255,0.95)',
                padding: '15px 20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                            Scanner kehadiran
                        </h1>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                            Scan QR Code peserta untuk absensi
                        </p>
                    </div>
                    <a 
                        href="/attendance" 
                        style={{
                            background: '#667eea',
                            color: 'white',
                            padding: '8px 15px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        Dashboard
                    </a>
                </div>
                
                {/* Mode Toggle */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setScanMode('camera')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: scanMode === 'camera' ? '#667eea' : '#f0f0f0',
                            color: scanMode === 'camera' ? 'white' : '#666',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: scanMode === 'camera' ? 'bold' : 'normal',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Scan kamera
                    </button>
                    <button
                        onClick={() => setScanMode('upload')}
                        style={{
                            flex: 1,
                            padding: '10px',
                            background: scanMode === 'upload' ? '#667eea' : '#f0f0f0',
                            color: scanMode === 'upload' ? 'white' : '#666',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: scanMode === 'upload' ? 'bold' : 'normal',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Upload gambar
                    </button>
                </div>
            </div>

            {/* Scanner Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                overflow: 'auto'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '20px',
                    maxWidth: '500px',
                    width: '100%',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                }}>
                    {scanMode === 'camera' ? (
                        <>
                            {/* Camera Scanner Component */}
                            <div style={{ 
                                borderRadius: '15px', 
                                overflow: 'hidden',
                                border: '3px solid #667eea'
                            }}>
                                <Html5QrcodeScanner
                                    onScanSuccess={handleScanSuccess}
                                    onScanError={handleScanError}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Upload QR Code */}
                            <div style={{
                                border: '3px dashed #667eea',
                                borderRadius: '15px',
                                padding: '40px 20px',
                                textAlign: 'center',
                                background: '#f8f9ff'
                            }}>
                                <div
                                    style={{
                                        marginBottom: '15px',
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        letterSpacing: '0.04em',
                                        color: '#667eea',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Upload
                                </div>
                                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Upload QR Code</h3>
                                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
                                    Pilih gambar QR Code dari galeri
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    id="qr-upload"
                                    disabled={isProcessing}
                                />
                                <label
                                    htmlFor="qr-upload"
                                    style={{
                                        display: 'inline-block',
                                        padding: '12px 30px',
                                        background: '#667eea',
                                        color: 'white',
                                        borderRadius: '10px',
                                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                                        fontWeight: 'bold',
                                        opacity: isProcessing ? 0.6 : 1
                                    }}
                                >
                                    {isProcessing ? 'Memproses...' : 'Pilih gambar'}
                                </label>
                                <div id="file-qr-reader" style={{ display: 'none' }}></div>
                            </div>
                        </>
                    )}

                    {/* Processing Indicator */}
                    {isProcessing && (
                        <div style={{
                            marginTop: '20px',
                            padding: '15px',
                            background: '#fff3cd',
                            borderRadius: '10px',
                            textAlign: 'center',
                            border: '2px solid #ffc107'
                        }}>
                            <div className="spinner-border spinner-border-sm text-warning me-2" role="status"></div>
                            <span style={{ color: '#856404', fontWeight: 'bold' }}>Memproses...</span>
                        </div>
                    )}

                    {/* Instructions */}
                    <div style={{
                        marginTop: '20px',
                        padding: '15px',
                        background: '#e7f3ff',
                        borderRadius: '10px',
                        fontSize: '14px',
                        color: '#004085',
                        border: '1px solid #b8daff'
                    }}>
                        <strong>Cara penggunaan</strong>
                        {scanMode === 'camera' ? (
                            <ol style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                                <li>Arahkan kamera ke QR Code peserta</li>
                                <li>QR Code akan ter-scan otomatis</li>
                                <li>Kehadiran akan tercatat langsung</li>
                            </ol>
                        ) : (
                            <ol style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                                <li>Klik "Pilih Gambar"</li>
                                <li>Pilih foto/screenshot QR Code dari galeri</li>
                                <li>QR Code akan dibaca otomatis</li>
                                <li>Kehadiran akan tercatat langsung</li>
                            </ol>
                        )}
                    </div>
                </div>

                {/* Recent Scans */}
                {recentScans.length > 0 && (
                    <div style={{
                        background: 'white',
                        borderRadius: '15px',
                        padding: '15px',
                        maxWidth: '500px',
                        width: '100%',
                        marginTop: '20px',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#333' }}>
                            Scan terakhir
                        </h3>
                        {recentScans.map((scan, index) => (
                            <div key={index} style={{
                                padding: '10px',
                                background: index === 0 ? '#d4edda' : '#f8f9fa',
                                borderRadius: '8px',
                                marginBottom: '8px',
                                fontSize: '13px',
                                border: index === 0 ? '2px solid #28a745' : '1px solid #dee2e6'
                            }}>
                                <div style={{ fontWeight: 'bold', color: '#333' }}>{scan.name}</div>
                                <div style={{ color: '#666', fontSize: '12px' }}>
                                    {scan.className} • {scan.time}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Info */}
            <div style={{
                background: 'rgba(255,255,255,0.9)',
                padding: '10px',
                textAlign: 'center',
                fontSize: '12px',
                color: '#666'
            }}>
                <p style={{ margin: 0 }}>Mode admin scanner · {new Date().toLocaleDateString('id-ID')}</p>
            </div>
        </div>
    )
}

export default MobileScannerContent

