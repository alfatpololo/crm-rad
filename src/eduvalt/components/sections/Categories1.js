import Link from "next/link"
import { RAD_PROGRAM_NAMES, RAD_SITE_PELATIHAN } from "@/lib/radLandingContent"

export default function Categories1() {
    return (
        <>
            <section className="categories-area section-py-130">
                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-xl-5 col-lg-8 col-md-10">
                            <div className="categories__title-wrap text-center text-xl-start">
                                <div className="section__title">
                                    <span className="sub-title">Program sertifikasi internasional</span>
                                    <h2 className="title tg-svg">
                                        Pelatihan{" "}
                                        <span className="position-relative">
                                            <span className="svg-icon" id="svg-5" data-svg-icon="assets/img/icons/title_shape.svg" />
                                            kami
                                        </span>
                                    </h2>
                                </div>
                                <p>
                                    Kami menyelenggarakan pelatihan dengan sertifikat yang diakui secara internasional,
                                    termasuk <strong>CMA</strong> (Certified Management Accountant) dari ICMA Australia,
                                    serta jalur CBV, CIBA, CAPF, dan program terkait manajemen &amp; bisnis.
                                </p>
                                <div className="tg-button-wrap justify-content-center justify-content-xl-start">
                                    <Link href="/services" className="btn btn-border tg-svg me-2 mb-2 mb-sm-0">
                                        <span className="text">Program di LMS</span>{" "}
                                        <span className="svg-icon" id="svg-6" data-svg-icon="assets/img/icons/btn-arrow.svg" />
                                    </Link>
                                    <Link
                                        href={RAD_SITE_PELATIHAN}
                                        className="btn btn-border tg-svg mb-2 mb-sm-0"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span className="text">Jadwal di situs RAD</span>{" "}
                                        <span className="svg-icon" id="svg-7" data-svg-icon="assets/img/icons/btn-arrow.svg" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-7 col-lg-9">
                            <div className="categories__wrap">
                                <img src="/assets/img/objects/categories_shape03.svg" alt="" data-aos="fade-right" />
                                <img src="/assets/img/objects/categories_shape04.svg" alt="" data-aos="fade-left" />
                                <div className="row justify-content-center row-cols-2 row-cols-md-3">
                                    {RAD_PROGRAM_NAMES.slice(0, 3).map((p) => (
                                        <div className="col" key={p.name}>
                                            <div className="categories__item">
                                                <Link href="/services">
                                                    <i className={p.icon} />
                                                    <span className="name">{p.name}</span>
                                                    <span className="courses">{p.desc}</span>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="row justify-content-center row-cols-2 row-cols-sm-3">
                                    {RAD_PROGRAM_NAMES.slice(3).map((p) => (
                                        <div className="col" key={p.name}>
                                            <div className="categories__item">
                                                <Link href="/services">
                                                    <i className={p.icon} />
                                                    <span className="name">{p.name}</span>
                                                    <span className="courses">{p.desc}</span>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="categories__shapes">
                    <div className="categories__shapes-item rotateme">
                        <img src="/assets/img/objects/categories_shape01.png" alt="" />
                    </div>
                    <div className="categories__shapes-item" data-aos="fade-up">
                        <img src="/assets/img/objects/categories_shape02.png" alt="" />
                    </div>
                </div>
            </section>
        </>
    )
}
