import React from 'react'
import { getServices } from '@/actions/masterData'
import { getProducts } from '@/actions/masterData'
import { serializeForClient } from '@/utils/serialization'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingContent from '@/components/landing/LandingContent'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'PT. RAD Indonesia - Kelas & Merchandise',
  description: 'Daftar kelas dan beli merchandise. Login diperlukan untuk checkout.',
}

export default async function LandingPage() {
  const [services, products] = await Promise.all([
    getServices(),
    getProducts(),
  ])
  const safeServices = serializeForClient(services || [])
  const safeProducts = serializeForClient(products || [])

  return (
    <>
      <LandingHeader />
      <LandingContent services={safeServices} products={safeProducts} />
    </>
  )
}
