'use client'
import React, { useState } from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import Footer from '@/components/shared/Footer'

const SettingsView = () => {
    const [activeTab, setActiveTab] = useState('identity')

    return (
        <>
            <PageHeader />
            <div className='main-content'>
                <div className="row">
                    <div className="col-lg-12">
                        <div className="card border-top-0">
                            <div className="card-header p-0">
                                <ul className="nav nav-tabs flex-wrap w-100 text-center" role="tablist">
                                    <li className="nav-item flex-fill border-top">
                                        <a
                                            className={`nav-link ${activeTab === 'identity' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('identity')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Company Identity
                                        </a>
                                    </li>
                                    <li className="nav-item flex-fill border-top">
                                        <a
                                            className={`nav-link ${activeTab === 'roles' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('roles')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            User Roles
                                        </a>
                                    </li>
                                    <li className="nav-item flex-fill border-top">
                                        <a
                                            className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('templates')}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            Templates
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="card-body">
                                {activeTab === 'identity' && (
                                    <div className="tab-pane fade show active">
                                        <h5 className="mb-4">Company Details</h5>
                                        <form>
                                            <div className="row mb-4">
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Company Name</label>
                                                    <input type="text" className="form-control" defaultValue="Duralux" />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Email</label>
                                                    <input type="email" className="form-control" defaultValue="info@duralux.com" />
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label className="form-label">Phone</label>
                                                    <input type="text" className="form-control" defaultValue="+123456789" />
                                                </div>
                                                <div className="col-md-12 mb-3">
                                                    <label className="form-label">Address</label>
                                                    <textarea className="form-control" rows="3"></textarea>
                                                </div>
                                            </div>
                                            <button className="btn btn-primary">Save Changes</button>
                                        </form>
                                    </div>
                                )}

                                {activeTab === 'roles' && (
                                    <div className="tab-pane fade show active">
                                        <h5 className="mb-4">User Role Management</h5>
                                        <p className="text-muted">Manage access levels for Superadmin, Admin, Officer, Finance.</p>
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th>Role Name</th>
                                                        <th>Users</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>Superadmin</td>
                                                        <td>1</td>
                                                        <td><span className="badge bg-soft-success text-success">Active</span></td>
                                                        <td><button className="btn btn-sm btn-light">Edit</button></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Admin</td>
                                                        <td>3</td>
                                                        <td><span className="badge bg-soft-success text-success">Active</span></td>
                                                        <td><button className="btn btn-sm btn-light">Edit</button></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'templates' && (
                                    <div className="tab-pane fade show active">
                                        <h5 className="mb-4">System Templates</h5>
                                        <div className="row">
                                            <div className="col-md-6 mb-4">
                                                <div className="card border">
                                                    <div className="card-body">
                                                        <h6>Invoice Template</h6>
                                                        <p className="text-muted small">Customize the look of your PDFs.</p>
                                                        <button className="btn btn-sm btn-primary">Configure</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-4">
                                                <div className="card border">
                                                    <div className="card-body">
                                                        <h6>Email Notification</h6>
                                                        <p className="text-muted small">Set up email triggers and content.</p>
                                                        <button className="btn btn-sm btn-primary">Configure</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default SettingsView
