'use client'
import React, { useState } from 'react'
import { FiDownload, FiUpload, FiFile } from 'react-icons/fi'
import Swal from 'sweetalert2'
import { exportParticipantsData, importParticipantsData } from '@/actions/crm'
import { useRouter } from 'next/navigation'

const ImportExportContent = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const fileInputRef = React.useRef(null)

    const handleExport = async (format = 'csv') => {
        setLoading(true)
        try {
            const result = await exportParticipantsData(format)
            
            if (result.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: result.error,
                    confirmButtonColor: '#dc3545',
                })
                return
            }

            // Convert to CSV
            if (result.data && result.data.length > 0) {
                const headers = Object.keys(result.data[0])
                const csvContent = [
                    headers.join(','),
                    ...result.data.map(row => 
                        headers.map(header => {
                            const value = row[header] || ''
                            // Escape commas and quotes
                            return `"${String(value).replace(/"/g, '""')}"`
                        }).join(',')
                    )
                ].join('\n')

                // Download file
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                const link = document.createElement('a')
                const url = URL.createObjectURL(blob)
                link.setAttribute('href', url)
                link.setAttribute('download', `participants_export_${new Date().toISOString().split('T')[0]}.csv`)
                link.style.visibility = 'hidden'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: `Data berhasil diekspor (${result.data.length} peserta)`,
                    confirmButtonColor: '#198754',
                })
            }
        } catch (error) {
            console.error('Error exporting data:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Terjadi kesalahan saat mengekspor data',
                confirmButtonColor: '#dc3545',
            })
        } finally {
            setLoading(false)
        }
    }

    const handleImport = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.name.endsWith('.csv')) {
            Swal.fire({
                icon: 'error',
                title: 'Format Tidak Valid',
                text: 'File harus berformat CSV',
                confirmButtonColor: '#dc3545',
            })
            return
        }

        setLoading(true)
        try {
            const text = await file.text()
            const lines = text.split('\n').filter(line => line.trim())
            
            if (lines.length < 2) {
                throw new Error('File CSV harus memiliki header dan minimal 1 data')
            }

            // Parse CSV
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
            const data = []

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
                const row = {}
                headers.forEach((header, idx) => {
                    row[header] = values[idx] || ''
                })
                
                // Validate required fields
                if (row.email || row.name) {
                    data.push({
                        name: row.name || '',
                        email: row.email || '',
                        phone: row.phone || '',
                    })
                }
            }

            if (data.length === 0) {
                throw new Error('Tidak ada data valid untuk diimport')
            }

            // Confirm import
            const confirm = await Swal.fire({
                title: 'Konfirmasi Import',
                html: `Anda akan mengimport <b>${data.length}</b> peserta. Lanjutkan?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, Import',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#198754',
            })

            if (confirm.isConfirmed) {
                const result = await importParticipantsData(data)

                if (result.error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: result.error,
                        confirmButtonColor: '#dc3545',
                    })
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        html: `
                            <p>Import selesai:</p>
                            <ul style="text-align: left;">
                                <li>Berhasil: <b>${result.success}</b></li>
                                <li>Gagal: <b>${result.failed}</b></li>
                            </ul>
                        `,
                        confirmButtonColor: '#198754',
                    })
                    router.refresh()
                }
            }
        } catch (error) {
            console.error('Error importing data:', error)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Terjadi kesalahan saat mengimport data',
                confirmButtonColor: '#dc3545',
            })
        } finally {
            setLoading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className="col-lg-12">
            <div className="row">
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Export Database</h5>
                        </div>
                        <div className="card-body">
                            <p className="text-muted">Ekspor data peserta ke file CSV</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleExport('csv')}
                                disabled={loading}
                            >
                                <FiDownload size={16} className="me-2" />
                                {loading ? 'Mengekspor...' : 'Export CSV'}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Import Database</h5>
                        </div>
                        <div className="card-body">
                            <p className="text-muted">Import data peserta dari file CSV</p>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept=".csv"
                                    onChange={handleImport}
                                    className="d-none"
                                    id="import-file"
                                />
                                <label htmlFor="import-file" className="btn btn-primary">
                                    <FiUpload size={16} className="me-2" />
                                    {loading ? 'Mengimport...' : 'Import CSV'}
                                </label>
                            </div>
                            <small className="text-muted d-block mt-2">
                                Format CSV: name, email, phone
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ImportExportContent



