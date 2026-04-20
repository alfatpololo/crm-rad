import Link from "next/link"

export default function Banner1() {
    return (
        <>
            <section className="banner-area banner-bg" data-background="/assets/img/banner/banner_bg.jpg">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="banner__content">
                                <img src="/assets/img/banner/bshape_01.png" alt="shape" className="shape alltuchtopdown" />
                                <img src="/assets/img/banner/bshape_02.png" alt="shape" className="shape" />
                                <span className="sub-title" data-aos="fade-right" data-aos-delay={200}>100% Satisfaction
                                    Guarantee</span>
                                <h3 className="title tg-svg" data-aos="fade-right" data-aos-delay={400}>Learn <span className="position-relative"><span className="svg-icon" id="svg-2" data-svg-icon="assets/img/icons/title_shape.svg" />Skills</span> From Our
                                    Top Instructors</h3>
                                <p data-aos="fade-right" data-aos-delay={600}>Borem ipsum dolor sit amet, consectetur
                                    adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattisBorem ipsum dolor sit amet
                                    consectetur adipiscing area we followelit.</p>
                                <div className="banner__btn-wrap" data-aos="fade-right" data-aos-delay={800}>
                                    <div className="tg-button-wrap">
                                        <Link href="/courses" className="btn tg-svg"><span className="text">Explore Courses</span>
                                            <span className="svg-icon" id="svg-1" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
                                    </div>
                                    <div className="banner__phone">
                                        <i className="flaticon-phone-call" />
                                        <div className="number-info">
                                            <span>Have any Question?</span>
                                            <h6 className="number"><Link href="tel:993-00-67777">993-00-67777</Link></h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="banner__images">
                                <img src="/assets/img/banner/banner_img.png" alt="img" className="main-img" />
                                <img src="/assets/img/banner/bshape_03.png" alt="shape" className="shape" data-aos="fade-down-right" data-aos-delay={1200} />
                                <img src="/assets/img/banner/bshape_04.png" alt="shape" className="shape" data-aos="fade-right" data-aos-delay={1200} />
                                <img src="/assets/img/banner/bshape_05.png" alt="shape" className="shape" data-aos="fade-down-left" data-aos-delay={1200} />
                                <div className="banner__fact">
                                    <div className="banner__fact-item">
                                        <div className="icon">
                                            <i className="flaticon-group" />
                                        </div>
                                        <div className="info">
                                            <span>Total Students</span>
                                            <h4 className="count">15K</h4>
                                        </div>
                                    </div>
                                    <div className="banner__fact-item">
                                        <div className="icon">
                                            <i className="flaticon-graduation-cap" />
                                        </div>
                                        <div className="info">
                                            <span>Complete Graduation</span>
                                            <h4 className="count">34K</h4>
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
