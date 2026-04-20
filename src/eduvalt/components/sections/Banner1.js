import Link from "next/link"
import { RAD_CONTACT, RAD_SITE_URL, RAD_TAGLINE } from "@/lib/radLandingContent"

export default function Banner1() {
    return (
        <>
            <section className="banner-area banner-bg" data-background="/assets/img/banner/banner_bg.jpg">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="banner__content">
                                <img src="/assets/img/banner/bshape_01.png" alt="" className="shape alltuchtopdown" />
                                <img src="/assets/img/banner/bshape_02.png" alt="" className="shape" />
                                <span className="sub-title" data-aos="fade-right" data-aos-delay={200}>
                                    {RAD_TAGLINE.heroSub}
                                </span>
                                <h3 className="title tg-svg" data-aos="fade-right" data-aos-delay={400}>
                                    Mari bergabung dengan pelatihan{" "}
                                    <span className="position-relative">
                                        <span className="svg-icon" id="svg-2" data-svg-icon="assets/img/icons/title_shape.svg" />
                                        CMA
                                    </span>{" "}
                                    kami
                                </h3>
                                <p data-aos="fade-right" data-aos-delay={600}>
                                    {RAD_TAGLINE.heroLead}
                                </p>
                                <div className="banner__btn-wrap" data-aos="fade-right" data-aos-delay={800}>
                                    <div className="tg-button-wrap">
                                        <Link href="/services" className="btn tg-svg">
                                            <span className="text">{RAD_TAGLINE.heroCta}</span>
                                            <span className="svg-icon" id="svg-1" data-svg-icon="assets/img/icons/btn-arrow.svg" />
                                        </Link>
                                    </div>
                                    <div className="tg-button-wrap ms-2 d-inline-block align-middle">
                                        <Link href={RAD_SITE_URL} className="btn btn-border btn-sm" target="_blank" rel="noopener noreferrer">
                                            {RAD_TAGLINE.heroSecondary}
                                        </Link>
                                    </div>
                                    <div className="banner__phone mt-3 mt-lg-0">
                                        <i className="flaticon-phone-call" />
                                        <div className="number-info">
                                            <span>Hubungi kami</span>
                                            <h6 className="number">
                                                <Link href={`tel:${RAD_CONTACT.phoneTel}`}>{RAD_CONTACT.phoneDisplay}</Link>
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="banner__images">
                                <img src="/assets/img/banner/banner_img.png" alt="Pelatihan RAD Indonesia" className="main-img" />
                                <img src="/assets/img/banner/bshape_03.png" alt="" className="shape" data-aos="fade-down-right" data-aos-delay={1200} />
                                <img src="/assets/img/banner/bshape_04.png" alt="" className="shape" data-aos="fade-right" data-aos-delay={1200} />
                                <img src="/assets/img/banner/bshape_05.png" alt="" className="shape" data-aos="fade-down-left" data-aos-delay={1200} />
                                <div className="banner__fact">
                                    <div className="banner__fact-item">
                                        <div className="icon">
                                            <i className="flaticon-group" />
                                        </div>
                                        <div className="info">
                                            <span>Pengalaman</span>
                                            <h4 className="count">17+</h4>
                                        </div>
                                    </div>
                                    <div className="banner__fact-item">
                                        <div className="icon">
                                            <i className="flaticon-graduation-cap" />
                                        </div>
                                        <div className="info">
                                            <span>Mitra ICMA</span>
                                            <h4 className="count">CMA</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
