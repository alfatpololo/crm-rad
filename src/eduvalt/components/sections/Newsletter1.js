import Link from "next/link"
import { RAD_CONTACT, RAD_SITE_PENDAFTARAN } from "@/lib/radLandingContent"

export default function Newsletter1() {
    return (
        <>
            <section className="newsletter-area section-py-55">
                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-xl-6 col-lg-4">
                            <div className="newsletter__img-wrap">
                                <div className="newsletter__img" data-aos="fade-right">
                                    <img src="/assets/img/others/newsletter.png" alt="" />
                                </div>
                                <div className="newsletter__content">
                                    <h4 className="title">
                                        Tertarik gelombang
                                        <br />
                                        pelatihan berikutnya?
                                    </h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-7">
                            <div className="newsletter__form">
                                <p className="small text-muted mb-3">
                                    Email:{" "}
                                    <a href={`mailto:${RAD_CONTACT.email}`} className="text-dark fw-medium">
                                        {RAD_CONTACT.email}
                                    </a>
                                    <br />
                                    WhatsApp / telepon:{" "}
                                    <a href={`tel:${RAD_CONTACT.phoneTel}`} className="text-dark fw-medium">
                                        {RAD_CONTACT.phoneDisplay}
                                    </a>
                                </p>
                                <div className="d-flex flex-wrap gap-2">
                                    <Link href={RAD_SITE_PENDAFTARAN} className="btn" target="_blank" rel="noopener noreferrer">
                                        Pendaftaran di situs RAD
                                    </Link>
                                    <Link href="/services" className="btn btn-border">
                                        Katalog program LMS
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
