import React from 'react'
import { FiBook, FiCheckCircle, FiAward, FiDollarSign } from 'react-icons/fi'

const StatCard = ({ title, value, icon, color }) => (
    <div className="col-xxl-3 col-md-6 mb-4">
        <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between">
                    <div>
                        <p className="text-muted small mb-1">{title}</p>
                        <h4 className="fw-bold mb-0 text-dark">{value}</h4>
                    </div>
                    <div className={`avatar-text avatar-lg bg-soft-${color} text-${color} rounded-circle`} style={{ width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    </div>
)

const ParticipantDashboardStats = ({ stats }) => {
    if (!stats) {
        // Show default stats with 0 values
        return (
            <>
                <StatCard
                    title="Kelas Terdaftar"
                    value={0}
                    icon={<FiBook size={24} />}
                    color="primary"
                />
                <StatCard
                    title="Kelas Selesai"
                    value={0}
                    icon={<FiCheckCircle size={24} />}
                    color="success"
                />
                <StatCard
                    title="Sertifikat"
                    value={0}
                    icon={<FiAward size={24} />}
                    color="warning"
                />
                <StatCard
                    title="Total Pembayaran"
                    value="Rp 0"
                    icon={<FiDollarSign size={24} />}
                    color="info"
                />
            </>
        )
    }

    return (
        <>
            <StatCard
                title="Kelas Terdaftar"
                value={stats.totalClasses || 0}
                icon={<FiBook size={24} />}
                color="primary"
            />
            <StatCard
                title="Kelas Selesai"
                value={stats.completedClasses || 0}
                icon={<FiCheckCircle size={24} />}
                color="success"
            />
            <StatCard
                title="Sertifikat"
                value={stats.certificates || 0}
                icon={<FiAward size={24} />}
                color="warning"
            />
            <StatCard
                title="Total Pembayaran"
                value={stats.totalPaid || 'Rp 0'}
                icon={<FiDollarSign size={24} />}
                color="info"
            />
        </>
    )
}

export default ParticipantDashboardStats

