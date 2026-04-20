'use client'

import Link from 'next/link'
import React, { useCallback, useMemo, useState } from 'react'
import { RAD_SITE_URL } from '@/lib/radLandingContent'

function normalizeCategory(cat) {
    return String(cat || '').toLowerCase().trim()
}

/** Filter ke 3 bucket selaras program RAD / CRM kategori. */
function mapCategoryToFilterKey(category) {
    const c = normalizeCategory(category)
    if (c.includes('cma') || c.includes('manajemen') || c.includes('management') || c.includes('akuntansi') || c.includes('accounting')) {
        return 'cat-one'
    }
    if (
        c.includes('cbv') ||
        c.includes('ciba') ||
        c.includes('capf') ||
        c.includes('capm') ||
        c.includes('cera') ||
        c.includes('cps') ||
        c.includes('cdms') ||
        c.includes('cesa') ||
        c.includes('bisnis') ||
        c.includes('business') ||
        c.includes('valuasi') ||
        c.includes('project') ||
        c.includes('risk') ||
        c.includes('marketing')
    ) {
        return 'cat-two'
    }
    return 'cat-three'
}

function mapCategoryLabel(category) {
    const c = normalizeCategory(category)
    if (c.includes('cma') || c.includes('manajemen') || c.includes('management') || c.includes('akuntansi') || c.includes('accounting')) {
        return 'CMA & manajemen'
    }
    if (
        c.includes('cbv') ||
        c.includes('ciba') ||
        c.includes('capf') ||
        c.includes('capm') ||
        c.includes('cera') ||
        c.includes('cps') ||
        c.includes('cdms') ||
        c.includes('cesa') ||
        c.includes('bisnis') ||
        c.includes('business') ||
        c.includes('valuasi') ||
        c.includes('project') ||
        c.includes('risk') ||
        c.includes('marketing')
    ) {
        return 'Bisnis & valuasi'
    }
    return 'Program lain'
}

