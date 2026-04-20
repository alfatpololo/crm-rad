import React from 'react'
import { getServices } from '@/actions/masterData'
import { serializeForClient } from '@/utils/serialization'
import EduvaltHomePage from '@/components/landing/EduvaltHomePage'
import EduvaltPublicStylesLinks from '@/components/landing/EduvaltPublicStylesLinks'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Beranda | PT. RAD Indonesia',
  description:
    'LMS PT. RAD Indonesia — program pelatihan & sertifikasi (CMA, CBV, dan lainnya). Informasi resmi gelombang dan silabus mengacu pada radindonesia.com.',
}

export default async function HomePage() {
  const services = await getServices()
  const safeServices = serializeForClient(services || [])
  return (
    <>
      <EduvaltPublicStylesLinks />
      <EduvaltHomePage services={safeServices} />
    </>
  )
}
