'use client'
import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthProvider'

export default function LandingHeader() {
    const { user, role } = useAuth()

    return (
        <header className="border-bottom bg-white shadow-sm sticky-top">
            <div className="container">
                <div className="d-flex align-items-center justify-content-between py-3">
                    <Link href="/" className="text-decoration-none fw-bold fs-5 text-dark">
                        PT. RAD Indonesia
                    </Link>
                    <nav className="d-flex align-items-center gap-3">
                        {user ? (
                            <>
                                <Link href="/dashboard" className="btn btn-outline-primary btn-sm">
                                    Dashboard
                                </Link>
                                <Link href="/profile" className="btn btn-outline-secondary btn-sm">
                                    Profil
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/authentication/login/cover" className="btn btn-outline-primary btn-sm">
                                    Login
                                </Link>
                                <Link href="/authentication/register/cover" className="btn btn-primary btn-sm">
                                    Daftar
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    )
}
