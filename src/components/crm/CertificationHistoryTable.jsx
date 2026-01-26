'use client'
import React from 'react'
import Table from '@/components/shared/table/Table'
import Link from 'next/link'

const CertificationHistoryTable = ({ data = [] }) => {
    const columns = [
        {
            accessorKey: 'participantName',
            header: () => 'Peserta',
            cell: (info) => {
                const row = info.row.original
                return (
                    <div>
                        <div className="fw-bold">{row.participantName}</div>
                        <small className="text-muted">{row.participantEmail}</small>
                    </div>
                )
            }
        },
        {
            accessorKey: 'serviceName',
            header: () => 'Sertifikasi/Kelas',
            cell: (info) => {
                const row = info.row.original
                return (
                    <div>
                        <div className="fw-bold">{row.serviceName}</div>
                        <small className="text-muted">{row.serviceType === 'event' ? 'Event' : 'Kelas'}</small>
                    </div>
                )
            }
        },
        {
            accessorKey: 'status',
            header: () => 'Status',
            cell: (info) => {
                const status = info.getValue()
                let badgeClass = 'bg-soft-warning text-warning'
                let statusText = 'Terdaftar'
                
                if (status === 'completed') {
                    badgeClass = 'bg-soft-success text-success'
                    statusText = 'Selesai'
                } else if (status === 'enrolled') {
                    badgeClass = 'bg-soft-info text-info'
                    statusText = 'Terdaftar'
                }
                
                return <span className={`badge ${badgeClass}`}>{statusText}</span>
            }
        },
        {
            accessorKey: 'enrolledDate',
            header: () => 'Tanggal Daftar',
            cell: (info) => {
                const date = info.getValue()
                return date ? new Date(date).toLocaleDateString('id-ID') : '-'
            }
        },
        {
            accessorKey: 'completedDate',
            header: () => 'Tanggal Selesai',
            cell: (info) => {
                const date = info.getValue()
                return date ? new Date(date).toLocaleDateString('id-ID') : '-'
            }
        },
        {
            accessorKey: 'expiryDate',
            header: () => 'Tanggal Expired',
            cell: (info) => {
                const date = info.getValue()
                return date ? new Date(date).toLocaleDateString('id-ID') : '-'
            }
        },
    ]

    return (
        <div className="col-lg-12">
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Daftar Riwayat Ikut Sertifikasi</h5>
                </div>
                <div className="card-body">
                    <Table data={data} columns={columns} />
                </div>
            </div>
        </div>
    )
}

export default CertificationHistoryTable



