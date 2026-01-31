'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import CardHeader from '@/components/shared/CardHeader'
import useCardTitleActions from '@/hooks/useCardTitleActions'
import CardLoader from '@/components/shared/CardLoader'

const RecentParticipants = ({ participants = [] }) => {
    const { refreshKey, isRemoved, isExpanded, handleRefresh, handleExpand, handleDelete } = useCardTitleActions()

    if (isRemoved) return null

    return (
        <div className="col-xxl-6">
            <div className={`card stretch stretch-full ${isExpanded ? "card-expand" : ""} ${refreshKey ? "card-loading" : ""}`}>
                <CardHeader title="Peserta Terbaru" refresh={handleRefresh} remove={handleDelete} expanded={handleExpand} />
                <div className="card-body custom-card-action p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr className="border-b">
                                    <th>Peserta</th>
                                    <th>Telepon</th>
                                    <th>Kelas</th>
                                    <th>Tanggal Daftar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.length > 0 ? (
                                    participants.map((participant) => (
                                        <tr key={participant.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div className="avatar-image">
                                                        <Image 
                                                            width={38} 
                                                            height={38} 
                                                            src={participant.photoURL} 
                                                            alt={participant.name}
                                                            className="img-fluid rounded-circle"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="d-block fw-medium">{participant.name}</span>
                                                        <span className="fs-12 text-muted">{participant.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-muted">{participant.phone}</td>
                                            <td>
                                                <span className="badge bg-soft-primary text-primary">
                                                    {participant.enrolledClasses} Kelas
                                                </span>
                                            </td>
                                            <td className="text-muted small">
                                                {participant.createdAt ? new Date(participant.createdAt).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                }) : '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-muted">
                                            Belum ada peserta terdaftar
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {participants.length > 0 && (
                    <div className="card-footer">
                        <Link href="/customers/list" className="btn btn-sm btn-light-brand">
                            Lihat Semua Peserta
                        </Link>
                    </div>
                )}
                <CardLoader refreshKey={refreshKey} />
            </div>
        </div>
    )
}

export default RecentParticipants
