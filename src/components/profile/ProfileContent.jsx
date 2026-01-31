'use client'
import React from 'react'
import TabOverviewContent from '../customersView/TabOverviewContent'
import TabPaymentHistory from '../customersView/TabPaymentHistory'
import Profile from '../widgetsList/Profile'

const ProfileContent = () => {
    return (
        <>
            <div className="col-xxl-4 col-xl-6">
                <div className="mb-4">
                    <Profile />
                </div>
            </div>
            <div className="col-xxl-8 col-xl-6">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-transparent border-bottom p-0">
                        <ul className="nav nav-tabs flex-wrap w-100 text-center customers-nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item flex-fill border-top" role="presentation">
                                <a href="#" className="nav-link active" data-bs-toggle="tab" data-bs-target="#overviewTab" role="tab">Kelas Saya</a>
                            </li>
                            <li className="nav-item flex-fill border-top" role="presentation">
                                <a href="#" className="nav-link" data-bs-toggle="tab" data-bs-target="#billingTab" role="tab">Pembayaran</a>
                            </li>
                        </ul>
                    </div>
                    <div className="tab-content">
                        <TabOverviewContent />
                        <TabPaymentHistory />
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProfileContent

