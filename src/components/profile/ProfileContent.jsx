'use client'
import React, { useState } from 'react'
import TabOverviewContent from '../customersView/TabOverviewContent'
import TabPaymentHistory from '../customersView/TabPaymentHistory'
import Profile from '../widgetsList/Profile'

/**
 * @param {{ variant?: 'crm' | 'eduvalt' }} props
 */
const ProfileContent = ({ variant = 'crm' }) => {
    const [activeTab, setActiveTab] = useState('overview')

    if (variant === 'eduvalt') {
        return (
            <>
                <div className="col-lg-4">
                    <aside className="courses__details-sidebar">
                        <Profile variant="eduvalt" />
                    </aside>
                </div>
                <div className="col-lg-8">
                    <div className="courses__details-wrapper">
                        <ul className="nav nav-tabs" id="profileParticipantTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button
                                    type="button"
                                    className={activeTab === 'overview' ? 'nav-link active' : 'nav-link'}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    Kelas saya
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    type="button"
                                    className={activeTab === 'billing' ? 'nav-link active' : 'nav-link'}
                                    onClick={() => setActiveTab('billing')}
                                >
                                    Pembayaran
                                </button>
                            </li>
                        </ul>
                        <div className="tab-content" id="profileParticipantTabContent">
                            <div
                                className={
                                    activeTab === 'overview'
                                        ? 'tab-pane fade show active'
                                        : 'tab-pane fade'
                                }
                                id="overviewTab"
                                role="tabpanel"
                            >
                                <div className="courses__details-content px-3 px-lg-4 py-4">
                                    <TabOverviewContent omitTabPane />
                                </div>
                            </div>
                            <div
                                className={
                                    activeTab === 'billing'
                                        ? 'tab-pane fade show active'
                                        : 'tab-pane fade'
                                }
                                id="billingTab"
                                role="tabpanel"
                            >
                                <div className="courses__details-content px-3 px-lg-4 py-4">
                                    <TabPaymentHistory compact omitTabPaneWrapper />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

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

