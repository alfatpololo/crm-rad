'use client'

import Link from "next/link"
import MobileMenu from "../MobileMenu"
import { useAuth } from "@/context/AuthProvider"

export default function Header1({ scroll, isMobileMenu, handleMobileMenu, transparent = true }) {
    const { user, loading } = useAuth()
    const headerAreaClass = transparent
        ? `tg-header__area transparent-header${scroll ? " sticky-menu" : ""}`
        : `tg-header__area tg-header--solid${scroll ? " sticky-menu" : ""}`
    return (
        <>
            <header>
                <div id="sticky-header" className={headerAreaClass.trim()}>
                    <div className="container custom-container">
                        <div className="row">
                            <div className="col-12">
                                <div className="mobile-nav-toggler" onClick={handleMobileMenu}><i className="tg-flaticon-menu-1" /></div>
                                <div className="tgmenu__wrap">
                                    <nav className="tgmenu__nav">
                                        <div className="logo">
                                            <Link href="/"><img src="/images/logo/logo-rad-e1768539218966.webp" alt="PT. RAD Indonesia" /></Link>
                                        </div>
                                        <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-xl-flex">
                                            <ul className="navigation">
                                                <li className="active"><Link href="/">Home</Link></li>
                                                <li className="menu-item-has-children"><Link href="#">Courses</Link>
                                                    <ul className="sub-menu">
                                                        <li><Link href="/courses">All Courses</Link></li>
                                                        <li><Link href="/course-details">Course Details</Link></li>
                                                    </ul>
                                                </li>
                                                <li className="menu-item-has-children"><Link href="#">Pages</Link>
                                                    <ul className="sub-menu">
                                                        <li><Link href="/about-us">About Us</Link></li>
                                                        <li><Link href="/instructors">Our Instructors</Link></li>
                                                        <li><Link href="/instructor-details">Instructor Details</Link></li>
                                                        <li><Link href="/mentors">Our Mentors</Link></li>
                                                        <li><Link href="/events">Our Events</Link></li>
                                                        <li><Link href="/events-details">Event Details</Link></li>
                                                        <li><Link href="/faq">Asked Question</Link></li>
                                                        <li><Link href="/404">404 Page</Link></li>
                                                        <li><Link href="/contact">contact</Link></li>
                                                    </ul>
                                                </li>
                                                <li className="menu-item-has-children"><Link href="#">Shop</Link>
                                                    <ul className="sub-menu">
                                                        <li><Link href="/shop">Shop Page</Link></li>
                                                        <li><Link href="/shop-details">Shop Details</Link></li>
                                                    </ul>
                                                </li>
                                                <li className="menu-item-has-children"><Link href="#">Blog</Link>
                                                    <ul className="sub-menu">
                                                        <li><Link href="/blog-grid">Blog Grid</Link></li>
                                                        <li><Link href="/blog">Blog Standard</Link></li>
                                                        <li><Link href="/blog-details">Blog Details</Link></li>
                                                    </ul>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="tgmenu__search d-none d-md-block">
                                            <form action="#" className="tgmenu__search-form">
                                                <div className="select-grp">
                                                    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 12H6.85714V6.85714H12V12ZM5.14286 12H0V6.85714H5.14286V12ZM12 5.14286H6.85714V0H12V5.14286ZM5.14286 5.14286H0V0H5.14286V5.14286Z" fill="currentcolor" />
                                                    </svg>
                                                    <select className="form-select" id="course-cat" aria-label="Default select example" style={{ width: 150 }}>
                                                        <option disabled>Categories</option>
                                                        <option>Business</option>
                                                        <option value={2}>Data Science</option>
                                                        <option value={3}>Art  Design</option>
                                                        <option value={4}>Marketing</option>
                                                        <option value={5}>Finance</option>
                                                    </select>
                                                </div>
                                                <div className="input-grp">
                                                    <input type="text" placeholder="Search For Course . . ." />
                                                    <button type="submit"><i className="flaticon-searching" /></button>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="tgmenu__action">
                                            <ul className="list-wrap">
                                                <li className="mini-cart-icon">
                                                    <Link href="/shop" className="cart-count">
                                                        <img src="/assets/img/icons/cart.svg" alt="cart" />
                                                        <span className="mini-cart-count">0</span>
                                                    </Link>
                                                </li>
                                                {!loading && user ? (
                                                    <li className="header-btn login-btn">
                                                        <a href="/dashboard" className="btn">Dashboard</a>
                                                    </li>
                                                ) : !loading ? (
                                                    <>
                                                        <li className="header-btn login-btn">
                                                            <Link href="/authentication/login/minimal" className="btn">Log in</Link>
                                                        </li>
                                                        <li className="header-btn free-btn">
                                                            <Link href="/authentication/login/minimal" className="btn">Try For Free</Link>
                                                        </li>
                                                    </>
                                                ) : null}
                                            </ul>
                                        </div>
                                    </nav>
                                </div>
                                {/* Mobile Menu  */}
                                <div className="tgmobile__menu">
                                    <nav className="tgmobile__menu-box">
                                        <div className="close-btn" onClick={handleMobileMenu}><i className="tg-flaticon-close-1" /></div>
                                        <div className="nav-logo">
                                            <Link href="/"><img src="/images/logo/logo-rad-e1768539218966.webp" alt="PT. RAD Indonesia" /></Link>
                                        </div>
                                        <div className="tgmobile__search">
                                            <form action="#">
                                                <input type="text" placeholder="Search here..." />
                                                <button><i className="fas fa-search" /></button>
                                            </form>
                                        </div>
                                        <div className="tgmobile__menu-outer">
                                            <MobileMenu />
                                        </div>
                                        <div className="tgmenu__action">
                                            <ul className="list-wrap">
                                                {!loading && user ? (
                                                    <li className="header-btn login-btn">
                                                        <a href="/dashboard" className="btn">Dashboard</a>
                                                    </li>
                                                ) : !loading ? (
                                                    <>
                                                        <li className="header-btn login-btn">
                                                            <Link href="/authentication/login/minimal" className="btn">Log in</Link>
                                                        </li>
                                                        <li className="header-btn">
                                                            <Link href="/authentication/login/minimal" className="btn">Try For Free</Link>
                                                        </li>
                                                    </>
                                                ) : null}
                                            </ul>
                                        </div>
                                        <div className="social-links">
                                            <ul className="list-wrap">
                                                <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                                <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                                <li><Link href="#"><i className="fab fa-instagram" /></Link></li>
                                                <li><Link href="#"><i className="fab fa-linkedin-in" /></Link></li>
                                                <li><Link href="#"><i className="fab fa-youtube" /></Link></li>
                                            </ul>
                                        </div>
                                    </nav>
                                </div>
                                <div className="tgmobile__menu-backdrop" onClick={handleMobileMenu} />
                                {/* End Mobile Menu */}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}
