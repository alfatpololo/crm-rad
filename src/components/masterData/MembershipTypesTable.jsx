'use client'
import React from 'react'
import { FiEdit3, FiMoreHorizontal } from 'react-icons/fi'
import Dropdown from '@/components/shared/Dropdown'
import Table from '@/components/shared/table/Table'
import { useRouter } from 'next/navigation'

const actions = [{ label: 'Edit', icon: <FiEdit3 /> }]

const MembershipTypesTable = ({ data }) => {
    const router = useRouter()

    const handleAction = (action, rowData) => {
        if (action === 'Edit') router.push(`/master-data/membership-types/edit/${rowData.id}`)
    }

    const columns = [
        { accessorKey: 'name', header: () => 'Nama Membership', cell: (info) => <span className="fw-bold">{info.getValue()}</span> },
        {
            accessorKey: 'price',
            header: () => 'Harga',
            cell: (info) => <span>Rp {Number(info.getValue() || 0).toLocaleString('id-ID')}</span>,
        },
        {
            accessorKey: 'durationMonths',
            header: () => 'Durasi',
            cell: (info) => <span>{info.getValue() || 0} bulan</span>,
        },
        {
            accessorKey: 'description',
            header: () => 'Deskripsi',
            cell: (info) => <span className="text-muted text-truncate d-inline-block" style={{ maxWidth: '280px' }}>{info.getValue() || '-'}</span>,
        },
        {
            accessorKey: 'status',
            header: () => 'Status',
            cell: (info) => {
                const status = info.getValue() || 'active'
                return (
                    <span className={`badge ${status === 'active' ? 'bg-soft-success text-success' : 'bg-soft-secondary text-secondary'}`}>
                        {status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                )
            },
        },
        {
            accessorKey: 'actions',
            header: () => 'Aksi',
            cell: (info) => {
                const rowData = info.row.original
                return (
                    <div className="hstack gap-2 justify-content-end">
                        <Dropdown
                            dropdownItems={actions}
                            triggerIcon={<FiMoreHorizontal />}
                            triggerClass="avatar-md"
                            triggerPosition={"0,21"}
                            onClick={(label) => handleAction(label, rowData)}
                            id={rowData.id}
                        />
                    </div>
                )
            },
            meta: { headerClassName: 'text-end' },
        },
    ]

    return <Table data={data || []} columns={columns} />
}

export default MembershipTypesTable
