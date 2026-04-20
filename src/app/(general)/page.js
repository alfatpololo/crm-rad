import React from 'react'
import { getServices } from '@/actions/masterData'
import { serializeForClient } from '@/utils/serialization'
import EduvaltHomePage from '@/components/landing/EduvaltHomePage'
import EduvaltPublicStylesLinks from '@/components/landing/EduvaltPublicStylesLinks'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Home One - PT. RAD Indonesia',
  description: 'Eduvalt Home One style landing page for CRM RAD.',
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
