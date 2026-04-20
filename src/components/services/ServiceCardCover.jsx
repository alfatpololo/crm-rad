'use client'

import Image from 'next/image'
import { FiBook } from 'react-icons/fi'

/**
 * Cover kartu kelas: pakai imageUrl jika ada; jika tidak, placeholder konsisten.
 */
export default function ServiceCardCover({
    imageUrl,
    alt = '',
    height = 200,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}) {
    const h = typeof height === 'number' ? `${height}px` : height
    const hasImage = Boolean(imageUrl && String(imageUrl).trim())

    if (hasImage) {
        return (
            <div
                className="position-relative bg-light border-bottom"
                style={{ width: '100%', height: h, overflow: 'hidden' }}
            >
                <Image
                    src={imageUrl}
                    alt={alt || 'Gambar kelas'}
                    fill
                    className="object-cover"
                    sizes={sizes}
                />
            </div>
        )
    }

    const iconSize = typeof height === 'number' ? Math.min(56, Math.round(height * 0.28) || 48) : 48

    return (
        <div
            className="d-flex align-items-center justify-content-center border-bottom text-secondary user-select-none"
            style={{
                width: '100%',
                height: h,
                background: 'linear-gradient(145deg, #eef1f5 0%, #e2e6ea 45%, #dce1e6 100%)',
            }}
            role="img"
            aria-label={alt ? `Belum ada gambar: ${alt}` : 'Belum ada gambar kelas'}
        >
            <FiBook size={iconSize} strokeWidth={1.15} aria-hidden className="opacity-50" />
        </div>
    )
}
