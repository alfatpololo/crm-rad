'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { db } from '@/lib/firebase/config'
import { doc, getDoc } from 'firebase/firestore'
import Link from 'next/link'

function categoryTagStyle(category) {
    const c = (category || '').toLowerCase()
    if (c.includes('marketing') || c.includes('bisnis') || c.includes('business')) {
        return { backgroundColor: '#BC18E4', color: '#fff' }
    }
    if (c.includes('design') || c.includes('cma') || c.includes('akuntansi') || c.includes('manajemen')) {
        return { backgroundColor: '#04BC53', color: '#fff' }
    }
    return { backgroundColor: '#FF109F', color: '#fff' }
}

/**
 * @param {{ omitTabPane?: boolean }} props — true: tanpa wrapper tab-pane (profil Eduvalt); UI kartu kelas mengikuti template Eduvalt.
 */
const TabOverviewContent = ({ omitTabPane = false }) => {
    const { user } = useAuth()
    const [enrolledClasses, setEnrolledClasses] = useState([])
    const [attendanceHistory, setAttendanceHistory] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEnrolledClasses = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            try {
                const participantDoc = await getDoc(doc(db, 'participants', user.uid))
                if (participantDoc.exists()) {
                    const data = participantDoc.data()
                    setEnrolledClasses(data.enrolledClasses || [])
                    setAttendanceHistory(data.attendanceHistory || [])
                }
            } catch (error) {
                console.error('Error fetching enrolled classes:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchEnrolledClasses()
    }, [user])

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="badge bg-soft-success text-success">Aktif</span>
            case 'enrolled':
                return <span className="badge bg-soft-success text-success">Terdaftar & Aktif</span>
            case 'completed':
                return <span className="badge bg-soft-info text-info">Selesai</span>
            case 'pending_payment':
                return <span className="badge bg-soft-warning text-warning">Menunggu Pembayaran</span>
            default:
                return <span className="badge bg-soft-primary text-primary">Terdaftar</span>
        }
    }

    const getAttendanceStatus = (classId) => {
        const attendance = attendanceHistory.find(
            (att) => (att.serviceId === classId || att.eventId === classId) && att.status === 'attended'
        )
        return attendance
    }

    const browseBtnClass = omitTabPane ? 'btn btn-sm' : 'btn btn-sm btn-primary'
    const browseBtnInnerEduvalt = (
        <>
            <i className="flaticon-searching me-1" aria-hidden />
            Jelajahi kelas
        </>
    )

    const eduvaltInner = (
        <div className="mb-0">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
                <h3 className="title mb-0 tg-svg" style={{ fontSize: '1.35rem' }}>
                    Kelas saya
                </h3>
                <Link href="/services" className={browseBtnClass}>
                    {browseBtnInnerEduvalt}
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : enrolledClasses.length > 0 ? (
                <div className="row g-4">
                    {enrolledClasses.map((cls, index) => {
                        const classId = cls.id || cls.serviceId
                        const attendance = getAttendanceStatus(classId)
                        const thumb = cls.imageUrl || '/assets/img/courses/course_thumb02.jpg'
                        const detailHref = `/services/view/${classId}`
                        const qrHref = `/qr-code/${classId}`

                        return (
                            <div key={classId || index} className="col-12">
                                <div className="courses__item shine__animate-item">
                                    <div className="courses__item-thumb">
                                        {cls.category ? (
                                            <span className="courses__item-tag" style={categoryTagStyle(cls.category)}>
                                                {cls.category}
                                            </span>
                                        ) : null}
                                        <Link href={detailHref} className="shine__animate-link">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={thumb} alt={cls.name || cls.title || 'Kelas'} />
                                        </Link>
                                    </div>
                                    <div className="courses__item-content">
                                        <ul className="courses__item-meta list-wrap">
                                            {cls.duration ? (
                                                <li>
                                                    <i className="flaticon-timer" /> {cls.duration}
                                                </li>
                                            ) : null}
                                            {cls.instructor ? (
                                                <li>
                                                    <i className="flaticon-user-1" /> {cls.instructor}
                                                </li>
                                            ) : null}
                                            <li>
                                                <i className="flaticon-file" />{' '}
                                                {cls.purchaseDate
                                                    ? new Date(cls.purchaseDate).toLocaleDateString('id-ID')
                                                    : '—'}
                                            </li>
                                        </ul>
                                        <h5 className="title">
                                            <Link href={detailHref}>{cls.name || cls.title || `Kelas ${index + 1}`}</Link>
                                        </h5>
                                        {cls.description ? (
                                            <p className="mb-2 small text-muted" style={{ lineHeight: 1.5 }}>
                                                {cls.description.length > 180
                                                    ? `${cls.description.slice(0, 180)}…`
                                                    : cls.description}
                                            </p>
                                        ) : null}
                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                                            {getStatusBadge(cls.status)}
                                            {attendance ? (
                                                <span className="badge bg-success">
                                                    <i className="fas fa-check me-1" aria-hidden />
                                                    Hadir
                                                </span>
                                            ) : null}
                                        </div>
                                        {attendance ? (
                                            <div className="alert alert-success py-2 px-3 mb-3 small" role="status">
                                                <strong>
                                                    <i className="fas fa-check-circle me-1" aria-hidden />
                                                    Kehadiran tercatat
                                                </strong>
                                                <br />
                                                <span className="text-muted">
                                                    {attendance.attendedDate
                                                        ? new Date(
                                                              attendance.attendedDate.seconds * 1000 || attendance.attendedDate
                                                          ).toLocaleString('id-ID')
                                                        : 'Sudah absen'}
                                                </span>
                                            </div>
                                        ) : null}
                                        <div className="courses__item-bottom align-items-end flex-wrap gap-3">
                                            <div className="text-start" style={{ flex: '1 1 200px' }}>
                                                <h5 className="price mb-1" style={{ marginLeft: 0 }}>
                                                    Rp {parseFloat(cls.price || 0).toLocaleString('id-ID')}
                                                </h5>
                                                {cls.invoiceNumber ? (
                                                    <Link
                                                        href="/payments-history"
                                                        className="small text-decoration-none d-inline-block"
                                                        style={{ color: 'inherit', opacity: 0.85 }}
                                                    >
                                                        Invoice: {cls.invoiceNumber}
                                                    </Link>
                                                ) : null}
                                            </div>
                                            <div className="tg-button-wrap d-flex flex-wrap gap-2 justify-content-end">
                                                <Link href={qrHref} className="btn btn-border btn-sm" title="Tampilkan QR Code">
                                                    <i className="fas fa-qrcode me-1" aria-hidden />
                                                    QR
                                                </Link>
                                                <Link href={detailHref} className="btn btn-sm">
                                                    Detail
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-5 px-3 border rounded-3 bg-light">
                    <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white border mb-3"
                        style={{ width: 72, height: 72 }}
                    >
                        <i className="flaticon-graduation-cap" style={{ fontSize: '1.75rem', lineHeight: 1 }} aria-hidden />
                    </div>
                    <h6 className="fw-bold mb-2">Belum ada kelas</h6>
                    <p className="text-muted small mb-3">Anda belum terdaftar di kelas. Jelajahi katalog untuk mendaftar.</p>
                    <Link href="/services" className="btn btn-sm">
                        {browseBtnInnerEduvalt}
                    </Link>
                </div>
            )}
        </div>
    )

    const crmInner = (
        <div className="mb-5">
            <div className="mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
                <h5 className="fw-bold mb-0">Kelas Saya</h5>
                <Link href="/services" className="btn btn-sm btn-primary">
                    <i className="fas fa-compass me-1" aria-hidden />
                    Jelajahi kelas
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : enrolledClasses.length > 0 ? (
                <div className="row g-3">
                    {enrolledClasses.map((cls, index) => {
                        const classId = cls.id || cls.serviceId
                        const attendance = getAttendanceStatus(classId)

                        return (
                            <div key={index} className="col-12">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-start justify-content-between mb-3">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                                    <h6 className="fw-bold mb-0">{cls.name || cls.title || `Kelas ${index + 1}`}</h6>
                                                    {attendance ? (
                                                        <span className="badge bg-success" title="Sudah Hadir">
                                                            <i className="fas fa-check me-1" aria-hidden />
                                                            Hadir
                                                        </span>
                                                    ) : null}
                                                </div>
                                                {cls.description ? <p className="text-muted small mb-2">{cls.description}</p> : null}
                                                <div className="d-flex flex-wrap gap-3 mb-2">
                                                    {cls.category ? (
                                                        <span className="badge bg-soft-primary text-primary">{cls.category}</span>
                                                    ) : null}
                                                    {cls.duration ? (
                                                        <span className="small text-muted">
                                                            <i className="far fa-clock me-1" aria-hidden />
                                                            {cls.duration}
                                                        </span>
                                                    ) : null}
                                                    {cls.instructor ? (
                                                        <span className="small text-muted">
                                                            <i className="far fa-user me-1" aria-hidden />
                                                            {cls.instructor}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <div className="text-end">{getStatusBadge(cls.status)}</div>
                                        </div>

                                        {attendance ? (
                                            <div className="alert alert-success mb-3 py-2" style={{ fontSize: '13px' }}>
                                                <strong>
                                                    <i className="fas fa-check-circle me-1" aria-hidden />
                                                    Kehadiran tercatat
                                                </strong>
                                                <br />
                                                <small className="text-muted">
                                                    {attendance.attendedDate
                                                        ? new Date(
                                                              attendance.attendedDate.seconds * 1000 || attendance.attendedDate
                                                          ).toLocaleString('id-ID')
                                                        : 'Sudah absen'}
                                                </small>
                                            </div>
                                        ) : null}

                                        <div className="border-top pt-3">
                                            <div className="row g-3">
                                                <div className="col-md-3">
                                                    <div className="small text-muted">Harga</div>
                                                    <div className="fw-bold text-primary">
                                                        Rp {parseFloat(cls.price || 0).toLocaleString('id-ID')}
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="small text-muted">Tanggal Daftar</div>
                                                    <div className="small">
                                                        {cls.purchaseDate ? new Date(cls.purchaseDate).toLocaleDateString('id-ID') : '-'}
                                                    </div>
                                                </div>
                                                {cls.invoiceNumber ? (
                                                    <div className="col-md-3">
                                                        <div className="small text-muted">Invoice</div>
                                                        <div className="small">
                                                            <Link href="/payments-history" className="text-primary text-decoration-none">
                                                                {cls.invoiceNumber}
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ) : null}
                                                <div className="col-md-3 text-end">
                                                    <div className="d-flex gap-2 justify-content-end">
                                                        <Link
                                                            href={`/qr-code/${cls.id || cls.serviceId}`}
                                                            className="btn btn-sm btn-light-primary d-flex align-items-center gap-1"
                                                            title="Tampilkan QR Code"
                                                        >
                                                            <i className="fas fa-qrcode" style={{ fontSize: '14px' }} aria-hidden />
                                                        </Link>
                                                        <Link
                                                            href={`/services/view/${cls.id || cls.serviceId}`}
                                                            className="btn btn-sm btn-light-primary"
                                                        >
                                                            Detail
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-5 border rounded-3 bg-light">
                    <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white border mb-3 mx-auto"
                        style={{ width: 64, height: 64 }}
                    >
                        <i className="fas fa-graduation-cap text-primary" style={{ fontSize: '1.5rem' }} aria-hidden />
                    </div>
                    <h6 className="fw-bold mb-2">Belum Ada Kelas</h6>
                    <p className="text-muted small mb-3">Anda belum terdaftar di kelas manapun</p>
                    <Link href="/services" className="btn btn-primary btn-sm">
                        <i className="fas fa-compass me-1" aria-hidden />
                        Jelajahi kelas
                    </Link>
                </div>
            )}
        </div>
    )

    const inner = omitTabPane ? eduvaltInner : crmInner

    if (omitTabPane) {
        return inner
    }

    return (
        <div className="tab-pane fade show active p-4" id="overviewTab" role="tabpanel">
            {inner}
        </div>
    )
}

export default TabOverviewContent
