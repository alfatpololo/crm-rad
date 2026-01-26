'use client'
import { useEffect, useRef } from 'react'

const Html5QrcodeScanner = ({ onScanSuccess, onScanError }) => {
    const scannerRef = useRef(null)
    const html5QrCodeScannerRef = useRef(null)

    useEffect(() => {
        const initScanner = async () => {
            try {
                const { Html5Qrcode } = await import('html5-qrcode')
                
                if (scannerRef.current && !html5QrCodeScannerRef.current) {
                    html5QrCodeScannerRef.current = new Html5Qrcode('qr-reader')
                    
                    const config = {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0
                    }

                    await html5QrCodeScannerRef.current.start(
                        { facingMode: 'environment' },
                        config,
                        onScanSuccess,
                        onScanError
                    )
                }
            } catch (error) {
                console.error('Scanner initialization error:', error)
                if (onScanError) {
                    onScanError('Failed to initialize scanner: ' + error.message)
                }
            }
        }

        initScanner()

        return () => {
            if (html5QrCodeScannerRef.current) {
                html5QrCodeScannerRef.current.stop().catch(console.error)
                html5QrCodeScannerRef.current = null
            }
        }
    }, [onScanSuccess, onScanError])

    return <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }}></div>
}

export default Html5QrcodeScanner

