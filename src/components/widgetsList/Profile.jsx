'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { updateParticipantProfile } from '@/actions/profile'

/**
 * @param {{ variant?: 'crm' | 'eduvalt' }} props
 */
const Profile = ({ variant = 'crm' }) => {
    const { user } = useAuth()
    const [profileData, setProfileData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState(null)
    const [form, setForm] = useState({ name: '', phone: '', location: '' })

    const fetchProfileData = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            try {
                let userDoc = await getDoc(doc(db, 'users', user.uid))
                if (!userDoc.exists()) {
                    userDoc = await getDoc(doc(db, 'participants', user.uid))
                }

                if (userDoc.exists()) {
                    const data = userDoc.data()
                    setProfileData({
                        displayName: data.name || data.displayName || user.displayName || user.email?.split('@')[0] || 'User',
                        email: data.email || user.email,
                        photoURL: data.photoURL || data.avatar || user.photoURL || '/images/avatar/1.png',
                        phoneNumber: data.phoneNumber || data.phone || user.phoneNumber || null,
                        location: data.location || data.address || null,
                        emailVerified: user.emailVerified || false,
                    })
                    setForm({
                        name: data.name || data.displayName || user.displayName || user.email?.split('@')[0] || '',
                        phone: data.phone || data.phoneNumber || user.phoneNumber || '',
                        location: data.location || data.address || '',
                    })
                } else {
                    setProfileData({
                        displayName: user.displayName || user.email?.split('@')[0] || 'User',
                        email: user.email,
                        photoURL: user.photoURL || '/images/avatar/1.png',
                        phoneNumber: user.phoneNumber || null,
                        location: null,
                        emailVerified: user.emailVerified || false,
                    })
                    setForm({
                        name: user.displayName || user.email?.split('@')[0] || '',
                        phone: user.phoneNumber || '',
                        location: '',
                    })
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
                setProfileData({
                    displayName: user.displayName || user.email?.split('@')[0] || 'User',
                    email: user.email,
                    photoURL: user.photoURL || '/images/avatar/1.png',
                    phoneNumber: user.phoneNumber || null,
                    location: null,
                    emailVerified: user.emailVerified || false,
                })
                setForm({ name: user.displayName || user.email?.split('@')[0] || '', phone: user.phoneNumber || '', location: '' })
            } finally {
                setLoading(false)
            }
        }

    useEffect(() => {
        fetchProfileData()
    }, [user])

    if (loading || !profileData) {
        if (variant === 'eduvalt') {
            return (
                <div className="event-widget">
                    <div className="thumb d-flex align-items-center justify-content-center bg-light" style={{ minHeight: 220 }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const avatarSrc = profileData.photoURL || '/images/avatar/1.png'
    const displayName = profileData.displayName || 'User'
    const email = profileData.email || ''
    const phone = profileData.phoneNumber || 'Not set'
    const location = profileData.location || 'Not set'

    const startEdit = () => {
        setEditing(true)
        setForm({
            name: profileData.displayName || '',
            phone: profileData.phoneNumber || '',
            location: profileData.location || '',
        })
        setMessage(null)
    }

    const eduvaltProfileCard = (
        <div className="event-widget">
            <div className="thumb">
                <Image
                    width={400}
                    height={280}
                    sizes="(max-width: 768px) 100vw, 400px"
                    src={avatarSrc}
                    alt={displayName}
                    className="img-fluid"
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                />
            </div>
            <div className="event-cost-wrap">
                <h4 className="price text-center mb-0">
                    <strong className="d-block">{displayName}</strong>
                    <span className="d-block small fw-normal text-muted mt-2">{email}</span>
                </h4>
                {profileData.emailVerified && (
                    <p className="text-center small text-success mb-3 mb-lg-4">Email terverifikasi</p>
                )}
                <button type="button" className="btn w-100" onClick={startEdit}>
                    Ubah profil
                </button>
                <div className="event-information-wrap">
                    <h6 className="title">Informasi</h6>
                    <ul className="list-wrap">
                        <li>
                            <i className="flaticon-user-1" /> Email <span>{email}</span>
                        </li>
                        {phone && phone !== 'Not set' && (
                            <li>
                                <i className="flaticon-phone-call" /> Telepon <span>{phone}</span>
                            </li>
                        )}
                        {location && location !== 'Not set' && (
                            <li>
                                <i className="flaticon-pin" /> Lokasi <span>{location}</span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    )

    const crmProfileCard = (
        <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
                <div className="text-center mb-4">
                    <div className="position-relative d-inline-block mb-3">
                        <div className="avatar-image wd-150 ht-150 border border-4 border-primary rounded-circle position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <Image width={140} height={140} sizes='100vw' src={avatarSrc} alt={displayName} className="img-fluid rounded-circle" />
                        </div>
                        {profileData.emailVerified && (
                            <div className="position-absolute bottom-0 end-0 bg-white rounded-circle p-1 border border-2 border-white shadow-sm d-flex align-items-center justify-content-center">
                                <i className="fas fa-check-circle text-success" style={{ fontSize: '16px' }} aria-hidden />
                            </div>
                        )}
                    </div>
                    <div className="mb-3">
                        <h5 className="fw-bold mb-1">{displayName}</h5>
                        <p className="text-muted mb-2 small">{email}</p>
                        {profileData.emailVerified && (
                            <span className="badge bg-soft-primary text-primary px-3 py-2">Verified</span>
                        )}
                    </div>
                </div>
                
                <div className="border-top pt-3 mb-3">
                    {location && location !== 'Not set' && (
                        <div className="d-flex align-items-center mb-3 p-2 rounded-2 hover-bg-light">
                            <div className="bg-soft-primary p-2 rounded-circle me-3 d-flex align-items-center justify-content-center text-primary">
                                <i className="fas fa-map-marker-alt" style={{ fontSize: '14px' }} aria-hidden />
                            </div>
                            <div className="flex-grow-1">
                                <p className="small text-muted mb-0">Location</p>
                                <p className="mb-0 fw-medium small">{location}</p>
                            </div>
                        </div>
                    )}
                    {phone && phone !== 'Not set' && (
                        <div className="d-flex align-items-center mb-3 p-2 rounded-2 hover-bg-light">
                            <div className="bg-soft-success p-2 rounded-circle me-3 d-flex align-items-center justify-content-center text-success">
                                <i className="fas fa-phone" style={{ fontSize: '14px' }} aria-hidden />
                            </div>
                            <div className="flex-grow-1">
                                <p className="small text-muted mb-0">Phone</p>
                                <p className="mb-0 fw-medium small">{phone}</p>
                            </div>
                        </div>
                    )}
                    <div className="d-flex align-items-center p-2 rounded-2 hover-bg-light">
                        <div className="bg-soft-info p-2 rounded-circle me-3 d-flex align-items-center justify-content-center text-info">
                            <i className="fas fa-envelope" style={{ fontSize: '14px' }} aria-hidden />
                        </div>
                        <div className="flex-grow-1">
                            <p className="small text-muted mb-0">Email</p>
                            <p className="mb-0 fw-medium small">{email}</p>
                        </div>
                    </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                    <button type="button" className="btn btn-primary" onClick={startEdit}>
                        <i className="fas fa-pen me-2" aria-hidden />
                        <span>Edit Profile</span>
                    </button>
                </div>
            </div>
        </div>
    )

    const profileCard = variant === 'eduvalt' ? eduvaltProfileCard : crmProfileCard

    if (editing) {
        const handleSubmit = async (e) => {
            e.preventDefault()
            setSaving(true)
            setMessage(null)
            const res = await updateParticipantProfile({
                name: form.name,
                displayName: form.name,
                phone: form.phone,
                phoneNumber: form.phone,
                address: form.location,
                location: form.location,
            })
            setSaving(false)
            if (res?.success) {
                setMessage({ type: 'success', text: res.message || 'Profil berhasil diperbarui.' })
                setEditing(false)
                fetchProfileData()
            } else {
                setMessage({ type: 'danger', text: res?.error || 'Gagal memperbarui profil.' })
            }
        }
        const formInner = (
            <>
                {message && (
                    <div className={`alert alert-${message.type} py-2 mb-3`} role="alert">
                        {message.text}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Nama</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Nama lengkap"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">No. Telepon</label>
                        <input
                            type="tel"
                            className="form-control"
                            value={form.phone}
                            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                            placeholder="08xxxxxxxxxx"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Alamat / Lokasi</label>
                        <input
                            type="text"
                            className="form-control"
                            value={form.location}
                            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                            placeholder="Alamat atau kota"
                        />
                    </div>
                    <p className="small text-muted mb-3">Email tidak dapat diubah (mengikuti akun login).</p>
                    <div className="d-flex flex-wrap gap-2">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setEditing(false)
                                setMessage(null)
                            }}
                            disabled={saving}
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </>
        )

        if (variant === 'eduvalt') {
            return (
                <div className="event-widget">
                    <div className="event-cost-wrap pt-4 px-3 pb-4">
                        <h4 className="price mb-4">
                            <strong>Edit profil</strong>
                        </h4>
                        {formInner}
                    </div>
                </div>
            )
        }

        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-4">Edit Profil</h5>
                    {formInner}
                </div>
            </div>
        )
    }

    return profileCard
}

export default Profile