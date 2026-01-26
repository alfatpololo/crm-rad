'use client'
import React, { useRef } from 'react'
import { FiBarChart, FiBriefcase, FiDollarSign, FiEye, FiFilter, FiFlag, FiPaperclip, FiPlus, FiUserCheck, FiUserMinus, FiUsers, FiSend, FiUpload } from 'react-icons/fi'
import { BsFiletypeCsv, BsFiletypeExe, BsFiletypePdf, BsFiletypeTsx, BsFiletypeXml, BsPrinter } from 'react-icons/bs';
import Dropdown from '@/components/shared/Dropdown';
import CustomersStatistics from '../widgetsStatistics/CustomersStatistics';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { importParticipants } from '@/actions/participants';

const filterAction = [
    { label: "Semua", icon: <FiEye /> },
    { label: "Grup", icon: <FiUsers /> },
    { label: "Negara", icon: <FiFlag /> },
    { label: "Invoice", icon: <FiDollarSign /> },
    { label: "Proyek", icon: <FiBriefcase /> },
    { label: "Aktif", icon: <FiUserCheck /> },
    { label: "Tidak Aktif", icon: <FiUserMinus /> },
];
const fileType = [
    { label: "PDF", icon: <BsFiletypePdf /> },
    { label: "CSV", icon: <BsFiletypeCsv /> },
    { label: "XML", icon: <BsFiletypeXml /> },
    { label: "Teks", icon: <BsFiletypeTsx /> },
    { label: "Excel", icon: <BsFiletypeExe /> },
    { label: "Cetak", icon: <BsPrinter /> },
];

const CustomersHeader = () => {
    const fileInputRef = useRef(null);

    const handleBlastPromo = () => {
        Swal.fire({
            title: 'Kirim Promo Massal',
            text: 'Pilih target audiens dan template pesan.',
            input: 'select',
            inputOptions: {
                'all': 'Semua Pengguna',
                'active': 'Hanya Pengguna Aktif',
                'inactive': 'Hanya Pengguna Tidak Aktif'
            },
            showCancelButton: true,
            confirmButtonText: 'Kirim',
            cancelButtonText: 'Batal',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 2000);
                });
            },
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire('Berhasil!', 'Promo berhasil dikirim.', 'success');
            }
        });
    };

    const handleImportClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Mocking CSV/JSON parsing for now
        // In real app, parse file here
        const mockData = [
            { name: "Imported User 1", email: "import1@test.com", phone: "08123456789" },
            { name: "Imported User 2", email: "import2@test.com", phone: "08123456780" }
        ];

        Swal.fire({
            title: 'Importing...',
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const result = await importParticipants(mockData);

        if (result.success) {
            Swal.fire('Success', `Imported ${result.count} participants.`, 'success');
        } else {
            Swal.fire('Error', result.error, 'error');
        }

        event.target.value = null; // Reset input
    };

    return (
        <>
            <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".csv,.json"
                    onChange={handleFileChange}
                />

                <button className="btn btn-icon btn-light-brand" onClick={handleBlastPromo} title="Kirim Promo Massal">
                    <FiSend size={16} strokeWidth={1.6} />
                </button>

                <button className="btn btn-icon btn-light-brand" onClick={handleImportClick} title="Impor Pelanggan">
                    <FiUpload size={16} strokeWidth={1.6} />
                </button>

                <a href="#" className="btn btn-icon btn-light-brand" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                    <FiBarChart size={16} strokeWidth={1.6} />
                </a>
                <Dropdown
                    dropdownItems={filterAction}
                    triggerPosition={"0, 12"}
                    triggerIcon={<FiFilter size={16} strokeWidth={1.6} />}
                    triggerClass='btn btn-icon btn-light-brand'
                    isAvatar={false}
                />
                <Dropdown
                    dropdownItems={fileType}
                    triggerPosition={"0, 12"}
                    triggerIcon={<FiPaperclip size={16} strokeWidth={1.6} />}
                    triggerClass='btn btn-icon btn-light-brand'
                    iconStrokeWidth={0}
                    isAvatar={false}
                />
                <Link href="/customers/create" className="btn btn-primary">
                    <FiPlus size={16} className='me-2' />
                    <span>Tambah Pelanggan</span>
                </Link>
            </div>

            <div id="collapseOne" className="accordion-collapse collapse page-header-collapse">
                <div className="accordion-body pb-2">
                    <div className="row">
                        <CustomersStatistics />
                    </div>
                </div>
            </div>
        </>
    )
}

export default CustomersHeader