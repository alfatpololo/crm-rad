'use client'

import Link from 'next/link'
import React, { useCallback, useMemo, useState } from 'react'
function normalizeCategory(cat) {
  return String(cat || '').toLowerCase().trim()
}

function mapCategoryToFilterKey(category) {
  const c = normalizeCategory(category)
  if (c.includes('design') || c.includes('ui') || c.includes('ux')) return 'cat-one'
  if (c.includes('marketing') || c.includes('promo') || c.includes('sales')) return 'cat-two'
  return 'cat-three'
}

function mapCategoryLabel(category) {
  const c = normalizeCategory(category)
  if (!c) return 'Development'
  if (c.includes('design') || c.includes('ui') || c.includes('ux')) return 'Design'
  if (c.includes('marketing') || c.includes('promo') || c.includes('sales')) return 'Marketing'
  return 'Development'
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

  const activeBtn = (value) => (value === filterKey ? 'active' : '')

  return (
    <section className="courses-area section-pt-120 section-pb-90">
      <div className="container">
        <div className="section__title-wrap">
          <div className="row align-items-end">
            <div className="col-lg-6">
              <div className="section__title text-center text-lg-start">
                <span className="sub-title">RAD Programs</span>
                <h2 className="title tg-svg">
                  Our <span className="position-relative">Featured</span> Courses
                </h2>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="courses__nav-active">
                <button className={activeBtn('*')} onClick={handleFilterKeyChange('*')}>
                  All Courses <span>New</span>
                </button>
                <button className={activeBtn('cat-one')} onClick={handleFilterKeyChange('cat-one')}>
                  Design
                </button>
                <button className={activeBtn('cat-two')} onClick={handleFilterKeyChange('cat-two')}>
                  Marketing
                </button>
                <button className={activeBtn('cat-three')} onClick={handleFilterKeyChange('cat-three')}>
                  Development
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row courses-active row-cols-1 row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-sm-1">
          {filtered.slice(0, 12).map((service) => {
            const categoryLabel = service.__categoryLabel
            const tagStyle =
              categoryLabel === 'Marketing'
                ? { backgroundColor: '#BC18E4' }
                : categoryLabel === 'Design'
                  ? { backgroundColor: '#04BC53' }
                  : { backgroundColor: '#FF109F' }

            return (
              <div className={`col grid-item ${service.__catcls}`} key={service.id}>
                <div className="courses__item shine__animate-item">
                  <div className="courses__item-thumb">
                    <Link href="#" className="courses__item-tag" style={tagStyle}>
                      {categoryLabel}
                    </Link>
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
                        <i className="flaticon-file" /> 05 Lessons
                      </li>
                      <li>
                        <i className="flaticon-timer" /> 12h 30m
                      </li>
                      <li>
                        <i className="flaticon-user-1" /> Students
                      </li>
                    </ul>
                    <h5 className="title">
                      <Link href={`/services/view/${service.id}`}>{service.name || 'Untitled program'}</Link>
                    </h5>
                    <div className="courses__item-rating">
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <span className="rating-count">(06)</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="courses__shapes">
        <div className="courses__shapes-item alltuchtopdown">
          <img src="/assets/img/courses/course_shape01.png" alt="shape" />
        </div>
        <div className="courses__shapes-item alltuchtopdown">
          <img src="/assets/img/courses/course_shape02.png" alt="shape" />
        </div>
      </div>
    </section>
  )
}

