import Link from "next/link"
import MobileMenu from "../MobileMenu"
import { Menu } from '@headlessui/react'
export default function Header2({ scroll, isMobileMenu, handleMobileMenu }) {
    return (
        <>
            <div id="header-fixed-height" />
            <header className="tg-header__style-two">
                <div id="sticky-header" className={`tg-header__area ${scroll ? "sticky-menu" : ""}`}>
                    <div className="container custom-container">
                        <div className="row">
                            <div className="col-12">
                                <div className="mobile-nav-toggler" onClick={handleMobileMenu}><i className="tg-flaticon-menu-1" /></div>
                                <div className="tgmenu__wrap">
                                    <nav className="tgmenu__nav">
                                        <div className="logo">
                                            <Link href="/"><img src="/assets/img/logo/logo.png" alt="Logo" /></Link>
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
                                        <div className="tgmenu__categories d-none d-md-block">
                                            <Menu as="div" className="dropdown">
                                                <Menu.Button as="button" className="dropdown-toggle">
                                                    <svg width={12} height={12} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 12H6.85714V6.85714H12V12ZM5.14286 12H0V6.85714H5.14286V12ZM12 5.14286H6.85714V0H12V5.14286ZM5.14286 5.14286H0V0H5.14286V5.14286Z" fill="currentcolor" />
                                                    </svg>
                                                    Browse Categories
                                                </Menu.Button>
                                                <Menu.Items as="ul" className="dropdown-menu d-block" aria-labelledby="dropdownMenuButton1">
                                                    <li><Link className="dropdown-item" href="/courses">Business</Link></li>
                                                    <li><Link className="dropdown-item" href="/courses">Data Science</Link></li>
                                                    <li><Link className="dropdown-item" href="/courses">Art  Design</Link></li>
                                                    <li><Link className="dropdown-item" href="/courses">Marketing</Link></li>
                                                    <li><Link className="dropdown-item" href="/courses">Finance</Link></li>
                                                </Menu.Items>
                                            </Menu>
                                        </div>
                                        <div className="tgmenu__action">
                                            <ul className="list-wrap">
                                                <li className="mini-cart-icon">
                                                    <Link href="/shop" className="cart-count">
                                                        <img src="/assets/img/icons/cart.svg" alt="cart" />
                                                        <span className="mini-cart-count">0</span>
                                                    </Link>
                                                </li>
                                                <li className="header-phone d-none d-lg-block d-xl-none d-xxl-block"><Link href="/tel:993-00-67777"><i className="flaticon-phone-call" />
                                                    993-00-67777</Link></li>
                                                <li className="header-btn login-btn"><Link href="/contact" className="btn">Log in</Link>
                                                </li>
                                                <li className="header-btn"><Link href="/contact" className="btn">Try For Free</Link></li>
                                            </ul>
                                        </div>
                                    </nav>
                                </div>
                                {/* Mobile Menu  */}
                                <div className="tgmobile__menu">
                                    <nav className="tgmobile__menu-box">
                                        <div className="close-btn" onClick={handleMobileMenu}><i className="tg-flaticon-close-1" /></div>
                                        <div className="nav-logo">
                                            <Link href="/"><img src="/assets/img/logo/logo.png" alt="Logo" /></Link>
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
                                                <li className="header-btn login-btn"><Link href="#" className="btn">Log in</Link></li>
                                                <li className="header-btn"><Link href="#" className="btn">Try For Free</Link></li>
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
