'use client'
import React from 'react'
import Table from '@/components/shared/table/Table'

const AttendanceHistoryTable = ({ data = [] }) => {
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
            header: () => 'Event/Kelas',
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
            header: () => 'Status Kehadiran',
            cell: (info) => {
                const status = info.getValue()
                let badgeClass = 'bg-soft-info text-info'
                let statusText = 'Terdaftar'
                
                if (status === 'attended') {
                    badgeClass = 'bg-soft-success text-success'
                    statusText = 'Hadir'
                } else if (status === 'absent') {
                    badgeClass = 'bg-soft-danger text-danger'
                    statusText = 'Tidak Hadir'
                } else if (status === 'cancelled') {
                    badgeClass = 'bg-soft-secondary text-secondary'
                    statusText = 'Dibatalkan'
                }
                
                return <span className={`badge ${badgeClass}`}>{statusText}</span>
            }
        },
        {
            accessorKey: 'registeredDate',
            header: () => 'Tanggal Daftar',
            cell: (info) => {
                const date = info.getValue()
                return date ? new Date(date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : '-'
            }
        },
        {
            accessorKey: 'attendedDate',
            header: () => 'Tanggal Hadir',
            cell: (info) => {
                const date = info.getValue()
                return date ? new Date(date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : '-'
            }
        },
        {
            accessorKey: 'notes',
            header: () => 'Catatan',
            cell: (info) => {
                const notes = info.getValue()
                return notes || '-'
            }
        },
    ]

    return (
        <div className="col-lg-12">
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Daftar Riwayat Kehadiran (RSVP)</h5>
                </div>
                <div className="card-body">
                    <Table data={data} columns={columns} />
                </div>
            </div>
        </div>
    )
}

export default AttendanceHistoryTable



