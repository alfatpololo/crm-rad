'use client'
import React from 'react'
import Image from 'next/image'
import { FiCalendar, FiClock, FiUsers, FiDollarSign, FiMapPin, FiTag, FiBook, FiAward, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { getApplicablePriceTier } from '@/utils/servicePrice'

const ServiceDetailContent = ({ service }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '-'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch (e) {
            return dateString
        }
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return '-'
        try {
            const date = new Date(dateString)
            return date.toLocaleString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (e) {
            return dateString
        }
    }

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return <span className="badge bg-soft-success text-success"><FiCheckCircle className="me-1" />Aktif</span>
            case 'inactive':
                return <span className="badge bg-soft-danger text-danger"><FiXCircle className="me-1" />Tidak Aktif</span>
            default:
                return <span className="badge bg-soft-secondary text-secondary">{status || 'Unknown'}</span>
        }
    }

    const getTypeLabel = (type) => {
        switch (type?.toLowerCase()) {
            case 'class':
                return 'Kelas'
            case 'event':
                return 'Event'
            default:
                return type || 'Layanan'
        }
    }

    return (
        <div className="col-lg-12">
            <div className="row">
                {/* Main Content */}
                <div className="col-lg-8">
                    {/* Header Card */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <div className="d-flex align-items-start justify-content-between mb-3">
                                <div>
                                    <h3 className="mb-2">{service.name || 'Nama Layanan'}</h3>
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <span className="badge bg-soft-primary text-primary">
                                            <FiTag className="me-1" />
                                            {getTypeLabel(service.type)}
                                        </span>
                                        {getStatusBadge(service.status)}
                                        {service.isFree && (
                                            <span className="badge bg-soft-success text-success">
                                                <FiAward className="me-1" />
                                                Gratis
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Image */}
                            {service.imageUrl && (
                                <div className="mb-4">
                                    <div className="position-relative" style={{ width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                                        <Image
                                            src={service.imageUrl}
                                            alt={service.name || 'Service Image'}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 800px"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {service.description && (
                                <div className="mb-4">
                                    <h5 className="mb-3">Deskripsi</h5>
                                    <p className="text-muted" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                                        {service.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Informasi Detail</h5>
                        </div>
                        <div className="card-body">
                            <div className="row g-4">
                                {/* Price */}
                                <div className="col-md-6">
                                    <div className="d-flex align-items-center">
                                        <div className="avatar-text avatar-lg bg-soft-primary text-primary rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FiDollarSign size={20} />
                                        </div>
                                        <div>
                                            <p className="text-muted small mb-1">Harga</p>
                                            {(() => {
                                                const t = getApplicablePriceTier(service)
                                                return t.isFree ? (
                                                    <h5 className="mb-0 text-success fw-bold">GRATIS</h5>
                                                ) : (
                                                    <h5 className="mb-0 fw-bold">Rp {Number(t.price).toLocaleString('id-ID')}{t.label ? ` (${t.label})` : ''}</h5>
                                                )
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                {/* Category */}
                                {service.category && (
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-text avatar-lg bg-soft-info text-info rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiTag size={20} />
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-1">Kategori</p>
                                                <h6 className="mb-0 fw-bold">{service.category}</h6>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Start Date */}
                                {service.startDate && (
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-text avatar-lg bg-soft-warning text-warning rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiCalendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-1">Tanggal Mulai</p>
                                                <h6 className="mb-0 fw-bold">{formatDate(service.startDate)}</h6>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* End Date */}
                                {service.endDate && (
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-text avatar-lg bg-soft-danger text-danger rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiCalendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-1">Tanggal Selesai</p>
                                                <h6 className="mb-0 fw-bold">{formatDate(service.endDate)}</h6>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Location */}
                                {service.location && (
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-text avatar-lg bg-soft-secondary text-secondary rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiMapPin size={20} />
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-1">Lokasi</p>
                                                <h6 className="mb-0 fw-bold">{service.location}</h6>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Capacity */}
                                {service.capacity && (
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-text avatar-lg bg-soft-success text-success rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiUsers size={20} />
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-1">Kapasitas</p>
                                                <h6 className="mb-0 fw-bold">{service.capacity} peserta</h6>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Instructor */}
                                {service.instructor && (
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-text avatar-lg bg-soft-info text-info rounded-circle me-3" style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiBook size={20} />
                                            </div>
                                            <div>
                                                <p className="text-muted small mb-1">Instruktur</p>
                                                <h6 className="mb-0 fw-bold">{service.instructor}</h6>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Info Card */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">Informasi Tambahan</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-3">
                                <p className="text-muted small mb-1">ID Layanan</p>
                                <p className="mb-0 fw-medium font-monospace small">{service.id}</p>
                            </div>
                            <div className="mb-3">
                                <p className="text-muted small mb-1">Jenis Layanan</p>
                                <p className="mb-0 fw-medium">{getTypeLabel(service.type)}</p>
                            </div>
                            <div className="mb-3">
                                <p className="text-muted small mb-1">Status</p>
                                <div className="mb-0">
                                    {getStatusBadge(service.status)}
                                </div>
                            </div>
                            {service.isFree !== undefined && (
                                <div className="mb-3">
                                    <p className="text-muted small mb-1">Tipe Pembayaran</p>
                                    <p className="mb-0 fw-medium">
                                        {service.isFree ? (
                                            <span className="text-success">Gratis (Bypass Payment)</span>
                                        ) : (
                                            <span>Berbayar</span>
                                        )}
                                    </p>
                                </div>
                            )}
                            {service.createdAt && (
                                <div className="mb-3">
                                    <p className="text-muted small mb-1">Dibuat Pada</p>
                                    <p className="mb-0 fw-medium small">{formatDateTime(service.createdAt)}</p>
                                </div>
                            )}
                            {service.updatedAt && (
                                <div>
                                    <p className="text-muted small mb-1">Diupdate Pada</p>
                                    <p className="mb-0 fw-medium small">{formatDateTime(service.updatedAt)}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ServiceDetailContent



