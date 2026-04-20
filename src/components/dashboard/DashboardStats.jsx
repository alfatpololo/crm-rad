import React from 'react'
import { FiDollarSign, FiUsers, FiBook, FiFileText } from 'react-icons/fi'
import { formatShortCurrency } from '@/utils/formatCurrency'

const StatCard = ({ title, value, icon, color, isCurrency }) => (
    <div className="col-xxl-3 col-md-6">
        <div className="card stretch stretch-full short-info-card">
            <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex gap-4 align-items-center">
                        <div className={`avatar-text avatar-lg bg-soft-${color} text-${color} icon`}>
                            {icon}
                        </div>
                        <div>
                            <div className="fs-4 fw-bold text-dark text-truncate" title={typeof value === 'number' && isCurrency ? undefined : String(value)}>
                                <span className="counter">{isCurrency ? formatShortCurrency(value) : value}</span>
                            </div>
                            <h3 className="fs-13 fw-semibold text-truncate-1-line">{title}</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

const DashboardStats = ({ stats }) => {
    return (
        <>
            <StatCard
                title="Total Pendapatan"
                value={stats.revenue}
                icon={<FiDollarSign size={24} />}
                color="success"
                isCurrency
            />
            <StatCard
                title="Total Invoice"
                value={stats.totalInvoices}
                icon={<FiFileText size={24} />}
                color="primary"
            />
            <StatCard
                title="Total Peserta"
                value={stats.participants}
                icon={<FiUsers size={24} />}
                color="info"
            />
            <StatCard
                title="Total Kelas/Layanan"
                value={stats.totalClasses}
                icon={<FiBook size={24} />}
                color="warning"
            />
        </>
    )
}

export default DashboardStats
