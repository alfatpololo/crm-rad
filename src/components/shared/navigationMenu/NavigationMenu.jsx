'use client'

import React, { useContext, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { FiLogOut } from 'react-icons/fi'
import Menus from './Menus'
import { RAD_LOGO_ALT, RAD_LOGO_SRC } from '@/lib/brandLogo'
import { NavigationContext } from '@/contentApi/navigationProvider'
import { useAuth } from '@/context/AuthProvider'

export default function NavigationMenu() {
    const { navigationOpen, setNavigationOpen } = useContext(NavigationContext)
    const { signOut } = useAuth()
    const router = useRouter()
    const pathName = usePathname()

    useEffect(() => {
        setNavigationOpen(false)
    }, [pathName, setNavigationOpen])

    const handleLogout = async (e) => {
        e.preventDefault()
        try {
            await signOut()
            router.push('/authentication/login/minimal')
        } catch (error) {
            console.error('Logout error:', error)
            router.push('/authentication/login/minimal')
        }
    }

    return (
        <nav className={`nxl-navigation ${navigationOpen ? 'mob-navigation-active' : ''}`}>
            <div className="navbar-wrapper">
                <div className="m-header">
                    <Link href="/" className="b-brand d-flex align-items-center text-decoration-none">
                        <img
                            src={RAD_LOGO_SRC}
                            alt={RAD_LOGO_ALT}
                            className="logo logo-lg"
                            style={{ maxHeight: '40px', width: 'auto' }}
                        />
                        <img
                            src={RAD_LOGO_SRC}
                            alt={RAD_LOGO_ALT}
                            className="logo logo-sm"
                            style={{ maxHeight: '30px', width: 'auto' }}
                        />
                    </Link>
                </div>

                <div className="navbar-content">
                    <PerfectScrollbar>
                        <ul className="nxl-navbar">
                            <li className="nxl-item nxl-caption">
                                <label>Navigation</label>
                            </li>
                            <Menus />
                        </ul>

                        <div
                            className="nxl-sidebar-logout"
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '15px 20px',
                                borderTop: '1px solid rgba(15, 23, 42, 0.08)',
                                background: 'inherit',
                            }}
                        >
                            <a
                                href="#"
                                onClick={handleLogout}
                                className="btn btn-light-brand w-100 d-flex align-items-center justify-content-center gap-2"
                                style={{ padding: '10px' }}
                            >
                                <FiLogOut size={16} />
                                <span>Logout</span>
                            </a>
                        </div>
                    </PerfectScrollbar>
                </div>
            </div>
            {navigationOpen ? (
                <div
                    role="presentation"
                    className="nxl-menu-overlay"
                    onClick={() => setNavigationOpen(false)}
                />
            ) : null}
        </nav>
    )
}
