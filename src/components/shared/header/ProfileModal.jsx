'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { Fragment, useEffect, useState } from 'react'
import { FiActivity, FiBell, FiChevronRight, FiDollarSign, FiLogOut, FiSettings, FiUser } from "react-icons/fi"
import { useAuth } from '@/context/AuthProvider'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

const activePosition = ["Active", "Always", "Bussy", "Inactive", "Disabled", "Cutomization"]
const subscriptionsList = ["Plan", "Billings", "Referrals", "Payments", "Statements", "Subscriptions"]
const ProfileModal = () => {
    const { user, signOut } = useAuth()
    const router = useRouter()
    const [profileData, setProfileData] = useState(null)

    const handleLogout = async (e) => {
        e.preventDefault()
        try {
            await signOut()
            // Redirect to login page
            router.push('/authentication/login/minimal')
        } catch (error) {
            console.error('Logout error:', error)
            // Force redirect even if there's an error
            router.push('/authentication/login/minimal')
        }
    }

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user) return

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
                    })
                } else {
                    setProfileData({
                        displayName: user.displayName || user.email?.split('@')[0] || 'User',
                        email: user.email,
                        photoURL: user.photoURL || '/images/avatar/1.png',
                    })
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
                setProfileData({
                    displayName: user.displayName || user.email?.split('@')[0] || 'User',
                    email: user.email,
                    photoURL: user.photoURL || '/images/avatar/1.png',
                })
            }
        }

        fetchProfileData()
    }, [user])

    if (!user) {
        return null
    }

    const avatarSrc = profileData?.photoURL || '/images/avatar/1.png'
    const displayName = profileData?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User'
    const email = profileData?.email || user?.email || ''

    return (
        <div className="dropdown nxl-h-item">
            <a href="#" data-bs-toggle="dropdown" role="button" data-bs-auto-close="outside">
                <Image width={40} height={40} src={avatarSrc} alt="user-image" className="img-fluid user-avtar me-0 rounded-circle" />
            </a>
            <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-user-dropdown">
                <div className="dropdown-header">
                    <div className="d-flex align-items-center">
                        <Image width={40} height={40} src={avatarSrc} alt="user-image" className="img-fluid user-avtar rounded-circle" />
                        <div>
                            <h6 className="text-dark mb-0">{displayName} {user?.emailVerified && <span className="badge bg-soft-success text-success ms-1">VERIFIED</span>}</h6>
                            <span className="fs-12 fw-medium text-muted">{email}</span>
                        </div>
                    </div>
                </div>
                <div className="dropdown-divider"></div>
                <Link href="/profile" className="dropdown-item">
                    <i><FiUser /></i>
                    <span>Akun Saya</span>
                </Link>
                <div className="dropdown-divider"></div>
                <a href="#" onClick={handleLogout} className="dropdown-item">
                    <i><FiLogOut /></i>
                    <span>Logout</span>
                </a>
            </div>
        </div>
    )
}

export default ProfileModal

const getColor = (item) => {
    switch (item) {
        case "Always":
            return "always_clr"
        case "Bussy":
            return "bussy_clr"
        case "Inactive":
            return "inactive_clr"
        case "Disabled":
            return "disabled_clr"
        case "Cutomization":
            return "cutomization_clr"
        default:
            return "active-clr";
    }
}