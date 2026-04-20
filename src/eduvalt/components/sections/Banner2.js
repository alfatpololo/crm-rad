import Link from "next/link"

export default function Banner2() {
    return (
        <>
            <section className="banner-area-two banner-bg-two" data-background="/assets/img/banner/banner_bg02.jpg">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="banner__content-two">
                                <img src="/assets/img/banner/banner_shape02.png" alt="shape" className="shape" data-aos="zoom-in-right" data-aos-delay={1200} />
                                <h3 className="title tg-svg">Explore Your <span className="position-relative"><span className="svg-icon" id="svg-2" data-svg-icon="assets/img/icons/title_shape.svg" />Skills</span>
                                    With Varieties of Courses</h3>
                                <div className="banner__search-form">
                                    <form action="#">
                                        <input type="text" placeholder="Search For Course . . ." />
                                        <button><i className="flaticon-searching fa-flip-horizontal" /></button>
                                    </form>
                                    <p><Link href="/courses">You can access 7,900+ different courses</Link></p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="banner__images-two">
                                <img src="/assets/img/banner/banner_shape03.png" alt="shape" className="shape" data-aos="zoom-in-down" data-aos-delay={800} />
                                <img src="/assets/img/banner/banner_shape04.png" alt="shape" className="shape" data-aos="zoom-in-left" data-aos-delay={1200} />
                                <div className="banner__images-grid">
                                    <div className="banner__images-col" data-aos="fade-up" data-aos-delay={200}>
                                        <img src="/assets/img/banner/banner_img01.png" alt="img" />
                                    </div>
                                    <div className="banner__images-col">
                                        <img src="/assets/img/banner/banner_img02.png" alt="img" data-aos="fade-left" data-aos-delay={300} />
                                        <img src="/assets/img/banner/banner_img03.png" alt="img" data-aos="fade-left" data-aos-delay={400} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <img src="/assets/img/banner/banner_shape01.png" alt="shape" className="banner__two-shape alltuchtopdown" />
            </section>
        </>
    )
}
