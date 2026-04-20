'use client'

import VideoPopup from '@/eduvalt/components/elements/VidepPopup'
import { getApplicablePriceTier, getPromoDiscount } from '@/utils/servicePrice'
import Link from 'next/link'
import { useState } from 'react'

export default function EduvaltCourseDetails({ service, nowIso }) {
  const [activeIndex, setActiveIndex] = useState(1)
  const handleOnClick = (index) => {
    setActiveIndex(index)
  }

  const [isActive, setIsActive] = useState({
    status: false,
    key: '',
  })

  const handleToggle = (key) => {
    if (isActive.key == key) {
      setIsActive({
        status: false,
      })
    } else {
      setIsActive({
        status: true,
        key,
      })
    }
  }

  const category = service?.category || 'Program praktik'
  const title = service?.name || 'Kelas'
  const description = service?.description || ''
  const courseThumb = service?.imageUrl || '/assets/img/courses/course_thumb02.jpg'

  const tier = getApplicablePriceTier(service)
  const promoResult = getPromoDiscount(
    service,
    tier.price,
    '',
    nowIso ? new Date(nowIso) : new Date()
  )
  const displayPrice = tier.isFree ? 0 : promoResult.applied ? promoResult.finalPrice : tier.price
  const oldPrice = tier.isFree ? 0 : tier.price

  return (
    <>
      <section className="courses__breadcrumb-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="courses__breadcrumb-content">
                <Link href="#" className="category">
                  {category}
                </Link>
                <h3 className="title">{title}</h3>
                <p>{description || 'Design tutorial will help you learn quickly and thoroughly orem ipsum or lipsum.'}</p>
                <ul className="courses__item-meta list-wrap">
                  <li>
                    <div className="author">
                      <Link href="#">
                        <img src="/assets/img/courses/course_author02.png" alt="img" />
                      </Link>
                      <Link href="#">Arian Hok</Link>
                    </div>
                  </li>
                  <li>
                    <i className="flaticon-file" /> 19
                  </li>
                  <li>
                    <i className="flaticon-timer" /> 10h 30m
                  </li>
                  <li>
                    <i className="flaticon-user-1" /> 18
                  </li>
                  <li>
                    <div className="rating">
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <i className="fas fa-star" />
                      <span className="rating-count">(4.8)</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="courses-details-area section-pb-120">
        <div className="container">
          <div className="row">
            <div className="col-xl-9 col-lg-8">
              <div className="courses__details-wrapper">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  <li className="nav-item" onClick={() => handleOnClick(1)}>
                    <button className={activeIndex === 1 ? 'nav-link active' : 'nav-link'}>Course Information</button>
                  </li>
                  <li className="nav-item" onClick={() => handleOnClick(2)}>
                    <button className={activeIndex === 2 ? 'nav-link active' : 'nav-link'}>Reviews</button>
                  </li>
                </ul>

                <div className="tab-content" id="myTabContent">
                  <div className={activeIndex === 1 ? 'tab-pane active' : 'tab-pane'}>
                    <div className="courses__details-content">
                      <p>
                        {description ||
                          'This tutorial will help you learn quickly and thoroughly. Lorem ipsum, or lipsum as it is sometimes known, iaws dumm text used in laying out print, graphic or web designs.'}
                      </p>
                      <p>
                        You’ll be exposed to principles and strategies, but, more importantly, you’ll learn how to actually apply
                        these abstract concepts.
                      </p>
                      <div className="courses__details-inner">
                        <h3 className="title">What Will You Learn?</h3>
                        <p>
                          This tutorial will help you learn quickly and thoroughly. Lorem ipsum, or lipsum as it is sometimes known,
                          iaws dumm text used in laying out print, graphic or web designsm dolor sit amet.
                        </p>
                        <div className="event-details-list">
                          <ul className="list-wrap">
                            <li>
                              <i className="fas fa-check-circle" />
                              Become a UX designer.
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              Create quick wireframes.
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              You will be able to add UX designe
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              Downloadable exercise files
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              Become a UI designer.
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              Build a UX project from beginning to end.
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              Build test a full website design.
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              Learn to design websites mobile
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              Create your first UX brief persona.
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              All the techniques used by UX professionals
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              How to use premade UI kits.
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="courses__details-inner">
                        <h3 className="title">Requirements</h3>
                        <p>
                          {description ||
                            'This tutorial will help you learn quickly and thoroughly. Lorem ipsum, or lipsum as it is sometimes'}
                        </p>
                        <div className="event-details-list">
                          <ul className="list-wrap">
                            <li>
                              <i className="fas fa-check-circle" />
                              Become a UX designer.
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              Create quick wireframes.
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              You will be able to add UX designe
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              Downloadable exercise files
                            </li>
                            <li>
                              <i className="fas fa-check-circle" />
                              Become a UI designer.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="courses__details-curriculum">
                      <h4 className="title">Curriculum</h4>
                      <div className="accordion" id="accordionExample">
                        <div className="accordion-item">
                          <h2 className="accordion-header" onClick={() => handleToggle(1)}>
                            <button className={isActive.key == 1 ? 'accordion-button  collapsed' : 'accordion-button'}>
                              Introduction
                            </button>
                          </h2>
                          <div
                            className={isActive.key == 1 ? 'accordion-collapse collapse show' : 'accordion-collapse collapse'}
                          >
                            <div className="accordion-body">
                              <ul className="list-wrap">
                                <li className="course-item">
                                  <Link href="#" className="course-item-link">
                                    <span className="item-name">Course Installation</span>
                                    <div className="course-item-meta">
                                      <span className="item-meta duration">07:48</span>
                                      <span className="item-meta course-item-status">
                                        <img src="/assets/img/icons/lock.svg" alt="icon" />
                                      </span>
                                    </div>
                                  </Link>
                                </li>
                                <li className="course-item">
                                  <Link href="#" className="course-item-link">
                                    <span className="item-name">Create a Simple React App</span>
                                    <div className="course-item-meta">
                                      <span className="item-meta duration">07:48</span>
                                      <span className="item-meta course-item-status">
                                        <img src="/assets/img/icons/lock.svg" alt="icon" />
                                      </span>
                                    </div>
                                  </Link>
                                </li>
                                <li className="course-item">
                                  <Link href="#" className="course-item-link">
                                    <span className="item-name">React for the Rest of us</span>
                                    <div className="course-item-meta">
                                      <span className="item-meta duration">10:48</span>
                                      <span className="item-meta course-item-status">
                                        <img src="/assets/img/icons/lock.svg" alt="icon" />
                                      </span>
                                    </div>
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="accordion-item">
                          <h2 className="accordion-header" onClick={() => handleToggle(2)}>
                            <button className={isActive.key == 2 ? 'accordion-button  collapsed' : 'accordion-button'}>
                              Capacitance and Inductance
                            </button>
                          </h2>
                          <div
                            className={isActive.key == 2 ? 'accordion-collapse collapse show' : 'accordion-collapse collapse'}
                          >
                            <div className="accordion-body">
                              <ul className="list-wrap">
                                <li className="course-item">
                                  <Link href="#" className="course-item-link">
                                    <span className="item-name">Course Installation</span>
                                    <div className="course-item-meta">
                                      <span className="item-meta duration">07:48</span>
                                      <span className="item-meta course-item-status">
                                        <img src="/assets/img/icons/lock.svg" alt="icon" />
                                      </span>
                                    </div>
                                  </Link>
                                </li>
                                <li className="course-item">
                                  <Link href="#" className="course-item-link">
                                    <span className="item-name">Create a Simple React App</span>
                                    <div className="course-item-meta">
                                      <span className="item-meta duration">07:48</span>
                                      <span className="item-meta course-item-status">
                                        <img src="/assets/img/icons/lock.svg" alt="icon" />
                                      </span>
                                    </div>
                                  </Link>
                                </li>
                                <li className="course-item">
                                  <Link href="#" className="course-item-link">
                                    <span className="item-name">React for the Rest of us</span>
                                    <div className="course-item-meta">
                                      <span className="item-meta duration">10:48</span>
                                      <span className="item-meta course-item-status">
                                        <img src="/assets/img/icons/lock.svg" alt="icon" />
                                      </span>
                                    </div>
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="accordion-item">
                          <h2 className="accordion-header" onClick={() => handleToggle(3)}>
                            <button className={isActive.key == 3 ? 'accordion-button  collapsed' : 'accordion-button'}>
                              Final Audit
                            </button>
                          </h2>
                          <div
                            className={isActive.key == 3 ? 'accordion-collapse collapse show' : 'accordion-collapse collapse'}
                          >
                            <div className="accordion-body">
                              <ul className="list-wrap">
                                <li className="course-item">
                                  <Link href="#" className="course-item-link">
                                    <span className="item-name">Course Installation</span>
                                    <div className="course-item-meta">
                                      <span className="item-meta duration">07:48</span>
                                      <span className="item-meta course-item-status">
                                        <img src="/assets/img/icons/lock.svg" alt="icon" />
                                      </span>
                                    </div>
                                  </Link>
                                </li>
                                <li className="course-item">
                                  <Link href="#" className="course-item-link">
                                    <span className="item-name">Create a Simple React App</span>
                                    <div className="course-item-meta">
                                      <span className="item-meta duration">07:48</span>
                                      <span className="item-meta course-item-status">
                                        <img src="/assets/img/icons/lock.svg" alt="icon" />
                                      </span>
                                    </div>
                                  </Link>
                                </li>
                                <li className="course-item">
                                  <Link href="#" className="course-item-link">
                                    <span className="item-name">React for the Rest of us</span>
                                    <div className="course-item-meta">
                                      <span className="item-meta duration">10:48</span>
                                      <span className="item-meta course-item-status">
                                        <img src="/assets/img/icons/lock.svg" alt="icon" />
                                      </span>
                                    </div>
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="courses__details-instructors">
                      <h4 className="title">Your Instructors</h4>
                      <div className="courses__instructors-list">
                        <div className="courses__instructors-item">
                          <div className="courses__instructors-thumb">
                            <Link href="/instructor-details">
                              <img src="/assets/img/courses/details_instructors01.jpg" alt="img" />
                            </Link>
                          </div>
                          <div className="courses__instructors-content">
                            <h5 className="name">
                              <Link href="/instructor-details">Robert Smith</Link>
                            </h5>
                            <span className="designation">Graphic Design</span>
                            <ul className="meta list-wrap d-flex flex-wrap">
                              <li>
                                <i className="flaticon-user-1" /> 1,135 Students
                              </li>
                              <li>
                                <i className="flaticon-file" /> 05
                              </li>
                              <li>
                                <div className="rating">
                                  <i className="fas fa-star" />
                                  <i className="fas fa-star" />
                                  <i className="fas fa-star" />
                                  <i className="fas fa-star" />
                                  <i className="fas fa-star" />
                                  <span className="average">(4.2)</span>
                                </div>
                              </li>
                            </ul>
                            <p>
                              Donald Logan has more than 15 years’ experience as a project management consultant, educator, technology
                              consultant, business know.
                            </p>
                            <div className="tg-button-wrap">
                              <Link href="/instructor-details" className="btn btn-border tg-svg">
                                <span className="text">See More</span>{' '}
                                <span className="svg-icon" id="svg-btn1" data-svg-icon="assets/img/icons/btn-arrow.svg" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={activeIndex === 2 ? 'tab-pane active' : 'tab-pane'}>
                    <div className="courses__details-reviews">
                      <h4 className="title">Student Ratings Reviews</h4>
                      <div className="course-rate">
                        <div className="course-rate__summary">
                          <div className="course-rate__summary-value">4.8</div>
                          <div className="course-rate__summary-stars">
                            <i className="fas fa-star" />
                            <i className="fas fa-star" />
                            <i className="fas fa-star" />
                            <i className="fas fa-star" />
                            <i className="fas fa-star" />
                          </div>
                          <div className="course-rate__summary-text">Total 2 Rating</div>
                        </div>
                        <div className="course-rate__details">
                          <div className="course-rate__details-row" />
                        </div>
                      </div>
                      <div id="course-reviews">
                        <h4 className="course-review-head">Reviews (01)</h4>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-4">
              <aside className="courses__details-sidebar">
                <div className="event-widget">
                  <div className="thumb">
                    <img src={courseThumb} alt="img" />
                    <VideoPopup />
                  </div>
                  <div className="event-cost-wrap">
                    <h4 className="price">
                      <strong>Costs:</strong>
                      {tier.isFree ? (
                        <>
                          Rp 0 <span>—</span>
                        </>
                      ) : promoResult.applied ? (
                        <>
                          Rp {Number(displayPrice).toLocaleString('id-ID')} <span>Rp {Number(tier.price).toLocaleString('id-ID')}</span>
                        </>
                      ) : (
                        <>Rp {Number(displayPrice).toLocaleString('id-ID')}</>
                      )}
                    </h4>
                    <Link href="#" className="btn">
                      Enroll This Now
                    </Link>
                    <div className="event-information-wrap">
                      <h6 className="title">Include This Course</h6>
                      <ul className="list-wrap">
                        <li>
                          <i className="flaticon-timer" /> Duration <span>5.2 Hours</span>
                        </li>
                        <li>
                          <i className="flaticon-file" /> Estimated Seat <span>250</span>
                        </li>
                        <li>
                          <i className="flaticon-user-1" /> Joined <span>190</span>
                        </li>
                        <li>
                          <i className="flaticon-bars" /> Laguage <span>English</span>
                        </li>
                        <li>
                          <i className="flaticon-flash" /> Category <span>{category}</span>
                        </li>
                        <li>
                          <i className="flaticon-share" /> Share
                          <ul className="list-wrap event-social">
                            <li>
                              <Link href="#">
                                <i className="fab fa-facebook-f" />
                              </Link>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

