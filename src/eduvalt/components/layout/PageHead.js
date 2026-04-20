'use client'

import { useEffect } from 'react'

const DEFAULT_TITLE = 'Eduvalt - Online Courses & Education Nextjs Template'

/**
 * Di App Router, hindari next/head — set judul dokumen di client.
 */
export default function PageHead({ headTitle }) {
    useEffect(() => {
        document.title = headTitle ? headTitle : DEFAULT_TITLE
    }, [headTitle])

    return null
}
