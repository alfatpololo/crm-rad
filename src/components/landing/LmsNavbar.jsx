'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'
import { RAD_LOGO_ALT, RAD_LOGO_SRC } from '@/lib/brandLogo'

function navLinkClass(pathname, href) {
  const isHome = href === '/'
  const active = isHome
    ? pathname === '/'
    : pathname === href || pathname.startsWith(`${href}/`)
  return `text-decoration-none small text-nowrap ${active ? 'fw-bold text-primary' : 'text-dark'}`
}

export default function LmsNavbar() {
  const { user } = useAuth()
  const pathname = usePathname()

  return (
    <header
      className="border-bottom bg-white shadow-sm sticky-top"
      style={{ zIndex: 1030 }}
    >
      <nav className="container py-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <Link href="/" className="b-brand d-flex align-items-center text-decoration-none">
            <img
              src={RAD_LOGO_SRC}
              alt={RAD_LOGO_ALT}
              className="logo logo-lg"
              style={{ maxHeight: '40px', width: 'auto' }}
            />
          </Link>
          <div className="d-flex align-items-center flex-wrap gap-2 gap-md-3">
            <Link href="/" className={navLinkClass(pathname, '/')}>
              Beranda
            </Link>
            <Link href="/services" className={navLinkClass(pathname, '/services')}>
              Kelas
            </Link>
            <Link href="/products" className={navLinkClass(pathname, '/products')}>
              Produk
            </Link>
          </div>
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <a href="/dashboard" className="btn btn-primary btn-sm">
                  Dashboard
                </a>
                <Link href="/profile" className="btn btn-outline-secondary btn-sm d-none d-sm-inline-block">
                  Profil
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/authentication/login/minimal"
                  className="btn btn-outline-primary btn-sm"
                >
                  Login
                </Link>
                <Link
                  href="/authentication/register/minimal"
                  className="btn btn-primary btn-sm"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
