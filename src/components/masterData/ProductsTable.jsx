'use client'
import React, { useEffect } from 'react'
import { FiEdit3, FiEye, FiMoreHorizontal, FiTrash2 } from 'react-icons/fi'
import Dropdown from '@/components/shared/Dropdown';
import Table from '@/components/shared/table/Table';
import Link from 'next/link';

const actions = [
    { label: "Edit", icon: <FiEdit3 /> },
    { type: "divider" },
    { label: "Delete", icon: <FiTrash2 />, },
];

const ProductsTable = ({ data }) => {
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
            accessorKey: 'name',
            header: () => 'Product Name',
            cell: (info) => <span className='fw-bold'>{info.getValue()}</span>
        },
        {
            accessorKey: 'description',
            header: () => 'Description',
            cell: (info) => <span className="text-muted text-truncate-1-line">{info.getValue()}</span>
        },
        {
            accessorKey: 'price',
            header: () => 'Price',
            meta: {
                className: "fw-bold text-dark"
            }
        },
        {
            accessorKey: 'stock',
            header: () => 'Stock',
            cell: (info) => <span className={`badge ${info.getValue() > 0 ? 'bg-soft-success text-success' : 'bg-soft-danger text-danger'}`}>{info.getValue() || 0}</span>
        },
        {
            accessorKey: 'actions',
            header: () => "Actions",
            cell: info => (
                <div className="hstack gap-2 justify-content-end">
                    <Dropdown dropdownItems={actions} triggerIcon={<FiMoreHorizontal />} triggerClass='avatar-md' triggerPosition={"0,21"} />
                </div>
            ),
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

export default ProductsTable
