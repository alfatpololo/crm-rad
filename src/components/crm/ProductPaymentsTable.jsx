'use client'
import React from 'react'
import Table from '@/components/shared/table/Table'
import Link from 'next/link'

const ProductPaymentsTable = ({ data = [] }) => {
    const columns = [
        {
            accessorKey: 'invoiceNumber',
            header: () => 'Invoice',
            cell: (info) => (
                <Link href={`/payment/view?id=${info.row.original.id}`} className="fw-bold">
                    {info.getValue()}
                </Link>
            )
        },
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
            accessorKey: 'items',
            header: () => 'Produk',
            cell: (info) => {
                const items = info.getValue() || []
                return (
                    <div>
                        {items.map((item, idx) => (
                            <div key={idx} className="small">
                                {item.product || item.name} (Qty: {item.qty || 1})
                            </div>
                        ))}
                    </div>
                )
            }
        },
        {
            accessorKey: 'total',
            header: () => 'Total',
            cell: (info) => {
                const total = info.getValue() || 0
                return <span className="fw-bold">Rp {total.toLocaleString('id-ID')}</span>
            }
        },
        {
            accessorKey: 'status',
            header: () => 'Status',
            cell: (info) => {
                const status = info.getValue()
                let badgeClass = 'bg-soft-warning text-warning'
                let statusText = 'Pending'
                
                if (status === 'paid') {
                    badgeClass = 'bg-soft-success text-success'
                    statusText = 'Lunas'
                } else if (status === 'cancelled') {
                    badgeClass = 'bg-soft-danger text-danger'
                    statusText = 'Dibatalkan'
                }
                
                return <span className={`badge ${badgeClass}`}>{statusText}</span>
            }
        },
        {
            accessorKey: 'issueDate',
            header: () => 'Tanggal Invoice',
            cell: (info) => {
                const date = info.getValue()
                return date ? new Date(date).toLocaleDateString('id-ID') : '-'
            }
        },
        {
            accessorKey: 'paidDate',
            header: () => 'Tanggal Bayar',
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
                    <h5 className="mb-0">Daftar Pembayaran Produk/Merchandise</h5>
                </div>
                <div className="card-body">
                    <Table data={data} columns={columns} />
                </div>
            </div>
        </div>
    )
}

export default ProductPaymentsTable



