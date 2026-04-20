'use client'

import React from 'react'
import Link from 'next/link'

export default function HomeOneLanding() {
  return (
    <div>
      <header>
        <div className="tg-header__area transparent-header">
          <div className="container custom-container">
            <div className="row">
              <div className="col-12">
                <div className="tgmenu__wrap">
                  <nav className="tgmenu__nav">
                    <div className="logo">
                      <Link href="/"><img src="/images/logo/logo-rad-e1768539218966.webp" alt="PT. RAD Indonesia" /></Link>
                    </div>
                    <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-xl-flex">
                      <ul className="navigation">
                        <li className="active"><Link href="/">Home One</Link></li>
                        <li><Link href="/services">Courses</Link></li>
                        <li><Link href="/blog">Blog</Link></li>
                        <li><Link href="/contact">Contact</Link></li>
                      </ul>
                    </div>
                    <div className="tgmenu__action">
                      <ul className="list-wrap">
                        <li className="header-btn login-btn"><Link href="/authentication/login/minimal" className="btn">Log in</Link></li>
                        <li className="header-btn free-btn"><Link href="/authentication/register/minimal" className="btn">Try For Free</Link></li>
                      </ul>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="banner-area banner-bg" style={{ backgroundImage: "url('/eduvalt-assets/img/banner/banner_bg.jpg')" }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="banner__content">
                <img src="/eduvalt-assets/img/banner/bshape_01.png" alt="shape" className="shape alltuchtopdown" />
                <img src="/eduvalt-assets/img/banner/bshape_02.png" alt="shape" className="shape" />
                <span className="sub-title">100% Satisfaction Guarantee</span>
                <h3 className="title tg-svg">
                  Learn <span className="position-relative">Skills</span> From Our Top Instructors
                </h3>
                <p>
                  Borem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattisBorem
                  ipsum dolor sit amet consectetur adipiscing area we followelit.
                </p>
                <div className="banner__btn-wrap">
                  <div className="tg-button-wrap">
                    <Link href="/services" className="btn tg-svg">
                      <span className="text">Explore Courses</span>
                    </Link>
                  </div>
                  <div className="banner__phone">
                    <i className="flaticon-phone-call" />
                    <div className="number-info">
                      <span>Have any Question?</span>
                      <h6 className="number">993-00-67777</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="banner__images">
                <img src="/eduvalt-assets/img/banner/banner_img.png" alt="img" className="main-img" />
                <img src="/eduvalt-assets/img/banner/bshape_03.png" alt="shape" className="shape" />
                <img src="/eduvalt-assets/img/banner/bshape_04.png" alt="shape" className="shape" />
                <img src="/eduvalt-assets/img/banner/bshape_05.png" alt="shape" className="shape" />
                <div className="banner__fact">
                  <div className="banner__fact-item">
                    <div className="icon"><i className="flaticon-group" /></div>
                    <div className="info"><span>Total Students</span><h4 className="count">15K</h4></div>
                  </div>
                  <div className="banner__fact-item">
                    <div className="icon"><i className="flaticon-graduation-cap" /></div>
                    <div className="info"><span>Complete Graduation</span><h4 className="count">34K</h4></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="brand-area">
        <div className="container">
          <div className="row g-3 justify-content-center">
            {['Google', 'Slack', 'Asana', 'Notion', 'Stripe', 'Figma'].map((item) => (
              <div className="col-auto" key={item}><span className="badge bg-light text-dark border px-4 py-3">{item}</span></div>
            ))}
          </div>
        </div>
      </div>

      <section className="about-area tg-motion-effects section-py-120">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-xl-6 col-lg-8">
              <div className="about__images">
                <img className="small-img tg-motion-effects3" src="/eduvalt-assets/img/others/about_img02.png" alt="img" />
                <img className="big-img" src="/eduvalt-assets/img/others/about_img01.png" alt="img" />
                <div className="about__exp"><h4 className="year">12 +</h4><p>Years of Experiences</p></div>
                <img src="/eduvalt-assets/img/others/about_dots.svg" alt="svg" className="dots tg-motion-effects2" />
              </div>
            </div>
            <div className="col-xl-6 col-lg-7">
              <div className="about__content">
                <div className="section__title">
                  <span className="sub-title">Get To Know About Us</span>
                  <h2 className="title tg-svg">Discover top <span className="position-relative">Instructors</span> Around the World</h2>
                </div>
                <p className="desc">
                  Borem ipsum dolor sit amet, consectetur adipiscing eliawe awUt elit ellus, luctus nec ullamcorper mattisBorem ipsum dolor awes atnse awctetur adipis we followelit.
                </p>
                <ul className="about__info-list list-wrap">
                  <li className="about__info-list-item"><div className="icon"><i className="flaticon-support" /></div><p className="content">2000+ <br /> Expert Tutors</p></li>
                  <li className="about__info-list-item"><div className="icon"><i className="flaticon-file" /></div><p className="content">1500+ <br /> Top Lessons</p></li>
                  <li className="about__info-list-item"><div className="icon"><i className="flaticon-graduation-cap" /></div><p className="content">18000+ <br /> Over Students</p></li>
                  <li className="about__info-list-item"><div className="icon"><i className="flaticon-video-player" /></div><p className="content">3200+ <br /> Pro Videos</p></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="categories-area section-py-130">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-xl-5 col-lg-8 col-md-10">
              <div className="categories__title-wrap text-center text-xl-start">
                <div className="section__title">
                  <span className="sub-title">Unique online courses</span>
                  <h2 className="title tg-svg">Browse By <span className="position-relative">Categories</span></h2>
                </div>
                <p>Borem ipsum dolor sit amet, consectetur adipiscing eliawe awut elit ellus, luctus nec ullamcorper mattisBorem ipsum dolor awes atnse awctetur.</p>
              </div>
            </div>
            <div className="col-xl-7 col-lg-9">
              <div className="categories__wrap">
                <div className="row justify-content-center row-cols-2 row-cols-sm-3 g-3">
                  {[
                    ['flaticon-graphic-design', 'Graphic Design', '19 Courses'],
                    ['flaticon-email-marketing', 'Marketing', '10 Courses'],
                    ['flaticon-bars', 'Finance', '08 Courses'],
                    ['flaticon-programming-language', 'Development', '13 Courses'],
                    ['flaticon-atom', 'Science', '19 Courses'],
                  ].map(([icon, name, count]) => (
                    <div className="col" key={name}>
                      <div className="categories__item">
                        <Link href="/services">
                          <i className={icon} />
                          <span className="name">{name}</span>
                          <span className="courses">{count}</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonial-area testimonial-bg section-py-120" style={{ backgroundImage: "url('/eduvalt-assets/img/bg/testimonial_bg.jpg')" }}>
        <div className="container">
          <div className="row g-4">
            {['Ayu Pratama', 'Raka Saputra', 'Nadia Putri'].map((name) => (
              <div className="col-lg-4" key={name}>
                <div className="testimonial__item">
                  <div className="testimonial__rating">{'★★★★★'}</div>
                  <p>Borem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus luctus nec ullamcorper mattis.</p>
                  <h5>{name}</h5>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="instructor-area section-pt-120 section-pb-70">
        <div className="container">
          <div className="section__title-wrap">
            <div className="row align-items-center gap-4 gap-md-0">
              <div className="col-md-8">
                <div className="section__title text-center text-md-start">
                  <span className="sub-title">Our Qualified People Matter</span>
                  <h2 className="title tg-svg">Top <span className="position-relative">Class</span> instructor</h2>
                </div>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            {[
              ['/eduvalt-assets/img/instructor/instructor01.png', 'Graphic Design', 'Robert Smith'],
              ['/eduvalt-assets/img/instructor/instructor02.png', 'Web Design', 'Olivia Mia'],
              ['/eduvalt-assets/img/instructor/instructor03.png', 'Digital Marketing', 'William Hope'],
              ['/eduvalt-assets/img/instructor/instructor04.png', 'Web Development', 'Sophia Ava'],
            ].map(([img, role, name]) => (
              <div className="col-xl-3 col-lg-4 col-sm-6" key={name}>
                <div className="instructor__item">
                  <div className="instructor__img"><img src={img} alt={name} /></div>
                  <div className="instructor__content"><div className="left"><span className="designation">{role}</span><h4 className="name">{name}</h4></div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-area">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="cta__wrapper">
                <div className="section__title white-title">
                  <h2 className="title tg-svg">Join us <span className="position-relative">Spread</span> Experiences</h2>
                </div>
                <div className="cta__desc"><p>Borem ipsum dolor sit amet, consectetur adipiscing eliawe awUt elit ellus, luctus nec ullamcorper mattisBorem</p></div>
                <div className="tg-button-wrap justify-content-center justify-content-md-end">
                  <Link href="/authentication/register/minimal" className="btn white-btn tg-svg"><span className="text">Become an Instructor</span></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="blog-area blog-bg-circle section-pt-205 section-pb-90">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-7 col-md-8">
              <div className="section__title text-center mb-40">
                <span className="sub-title">Always Smart To Hear News</span>
                <h2 className="title tg-svg">Latest <span className="position-relative">News</span> Blog</h2>
                <p className="desc">Receive huge benefits with our lifetime Plumbing Receive huge benefits with our lifetime Plumbing email address will be shown</p>
              </div>
            </div>
          </div>
          <div className="row justify-content-center g-4">
            {[1, 2, 3].map((i) => (
              <div className="col-lg-4 col-md-6" key={i}>
                <article className="blog__post-item">
                  <div className="blog__post-thumb"><img src={`/eduvalt-assets/img/blog/blog_post0${i}.jpg`} alt="blog" /></div>
                  <div className="blog__post-content"><h5 className="title">Learning roadmap updates for students</h5><p>Borem ipsum dolor sit amet consectetur adipiscing.</p></div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="newsletter-area section-py-55">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-xl-6 col-lg-4">
              <div className="newsletter__img-wrap">
                <div className="newsletter__img"><img src="/eduvalt-assets/img/others/newsletter.png" alt="img" /></div>
                <div className="newsletter__content"><h4 className="title">Let&apos;s Join To <br /> Our Newsletters</h4></div>
              </div>
            </div>
            <div className="col-xl-6 col-lg-7">
              <div className="newsletter__form">
                <form action="#">
                  <input type="email" placeholder="Enter your email" required />
                  <button type="submit">Subscribe Now</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer-bg" style={{ backgroundColor: '#0f172a' }}>
        <div className="footer__top-wrap">
          <div className="container">
            <div className="row">
              <div className="col-lg-4 col-sm-6">
                <div className="footer-widget">
                  <div className="footer__about">
                    <div className="footer__logo logo">
                      <Link href="/"><img src="/images/logo/logo-rad-e1768539218966.webp" alt="PT. RAD Indonesia" /></Link>
                    </div>
                    <p>when an unknown printer took galley of type and scrambled it to make specimen book.</p>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-sm-6">
                <div className="footer-widget widget_nav_menu">
                  <h4 className="fw-title">Resources</h4>
                  <ul className="list-wrap">
                    <li><Link href="/about-us">About</Link></li>
                    <li><Link href="/contact">Contact</Link></li>
                    <li><Link href="/services">Courses</Link></li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-4 col-sm-6">
                <div className="footer-widget">
                  <h4 className="fw-title">Working Hours</h4>
                  <div className="footer__working-list">
                    <div className="footer__working-item"><span className="day">Mon - Fri</span><span className="time">8:00 AM - 5:00 PM</span></div>
                    <div className="footer__working-item"><span className="day">Sat</span><span className="time">9:00 AM - 3:00 PM</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
