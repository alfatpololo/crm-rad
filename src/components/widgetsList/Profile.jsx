'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
// import { BsPatchCheckFill } from 'react-icons/bs'
// import { FiEdit, FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import { useAuth } from '@/context/AuthProvider'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

const Profile = () => {
    const { user } = useAuth()
    const [profileData, setProfileData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            try {
                // Try to get from users collection first
                let userDoc = await getDoc(doc(db, 'users', user.uid))
                
                // If not found, try participants collection
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
                } else {
                    // Use basic auth data
                    setProfileData({
                        displayName: user.displayName || user.email?.split('@')[0] || 'User',
                        email: user.email,
                        photoURL: user.photoURL || '/images/avatar/1.png',
                        phoneNumber: user.phoneNumber || null,
                        location: null,
                        emailVerified: user.emailVerified || false,
                    })
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
                // Fallback to basic auth data
                setProfileData({
                    displayName: user.displayName || user.email?.split('@')[0] || 'User',
                    email: user.email,
                    photoURL: user.photoURL || '/images/avatar/1.png',
                    phoneNumber: user.phoneNumber || null,
                    location: null,
                    emailVerified: user.emailVerified || false,
                })
            } finally {
                setLoading(false)
            }
        }

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

    return (
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
                    <a href="#" className="btn btn-primary">
                        <span className="me-2">✏️</span>
                        <span>Edit Profile</span>
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Profile