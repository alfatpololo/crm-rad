'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthProvider'
import { FiHome, FiBook, FiAward, FiUser } from 'react-icons/fi'

const PARTICIPANT_NAV_ITEMS = [
  { path: '/', label: 'Beranda', icon: FiHome },
  { path: '/services', label: 'Kelas', icon: FiBook },
  { path: '/certificates', label: 'Sertifikat', icon: FiAward },
  { path: '/profile', label: 'Profil', icon: FiUser },
]

const BottomNav = () => {
  const pathname = usePathname()
  const { role } = useAuth()

  if (role !== 'participant') return null

  return (
    <nav className="bottom-nav" aria-label="Navigasi cepat">
      <div className="bottom-nav-inner">
        {PARTICIPANT_NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const isActive = pathname === path || (path !== '/' && pathname.startsWith(path))
          return (
            <Link
              key={path}
              href={path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="bottom-nav-icon">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </span>
              <span className="bottom-nav-label">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
