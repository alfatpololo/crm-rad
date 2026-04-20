import Link from "next/link"

export default function Footer1() {
    return (
        <>
            <footer className="footer-bg" data-bg-color="var(--tg-common-color-dark)">
                <div className="footer__top-wrap">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-3 col-lg-4 col-sm-6">
                                <div className="footer-widget">
                                    <div className="footer__about">
                                        <div className="footer__logo logo">
                                            <Link href="/"><img src="/images/logo/logo-rad-e1768539218966.webp" alt="PT. RAD Indonesia" /></Link>
                                        </div>
                                        <p>when an unknown printer took galley of type and scrambled it to make pspecimen bookt
                                            has.</p>
                                        <ul className="list-wrap m-0 p-0">
                                            <li className="address">463 7th Ave, NY 10018, USA</li>
                                            <li className="number">+123 88 9900 456</li>
                                            <li className="socials">
                                                <Link href="#"><i className="fab fa-facebook-f" /></Link>
                                                <Link href="#"><i className="fab fa-twitter" /></Link>
                                                <Link href="#"><i className="fab fa-whatsapp" /></Link>
                                                <Link href="#"><i className="fab fa-linkedin-in" /></Link>
                                                <Link href="#"><i className="fab fa-youtube" /></Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-sm-6">
                                <div className="footer-widget widget_nav_menu">
                                    <h4 className="fw-title">Resources</h4>
                                    <ul className="list-wrap">
                                        <li><Link href="/about-us">About</Link></li>
                                        <li><Link href="/contact">Contact</Link></li>
                                        <li><Link href="/contact">Help Center</Link></li>
                                        <li><Link href="#">Refund</Link></li>
                                        <li><Link href="#">Conditions</Link></li>
                                        <li><Link href="#">Privacy Policy</Link></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-sm-6">
                                <div className="footer-widget widget_nav_menu">
                                    <h4 className="fw-title">Courses</h4>
                                    <ul className="list-wrap">
                                        <li><Link href="/courses">Life Coach</Link></li>
                                        <li><Link href="/courses">Business Coach</Link></li>
                                        <li><Link href="/courses">Health Coach</Link></li>
                                        <li><Link href="/courses">Development</Link></li>
                                        <li><Link href="/courses">Web Design</Link></li>
                                        <li><Link href="/courses">SEO Optimize</Link></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-sm-6">
                                <div className="footer-widget">
                                    <h4 className="fw-title">Working Hours</h4>
                                    <div className="footer__working-list">
                                        <div className="footer__working-item">
                                            <span className="day">Mon - Fri</span>
                                            <span className="time">8:00 AM - 5:00 PM</span>
                                        </div>
                                        <div className="footer__working-item">
                                            <span className="day">Mon - Fri</span>
                                            <span className="time">9:00 AM - 6:00 PM</span>
                                        </div>
                                        <div className="footer__working-item">
                                            <span className="day">Mon - Fri</span>
                                            <span className="time">10:00 AM - 8:00 PM</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="copyright__wrapper">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-8">
                                <div className="copyright__text">
                                    <p>Copyright © {new Date().getFullYear()} PT. RAD Indonesia. All rights reserved.</p>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="copyright__menu">
                                    <ul className="list-wrap d-flex flex-wrap justify-content-center justify-content-lg-end">
                                        <li><Link href="#">Privacy Policy</Link></li>
                                        <li><Link href="#">Terms  Conditions</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}
