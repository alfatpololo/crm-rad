import Link from "next/link"
import { RAD_CONTACT, RAD_SITE_URL, RAD_SOCIAL, RAD_SITE_PELATIHAN, RAD_SITE_PENDAFTARAN } from "@/lib/radLandingContent"

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
                                            <Link href="/">
                                                <img src="/images/logo/logo-rad-e1768539218966.webp" alt="PT. RAD Indonesia" />
                                            </Link>
                                        </div>
                                        <p>
                                            PT. Rabindra Annesa Danesjvara Indonesia — mitra terpercaya ICMA Australia untuk
                                            pelatihan <strong>Certified Management Accountant (CMA)</strong> dan program
                                            sertifikasi internasional lainnya.
                                        </p>
                                        <ul className="list-wrap m-0 p-0">
                                            <li className="address">{RAD_CONTACT.address}</li>
                                            <li className="number">
                                                <Link href={`tel:${RAD_CONTACT.phoneTel}`}>{RAD_CONTACT.phoneDisplay}</Link>
                                            </li>
                                            <li className="small text-white-50">{RAD_CONTACT.email}</li>
                                            <li className="socials">
                                                <Link href={RAD_SOCIAL.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                                                    <i className="fab fa-facebook-f" />
                                                </Link>
                                                <Link href={RAD_SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                                    <i className="fab fa-instagram" />
                                                </Link>
                                                <Link href={`https://wa.me/${RAD_CONTACT.phoneTel.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                                                    <i className="fab fa-whatsapp" />
                                                </Link>
                                                <Link href={RAD_SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                                    <i className="fab fa-linkedin-in" />
                                                </Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-sm-6">
                                <div className="footer-widget widget_nav_menu">
                                    <h4 className="fw-title">Tautan cepat</h4>
                                    <ul className="list-wrap">
                                        <li>
                                            <Link href={RAD_SITE_URL} target="_blank" rel="noopener noreferrer">
                                                Situs resmi RAD
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href={RAD_SITE_PELATIHAN} target="_blank" rel="noopener noreferrer">
                                                Pelatihan
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href={RAD_SITE_PENDAFTARAN} target="_blank" rel="noopener noreferrer">
                                                Pendaftaran
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/services">Katalog LMS</Link>
                                        </li>
                                        <li>
                                            <Link href="/products">Merch</Link>
                                        </li>
                                        <li>
                                            <Link href="/authentication/login/cover">Login peserta</Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-sm-6">
                                <div className="footer-widget widget_nav_menu">
                                    <h4 className="fw-title">Program</h4>
                                    <ul className="list-wrap">
                                        <li>
                                            <Link href="/services">CMA &amp; manajemen</Link>
                                        </li>
                                        <li>
                                            <Link href="/services">Sertifikasi internasional</Link>
                                        </li>
                                        <li>
                                            <Link href="/membership">Membership</Link>
                                        </li>
                                        <li>
                                            <Link href="/payments-history">Riwayat pembayaran</Link>
                                        </li>
                                        <li>
                                            <Link href="/profile">Profil</Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-4 col-sm-6">
                                <div className="footer-widget">
                                    <h4 className="fw-title">Jam layanan</h4>
                                    <div className="footer__working-list">
                                        <div className="footer__working-item">
                                            <span className="day">Senin – Jumat</span>
                                            <span className="time">08.00 – 17.00 WIB</span>
                                        </div>
                                        <div className="footer__working-item">
                                            <span className="day">Sabtu</span>
                                            <span className="time">Perjanjian</span>
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
                                    <p>
                                        Copyright © {new Date().getFullYear()} PT. Rabindra Annesa Danesjvara Indonesia ·
                                        LMS &amp; layanan digital. Konten program mengacu pada{" "}
                                        <Link href={RAD_SITE_URL} className="text-white-50" target="_blank" rel="noopener noreferrer">
                                            radindonesia.com
                                        </Link>
                                        .
                                    </p>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="copyright__menu">
                                    <ul className="list-wrap d-flex flex-wrap justify-content-center justify-content-lg-end">
                                        <li>
                                            <Link href={RAD_SITE_URL} target="_blank" rel="noopener noreferrer">
                                                Kebijakan (situs RAD)
                                            </Link>
                                        </li>
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
