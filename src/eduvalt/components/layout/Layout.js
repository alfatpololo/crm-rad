'use client'

import { useEffect, useState } from "react"
import BackToTop from '../elements/BackToTop'
import DataBg from "../elements/DataBg"
import Breadcrumb from './Breadcrumb'
import PageHead from './PageHead'
import Footer1 from './footer/Footer1'
import Header1 from "./header/Header1"
import Header2 from './header/Header2'
import Header3 from "./header/Header3"

export default function Layout({
    headerStyle,
    footerStyle,
    headTitle,
    breadcrumbTitle,
    children,
    /** false = bar atas putih (untuk halaman dengan hero gelap di bawah navbar, mis. detail kelas) */
    headerTransparent = true,
}) {
    const [scroll, setScroll] = useState(false)
    // Moblile Menu
    const [isMobileMenu, setMobileMenu] = useState(false)
    const handleMobileMenu = () => {
        setMobileMenu(!isMobileMenu)
        !isMobileMenu ? document.body.classList.add("mobile-menu-visible") : document.body.classList.remove("mobile-menu-visible")
    }

    /** Sticky + fixed (sticky-menu) pada Header1 solid mengosongkan flow dan menimpa hero/breadcrumb di bawahnya. */
    const header1StickyScroll = (!headerStyle || headerStyle === 1) && headerTransparent

    useEffect(() => {
        if (!header1StickyScroll) {
            setScroll(false)
            return undefined
        }
        const onScroll = () => {
            setScroll((prev) => {
                const next = window.scrollY > 100
                return prev === next ? prev : next
            })
        }
        document.addEventListener("scroll", onScroll, { passive: true })
        onScroll()
        return () => document.removeEventListener("scroll", onScroll)
    }, [header1StickyScroll])

    return (
        <>
            <PageHead headTitle={headTitle} />

            {!headerStyle && (
                <Header1
                    scroll={scroll}
                    isMobileMenu={isMobileMenu}
                    handleMobileMenu={handleMobileMenu}
                    transparent={headerTransparent}
                />
            )}
            {headerStyle == 1 ? (
                <Header1
                    scroll={scroll}
                    isMobileMenu={isMobileMenu}
                    handleMobileMenu={handleMobileMenu}
                    transparent={headerTransparent}
                />
            ) : null}
            {headerStyle == 2 ? <Header2 scroll={scroll} isMobileMenu={isMobileMenu} handleMobileMenu={handleMobileMenu} /> : null}
            {headerStyle == 3 ? <Header3 scroll={scroll} isMobileMenu={isMobileMenu} handleMobileMenu={handleMobileMenu} /> : null}

            <main className="main-area fix">
                {breadcrumbTitle && <Breadcrumb breadcrumbTitle={breadcrumbTitle} />}

                {children}
            </main>

            {!footerStyle && < Footer1 />}
            {footerStyle == 1 ? < Footer1 /> : null}

            <BackToTop />
            <DataBg />
        </>
    )
}
