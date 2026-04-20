import React from 'react'
import EduvaltCourseDetailsShell from '@/components/services/EduvaltCourseDetailsShell'
import { getService } from '@/actions/masterData'
import { notFound } from 'next/navigation'
import { serializeForClient } from '@/utils/serialization'

export const dynamic = 'force-dynamic'

const ServiceViewPage = async ({ params }) => {
    const { id } = params
    const service = await getService(id)

    if (!service) {
        notFound()
    }

    const safeService = serializeForClient(service)
    const nowIso = new Date().toISOString()

    return <EduvaltCourseDetailsShell service={safeService} nowIso={nowIso} />
}

export default ServiceViewPage



