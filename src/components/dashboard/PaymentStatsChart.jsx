'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import CardHeader from '@/components/shared/CardHeader'
import CardLoader from '@/components/shared/CardLoader'
import useCardTitleActions from '@/hooks/useCardTitleActions'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false })

const PaymentStatsChart = ({ paymentStats }) => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()

    if (isRemoved) return null

    const months = paymentStats.monthlyData?.map(d => d.month) || []
    const completedData = paymentStats.monthlyData?.map(d => d.completed) || []
    const pendingData = paymentStats.monthlyData?.map(d => d.pending) || []
    const failedData = paymentStats.monthlyData?.map(d => d.failed) || []

    const chartOptions = {
        chart: {
            type: 'bar',
            stacked: false,
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 4
            }
        },
        dataLabels: { enabled: false },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        xaxis: {
            categories: months,
            labels: {
                formatter: (value) => {
                    if (!value) return ''
                    const [year, month] = value.split('-')
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
                    return monthNames[parseInt(month) - 1] || value
                }
            }
        },
        yaxis: { title: { text: 'Jumlah Transaksi' } },
        fill: { opacity: 1 },
        colors: ['#10b981', '#f59e0b', '#ef4444'],
        legend: {
            position: 'top',
            horizontalAlign: 'right'
        },
        tooltip: {
            y: {
                formatter: (val) => `${val} transaksi`
            }
        },
        series: [
            { name: 'Lunas', data: completedData },
            { name: 'Pending', data: pendingData },
            { name: 'Gagal', data: failedData }
        ]
    }

    return (
        <div className="col-xxl-6">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader title="Statistik Pembayaran" refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />
                <div className="card-body custom-card-action p-0">
                    <ReactApexChart
                        options={chartOptions}
                        series={chartOptions.series}
                        type="bar"
                        height={377}
                    />
                </div>
                <div className="card-footer">
                    <div className="row g-4">
                        <StatCard 
                            bg_color="bg-warning" 
                            value={paymentStats.awaiting} 
                            title="Menunggu" 
                        />
                        <StatCard 
                            bg_color="bg-success" 
                            value={paymentStats.completed} 
                            title="Selesai" 
                        />
                        <StatCard 
                            bg_color="bg-danger" 
                            value={paymentStats.rejected} 
                            title="Ditolak" 
                        />
                        <StatCard 
                            bg_color="bg-primary" 
                            value={`Rp ${(paymentStats.revenue || 0).toLocaleString('id-ID')}`} 
                            title="Total Pendapatan" 
                        />
                    </div>
                </div>
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

const StatCard = ({ title, value, bg_color }) => {
    return (
        <div className="col-lg-3">
            <div className="p-3 border border-dashed rounded">
                <div className="fs-12 text-muted mb-1">{title}</div>
                <h6 className="fw-bold text-dark">{value}</h6>
                <div className="progress mt-2 ht-3">
                    <div className={`progress-bar ${bg_color}`} role="progressbar" style={{ width: '100%' }}></div>
                </div>
            </div>
        </div>
    )
}

export default PaymentStatsChart
