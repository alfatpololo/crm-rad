'use client'

import React from 'react'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import { radPageTitle } from '@/lib/radLandingContent'
import Layout from '@/eduvalt/components/layout/Layout'
import EduvaltCourseDetails from './EduvaltCourseDetails'

export default function EduvaltCourseDetailsShell({ service, nowIso }) {
  const title = radPageTitle(service?.name || 'Detail kelas')
  return (
    <Layout headerStyle={1} footerStyle={1} headerTransparent={false} headTitle={title}>
      <div className="container py-3">
        <Link href="/services" className="btn btn-light btn-sm">
          <FiArrowLeft size={16} className="me-2" />
          Kembali ke daftar kelas
        </Link>
      </div>
      <EduvaltCourseDetails service={service} nowIso={nowIso} />
    </Layout>
  )
}
