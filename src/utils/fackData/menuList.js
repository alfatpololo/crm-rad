export const adminMenuList = [
    {
        id: 1,
        name: "Dasbor",
        path: "/dashboard",
        icon: 'feather-airplay',
        dropdownMenu: []
    },
    {
        id: 2,
        name: "Invoice",
        path: "/payment",
        icon: 'feather-dollar-sign',
        dropdownMenu: []
    },
    {
        id: 3,
        name: "Data Master",
        path: "#",
        icon: 'feather-database',
        dropdownMenu: [
            {
                id: 1,
                name: "Layanan/Kelas",
                path: "/master-data/services",
                subdropdownMenu: false
            },
            {
                id: 2,
                name: "Produk",
                path: "/master-data/products",
                subdropdownMenu: false
            },
            {
                id: 3,
                name: "Kategori",
                path: "/master-data/categories",
                subdropdownMenu: false
            },
            {
                id: 4,
                name: "Jenis Layanan",
                path: "/master-data/service-types",
                subdropdownMenu: false
            },
            {
                id: 41,
                name: "Tipe Membership",
                path: "/master-data/membership-types",
                subdropdownMenu: false
            },
            {
                id: 5,
                name: "Metode Pembayaran",
                path: "/master-data/payment-methods",
                subdropdownMenu: false,
                disabled: true
            },
            {
                id: 6,
                name: "Pajak & Voucher",
                path: "/master-data/tax-vouchers",
                subdropdownMenu: false,
                disabled: true
            }
        ]
    },
    {
        id: 4,
        name: "CRM",
        path: "/customers/list",
        icon: 'feather-users',
        dropdownMenu: [
            {
                id: 1,
                name: "Kelola Database Peserta",
                path: "/customers/list",
                subdropdownMenu: false
            },
            {
                id: 2,
                name: "Riwayat Ikut Sertifikasi",
                path: "/customers/certification-history",
                subdropdownMenu: false
            },
            {
                id: 3,
                name: "Riwayat Pembayaran Sertifikasi",
                path: "/customers/certification-payments",
                subdropdownMenu: false
            },
            {
                id: 4,
                name: "Riwayat Pembayaran Produk",
                path: "/customers/product-payments",
                subdropdownMenu: false
            },
            {
                id: 5,
                name: "Riwayat Kehadiran (RSVP)",
                path: "/customers/attendance-history",
                subdropdownMenu: false
            },
            {
                id: 9,
                name: "Scan QR Code Kehadiran",
                path: "/attendance/scan",
                subdropdownMenu: false
            },
            {
                id: 6,
                name: "Kelola Sertifikat",
                path: "/customers/certificates",
                subdropdownMenu: false
            },
            {
                id: 7,
                name: "Impor/Ekspor Database",
                path: "/customers/import-export",
                subdropdownMenu: false
            },
            {
                id: 8,
                name: "Blast Promo",
                path: "/customers/blast",
                subdropdownMenu: false
            }
        ]
    }
];


export const userMenuList = [
    {
        id: 1,
        name: "Dasbor",
        path: "/dashboard",
        icon: 'feather-airplay',
        dropdownMenu: []
    },
    {
        id: 2,
        name: "Layanan/Kelas",
        path: "/services",
        icon: 'feather-book',
        dropdownMenu: []
    },
    {
        id: 22,
        name: "Merch / Produk",
        path: "/products",
        icon: 'feather-shopping-bag',
        dropdownMenu: []
    },
    {
        id: 3,
        name: "Sertifikat",
        path: "/certificates",
        icon: 'feather-award',
        dropdownMenu: []
    },
    {
        id: 4,
        name: "Perpanjangan",
        path: "/extensions",
        icon: 'feather-clock',
        dropdownMenu: []
    },
    {
        id: 5,
        name: "Kehadiran",
        path: "/attendance",
        icon: 'feather-check-circle',
        dropdownMenu: []
    },
    {
        id: 7,
        name: "Membership",
        path: "/membership",
        icon: 'feather-award',
        dropdownMenu: []
    },
    {
        id: 6,
        name: "Profil",
        path: "/profile",
        icon: 'feather-user',
        dropdownMenu: []
    }
];


export const menuList = adminMenuList;
