'use client'

import React from 'react'
import Layout from '@/eduvalt/components/layout/Layout'
import Banner1 from '@/eduvalt/components/sections/Banner1'
import Blog1 from '@/eduvalt/components/sections/Blog1'
import Brand1 from '@/eduvalt/components/sections/Brand1'
import Categories1 from '@/eduvalt/components/sections/Categories1'
import Newsletter1 from '@/eduvalt/components/sections/Newsletter1'
import RadCoursesSection from '@/components/landing/RadCoursesSection'

export default function EduvaltHomePage({ services = [] }) {
  return (
    <Layout headerStyle={1} footerStyle={1}>
      <Banner1 />
      <Brand1 />
      <RadCoursesSection services={services} />
      <Categories1 />
      <Blog1 />
      <Newsletter1 />
    </Layout>
  )
}
