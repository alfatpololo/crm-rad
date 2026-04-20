'use client'

import React from 'react'
import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'
import Layout from '@/eduvalt/components/layout/Layout'
import EduvaltCourseDetails from './EduvaltCourseDetails'

export default function EduvaltCourseDetailsShell({ service, nowIso }) {
  return (
    <Layout headerStyle={1} footerStyle={1} headerTransparent={false}>
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
