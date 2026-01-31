'use client'
import React, { useContext, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import PerfectScrollbar from "react-perfect-scrollbar";
import Menus from './Menus';
import { NavigationContext } from '@/contentApi/navigationProvider';
import { useAuth } from '@/context/AuthProvider';
import { FiLogOut } from 'react-icons/fi';

const NavigationManu = () => {
    const { navigationOpen, setNavigationOpen } = useContext(NavigationContext)
    const { signOut } = useAuth()
    const router = useRouter()
    const pathName = usePathname()

    useEffect(() => {
        setNavigationOpen(false)
    }, [pathName])

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
        <nav className={`nxl-navigation ${navigationOpen ? "mob-navigation-active" : ""}`}>
            <div className="navbar-wrapper">
                <div className="m-header">
                    <Link href="/" className="b-brand">
                        {/* <!-- ========   change your logo hear   ============ --> */}
                        <img src="/images/logo/logo-rad-e1768539218966.webp" alt="Logo" className="logo logo-lg" style={{ maxHeight: '40px', width: 'auto' }} />
                        <img src="/images/logo/logo-rad-e1768539218966.webp" alt="Logo" className="logo logo-sm" style={{ maxHeight: '30px', width: 'auto' }} />
                    </Link>
                </div>

                <div className={`navbar-content`}>
                    <PerfectScrollbar>
                        <ul className="nxl-navbar">
                            <li className="nxl-item nxl-caption">
                                <label>Navigation</label>
                            </li>
                            <Menus />
                        </ul>
                        
                        {/* Logout Button at Bottom */}
                        <div style={{ 
                            position: 'absolute', 
                            bottom: '0', 
                            left: '0', 
                            right: '0', 
                            padding: '15px 20px',
                            borderTop: '1px solid rgba(0,0,0,0.1)',
                            background: 'inherit'
                        }}>
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
            <div onClick={() => setNavigationOpen(false)} className={`${navigationOpen ? "nxl-menu-overlay" : ""}`}></div>
        </nav>
    )
}

export default NavigationManu