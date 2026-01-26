'use server'

// Email sending via API route (nodemailer not compatible with server actions)
export async function sendQRCodeEmail({ to, className, qrCodeBase64, classDetails }) {
    try {
        // Validate inputs
        if (!to || !className || !qrCodeBase64) {
            return {
                success: false,
                error: 'Data tidak lengkap'
            }
        }

        // Check if Resend is configured
        if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_api_key_here') {
            console.warn('Resend not configured. Returning test mode.')
            return {
                success: true,
                message: `Email berhasil dikirim ke ${to} (TEST MODE - Resend belum dikonfigurasi)`,
                testMode: true
            }
        }

        // Call API route
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-qr-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, className, qrCodeBase64, classDetails })
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
        }

        const result = await response.json()
        return result
    } catch (error) {
        console.error('Error sending email:', error)
        return {
            success: false,
            error: error.message || 'Gagal mengirim email'
        }
    }
}

/*
// Old nodemailer code - moved to API route
const mailOptions = {
            from: `"CRM System" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: `QR Code Kehadiran - ${className}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .qr-container { background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                        .qr-code { max-width: 280px; height: auto; margin: 0 auto; }
                        .details { background: white; padding: 20px; margin-top: 20px; border-radius: 8px; border-left: 4px solid #667eea; }
                        .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                        .details-label { font-weight: bold; color: #666; }
                        .details-value { color: #333; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
                        .instructions { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
                        .instructions h3 { margin-top: 0; color: #1976d2; }
                        .instructions ol { margin: 10px 0; padding-left: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0;">🎫 QR Code Kehadiran</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Tiket Kehadiran Anda</p>
                        </div>
                        <div class="content">
                            <p>Halo,</p>
                            <p>Berikut adalah QR Code untuk kehadiran kelas Anda. Tunjukkan QR Code ini kepada panitia saat check-in.</p>
                            
                            <div class="qr-container">
                                <h3 style="margin-top: 0; color: #667eea;">📱 Scan QR Code Ini</h3>
                                <img src="cid:qrcode" alt="QR Code" class="qr-code" />
                                <p style="margin-bottom: 0; color: #999; font-size: 12px;">QR Code untuk ${className}</p>
                            </div>

                            <div class="details">
                                <h3 style="margin-top: 0; color: #667eea;">📋 Detail Kelas</h3>
                                <div class="details-row">
                                    <span class="details-label">Nama Kelas:</span>
                                    <span class="details-value">${classDetails.name || '-'}</span>
                                </div>
                                <div class="details-row">
                                    <span class="details-label">Tanggal Daftar:</span>
                                    <span class="details-value">${classDetails.date || '-'}</span>
                                </div>
                                <div class="details-row">
                                    <span class="details-label">Durasi:</span>
                                    <span class="details-value">${classDetails.duration || '-'}</span>
                                </div>
                                <div class="details-row" style="border-bottom: none;">
                                    <span class="details-label">Status:</span>
                                    <span class="details-value" style="color: #4caf50; font-weight: bold;">✓ ${classDetails.status === 'enrolled' ? 'Terdaftar' : classDetails.status}</span>
                                </div>
                            </div>

                            <div class="instructions">
                                <h3>📝 Cara Penggunaan:</h3>
                                <ol>
                                    <li>Simpan atau screenshot QR Code di atas</li>
                                    <li>Bawa QR Code saat datang ke lokasi kelas</li>
                                    <li>Tunjukkan ke panitia untuk di-scan</li>
                                    <li>Kehadiran Anda akan tercatat secara otomatis</li>
                                </ol>
                            </div>

                            <p style="margin-top: 20px; color: #666;">
                                <strong>Catatan:</strong> QR Code ini bersifat pribadi. Jangan bagikan kepada orang lain.
                            </p>
                        </div>
                        <div class="footer">
                            <p>Email ini dikirim secara otomatis dari CRM System</p>
                            <p>Jika ada pertanyaan, silakan hubungi admin</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            attachments: [
                {
                    filename: 'qr-code.png',
                    content: qrCodeBase64,
                    encoding: 'base64',
                    cid: 'qrcode' // Content-ID for inline image
                }
            ]
        }

*/
