'use client'
import React, { useContext, useEffect } from 'react'
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import PerfectScrollbar from "react-perfect-scrollbar";
import Menus from './Menus';
import { NavigationContext } from '@/contentApi/navigationProvider';

const NavigationManu = () => {
    const { navigationOpen, setNavigationOpen } = useContext(NavigationContext)
    const pathName = usePathname()
    useEffect(() => {
        setNavigationOpen(false)
    }, [pathName])
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
                    </PerfectScrollbar>
                </div>
            </div>
            <div onClick={() => setNavigationOpen(false)} className={`${navigationOpen ? "nxl-menu-overlay" : ""}`}></div>
        </nav>
    )
}

export default NavigationManu