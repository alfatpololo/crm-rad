'use client'
import React, { useEffect, useState } from 'react'
import { FiEdit3, FiEye, FiMoreHorizontal, FiTrash2 } from 'react-icons/fi'
import Dropdown from '@/components/shared/Dropdown';
import Table from '@/components/shared/table/Table';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { deleteService } from '@/actions/masterData';

const actions = [
    { label: "View", icon: <FiEye /> },
    { label: "Edit", icon: <FiEdit3 /> },
    { type: "divider" },
    { label: "Delete", icon: <FiTrash2 />, },
];

const ServicesTable = ({ data }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleAction = async (action, rowData) => {
        if (action === 'Delete') {
            const result = await Swal.fire({
                title: 'Apakah Anda yakin?',
                text: `Anda akan menghapus ${rowData.type === 'event' ? 'event' : 'kelas'} "${rowData.name}". Tindakan ini tidak dapat dibatalkan!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Ya, hapus!',
                cancelButtonText: 'Batal',
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                reverseButtons: true,
            });

            if (result.isConfirmed) {
                setLoading(true);
                try {
                    const deleteResult = await deleteService(rowData.id);
                    if (deleteResult.success) {
                        await Swal.fire({
                            icon: 'success',
                            title: 'Berhasil!',
                            text: `${rowData.type === 'event' ? 'Event' : 'Kelas'} berhasil dihapus`,
                            confirmButtonColor: '#198754',
                        });
                        router.refresh();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal',
                            text: deleteResult.error || 'Gagal menghapus data',
                            confirmButtonColor: '#dc3545',
                        });
                    }
                } catch (error) {
                    console.error('Error deleting service:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Terjadi kesalahan saat menghapus data',
                        confirmButtonColor: '#dc3545',
                    });
                } finally {
                    setLoading(false);
                }
            }
        } else if (action === 'View') {
            router.push(`/master-data/services/view/${rowData.id}`);
        } else if (action === 'Edit') {
            router.push(`/master-data/services/edit/${rowData.id}`);
        }
    };

    const columns = [
        {
            accessorKey: 'id',
            header: ({ table }) => {
                const checkboxRef = React.useRef(null);

                useEffect(() => {
                    if (checkboxRef.current) {
                        checkboxRef.current.indeterminate = table.getIsSomeRowsSelected();
                    }
                }, [table.getIsSomeRowsSelected()]);

                return (
                    <input
                        type="checkbox"
                        className="custom-table-checkbox"
                        ref={checkboxRef}
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                    />
                );
            },
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    className="custom-table-checkbox"
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    onChange={row.getToggleSelectedHandler()}
                />
            ),
            meta: {
                headerClassName: 'width-30',
            },
        },

        {
            accessorKey: 'imageUrl',
            header: () => 'Gambar',
            cell: (info) => {
                const imageUrl = info.getValue()
                if (!imageUrl) {
                    return <span className="text-muted small">-</span>
                }
                return (
                    <div className="position-relative" style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                        <Image
                            src={imageUrl}
                            alt="Service"
                            fill
                            className="object-cover"
                            sizes="60px"
                        />
                    </div>
                )
            },
            meta: {
                headerClassName: 'width-100',
                className: 'width-100'
            }
        },
        {
            accessorKey: 'type',
            header: () => 'Jenis',
            cell: (info) => {
                const type = info.getValue() || 'class'
                return (
                    <span className={`badge ${type === 'event' ? 'bg-soft-warning text-warning' : 'bg-soft-primary text-primary'}`}>
                        {type === 'event' ? 'Event' : 'Kelas'}
                    </span>
                )
            }
        },
        {
            accessorKey: 'name',
            header: () => 'Nama',
            cell: (info) => <span className='fw-bold'>{info.getValue()}</span>
        },
        {
            accessorKey: 'description',
            header: () => 'Deskripsi',
            cell: (info) => (
                <span className="text-muted text-truncate-1-line" style={{ maxWidth: '200px' }}>
                    {info.getValue() || '-'}
                </span>
            )
        },
        {
            accessorKey: 'price',
            header: () => 'Harga',
            cell: (info) => {
                const price = parseFloat(info.getValue() || 0)
                return (
                    <span className="fw-bold text-dark">
                        Rp {price.toLocaleString('id-ID')}
                    </span>
                )
            },
            meta: {
                className: "fw-bold text-dark"
            }
        },
        {
            accessorKey: 'category',
            header: () => 'Kategori',
            cell: (info) => {
                const category = info.getValue()
                if (!category) return <span className="text-muted">-</span>
                return (
                    <span className="badge bg-soft-primary text-primary">
                        {category}
                    </span>
                )
            }
        },
        {
            accessorKey: 'status',
            header: () => 'Status',
            cell: (info) => {
                const status = info.getValue() || 'active'
                return (
                    <span className={`badge ${status === 'active' ? 'bg-soft-success text-success' : 'bg-soft-danger text-danger'}`}>
                        {status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                )
            }
        },
        {
            accessorKey: 'actions',
            header: () => "Actions",
            cell: info => {
                const rowData = info.row.original;
                return (
                    <div className="hstack gap-2 justify-content-end">
                        <Dropdown 
                            dropdownItems={actions} 
                            triggerIcon={<FiMoreHorizontal />} 
                            triggerClass='avatar-md' 
                            triggerPosition={"0,21"}
                            onClick={(label) => handleAction(label, rowData)}
                            id={rowData.id}
                        />
                    </div>
                );
            },
            meta: {
                headerClassName: 'text-end'
            }
        },
    ]
    return (
        <>
            <Table data={data || []} columns={columns} />
        </>
    )
}

export default ServicesTable
