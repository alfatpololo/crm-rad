'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthProvider'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { updateParticipantProfile } from '@/actions/profile'

const Profile = () => {
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

    const profileCard = (
        <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
                <div className="text-center mb-4">
                    <div className="position-relative d-inline-block mb-3">
                        <div className="avatar-image wd-150 ht-150 border border-4 border-primary rounded-circle position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <Image width={140} height={140} sizes='100vw' src={avatarSrc} alt={displayName} className="img-fluid rounded-circle" />
                        </div>
                        {profileData.emailVerified && (
                            <div className="position-absolute bottom-0 end-0 bg-white rounded-circle p-1 border border-2 border-white shadow-sm">
                                <span style={{fontSize: '18px'}}>✅</span>
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
                            <div className="bg-soft-primary p-2 rounded-circle me-3">
                                <span style={{fontSize: '16px'}}>📍</span>
                            </div>
                            <div className="flex-grow-1">
                                <p className="small text-muted mb-0">Location</p>
                                <p className="mb-0 fw-medium small">{location}</p>
                            </div>
                        </div>
                    )}
                    {phone && phone !== 'Not set' && (
                        <div className="d-flex align-items-center mb-3 p-2 rounded-2 hover-bg-light">
                            <div className="bg-soft-success p-2 rounded-circle me-3">
                                <span style={{fontSize: '16px'}}>📞</span>
                            </div>
                            <div className="flex-grow-1">
                                <p className="small text-muted mb-0">Phone</p>
                                <p className="mb-0 fw-medium small">{phone}</p>
                            </div>
                        </div>
                    )}
                    <div className="d-flex align-items-center p-2 rounded-2 hover-bg-light">
                        <div className="bg-soft-info p-2 rounded-circle me-3">
                            <span style={{fontSize: '16px'}}>📧</span>
                        </div>
                        <div className="flex-grow-1">
                            <p className="small text-muted mb-0">Email</p>
                            <p className="mb-0 fw-medium small">{email}</p>
                        </div>
                    </div>
                </div>

                <div className="d-grid gap-2 mt-4">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                            setEditing(true)
                            setForm({
                                name: profileData.displayName || '',
                                phone: profileData.phoneNumber || '',
                                location: profileData.location || '',
                            })
                            setMessage(null)
                        }}
                    >
                        <span className="me-2">✏️</span>
                        <span>Edit Profile</span>
                    </button>
                </div>
            </div>
        </div>
    )

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
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-4">Edit Profil</h5>
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
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => { setEditing(false); setMessage(null); }}
                                disabled={saving}
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    return profileCard
}

export default Profile