export default function RadCoursesSection({ services = [] }) {
    const [filterKey, setFilterKey] = useState('*')

    const normalized = useMemo(() => {
        return (services || []).map((service) => ({
            ...service,
            __catcls: mapCategoryToFilterKey(service.category),
            __categoryLabel: mapCategoryLabel(service.category),
        }))
    }, [services])

    const filtered = useMemo(() => {
        if (filterKey === '*') return normalized
        return normalized.filter((s) => s.__catcls === filterKey)
    }, [filterKey, normalized])

    const handleFilterKeyChange = useCallback(
        (key) => () => {
            setFilterKey(key)
        },
        []
    )

    /** Filter katalog: Bootstrap (bukan courses__nav-active Eduvalt) supaya konsisten dengan UI CRM. */
    const filterBtnClass = (value) =>
        value === filterKey ? 'btn btn-sm px-3 btn-primary' : 'btn btn-sm px-3 btn-outline-secondary'

    return (
        <section className="courses-area section-pt-120 section-pb-90">
            <div className="container">
                <div className="section__title-wrap">
                    <div className="row align-items-end">
                        <div className="col-lg-6">
                            <div className="section__title text-center text-lg-start">
                                <span className="sub-title">Katalog LMS</span>
                                <h2 className="title tg-svg">
                                    Program <span className="position-relative">unggulan</span> &amp; kelas
                                </h2>
                                <p className="small text-muted mt-2 mb-0">
                                    Daftar kelas yang dijual melalui LMS ini. Informasi gelombang resmi, silabus, dan
                                    jadwal tatap muka tetap mengacu pada{' '}
                                    <a href={RAD_SITE_URL} target="_blank" rel="noopener noreferrer">
                                        radindonesia.com
                                    </a>
                                    .
                                </p>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div
                                className="d-flex flex-wrap justify-content-center justify-content-lg-end align-items-center gap-2"
                                role="tablist"
                                aria-label="Filter program"
                            >
                                <button
                                    className={filterBtnClass('*')}
                                    type="button"
                                    role="tab"
                                    aria-selected={filterKey === '*'}
                                    onClick={handleFilterKeyChange('*')}
                                >
                                    Semua
                                </button>
                                <button
                                    className={filterBtnClass('cat-one')}
                                    type="button"
                                    role="tab"
                                    aria-selected={filterKey === 'cat-one'}
                                    onClick={handleFilterKeyChange('cat-one')}
                                >
                                    CMA &amp; manajemen
                                </button>
                                <button
                                    className={filterBtnClass('cat-two')}
                                    type="button"
                                    role="tab"
                                    aria-selected={filterKey === 'cat-two'}
                                    onClick={handleFilterKeyChange('cat-two')}
                                >
                                    Bisnis &amp; valuasi
                                </button>
                                <button
                                    className={filterBtnClass('cat-three')}
                                    type="button"
                                    role="tab"
                                    aria-selected={filterKey === 'cat-three'}
                                    onClick={handleFilterKeyChange('cat-three')}
                                >
                                    Lainnya
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row courses-active row-cols-1 row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-sm-1">
                    {filtered.slice(0, 12).map((service) => {
                        const categoryLabel = service.__categoryLabel
                        const tagStyle =
                            categoryLabel === 'Bisnis & valuasi'
                                ? { backgroundColor: '#BC18E4' }
                                : categoryLabel === 'CMA & manajemen'
                                  ? { backgroundColor: '#04BC53' }
                                  : { backgroundColor: '#FF109F' }

                        return (
                            <div className={`col grid-item ${service.__catcls}`} key={service.id}>
                                <div className="courses__item shine__animate-item">
                                    <div className="courses__item-thumb">
                                        <span className="courses__item-tag" style={tagStyle}>
                                            {categoryLabel}
                                        </span>
                                        <Link href={`/services/view/${service.id}`} className="shine__animate-link">
                                            {service.imageUrl ? (
                                                <img
                                                    src={service.imageUrl}
                                                    alt={service.name || 'Program'}
                                                    style={{ width: '100%', height: 210, objectFit: 'cover' }}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div
                                                    aria-hidden="true"
                                                    style={{
                                                        width: '100%',
                                                        height: 210,
                                                        background:
                                                            'linear-gradient(135deg, rgba(220,53,69,0.12) 0%, rgba(15,23,42,0.04) 60%, rgba(220,53,69,0.08) 100%)',
                                                    }}
                                                />
                                            )}
                                        </Link>
                                    </div>
                                    <div className="courses__item-content">
                                        <ul className="courses__item-meta list-wrap">
                                            <li>
                                                <i className="flaticon-graduation-cap" /> Pelatihan bersertifikat
                                            </li>
                                            <li>
                                                <i className="flaticon-file" /> Detail &amp; harga di LMS
                                            </li>
                                        </ul>
                                        <h5 className="title">
                                            <Link href={`/services/view/${service.id}`}>{service.name || 'Program'}</Link>
                                        </h5>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {filtered.length === 0 && normalized.length > 0 && (
                    <div className="text-center py-5">
                        <p className="text-muted mb-3">Tidak ada program di filter ini.</p>
                        <button type="button" className="btn btn-sm btn-primary" onClick={handleFilterKeyChange('*')}>
                            Tampilkan semua
                        </button>
                    </div>
                )}

                {normalized.length === 0 && (
                    <div className="text-center py-5 px-3">
                        <p className="text-muted mb-3">
                            Belum ada kelas yang dipublikasikan di LMS. Untuk informasi program CMA dan gelombang
                            pelatihan, kunjungi situs resmi.
                        </p>
                        <Link href="/services" className="btn btn-primary me-2">
                            Buka halaman layanan
                        </Link>
                        <a href={RAD_SITE_URL} className="btn btn-border" target="_blank" rel="noopener noreferrer">
                            radindonesia.com
                        </a>
                    </div>
                )}
            </div>

            <div className="courses__shapes">
                <div className="courses__shapes-item alltuchtopdown">
                    <img src="/assets/img/courses/course_shape01.png" alt="" />
                </div>
                <div className="courses__shapes-item alltuchtopdown">
                    <img src="/assets/img/courses/course_shape02.png" alt="" />
                </div>
            </div>
        </section>
    )
}
