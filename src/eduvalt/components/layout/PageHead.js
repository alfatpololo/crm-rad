'use client'

import { useEffect } from 'react'
import { RAD_BRAND_TITLE } from '@/lib/radLandingContent'

/** Fallback bila route tidak mengirim `headTitle` ke Layout. */
const DEFAULT_TITLE = `${RAD_BRAND_TITLE} — LMS`

/**
 * Di App Router, hindari next/head — set judul dokumen di client.
 */
export default function PageHead({ headTitle }) {
    useEffect(() => {
        document.title = headTitle ? headTitle : DEFAULT_TITLE
    }, [headTitle])

    return null
}
