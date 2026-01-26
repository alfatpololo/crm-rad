'use client'
import React from 'react'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import ProfileContent from '@/components/profile/ProfileContent'
import AdminProfileContent from '@/components/profile/AdminProfileContent'
import { useAuth } from '@/context/AuthProvider'

const page = () => {
  const { role, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center gap-2 page-header-right-items-wrapper">
          {/* Header actions can be added here if needed */}
        </div>
      </PageHeader>
      <div className='main-content'>
        <div className='row'>
          {role === 'admin' ? <AdminProfileContent /> : <ProfileContent />}
        </div>
      </div>
    </>
  )
}

export default page

