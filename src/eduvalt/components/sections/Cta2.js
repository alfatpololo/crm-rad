import Link from "next/link"

export default function Cta2() {
    return (
        <>
            <section className="cta-area-two position-relative">
                <div className="cta__bg" data-background="/assets/img/bg/cta_bg.jpg" />
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-8 col-lg-10">
                            <div className="cta__content">
                                <p>ARE YOU READY FOR THIS OFFER</p>
                                <h2 className="title">50% Offer For Very First 50</h2>
                                <h5 className="sub-title">Student’s  Mentors</h5>
                                <div className="tg-button-wrap justify-content-center">
                                    <Link href="/contact" className="btn tg-svg"><span className="text">Become a Student</span>
                                        <span className="svg-icon" id="cta-btn-2" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="cta__shapes">
                    <img src="/assets/img/objects/cta_shape001.svg" alt="img" className="position-absolute" data-aos="fade-down-right" data-aos-delay={300} />
                    <img src="/assets/img/objects/cta_shape002.png" alt="img" className="position-absolute" />
                    <img src="/assets/img/objects/cta_shape003.svg" alt="img" className="position-absolute" data-aos="fade-up-left" data-aos-delay={300} />
                </div>
            </section>
        </>
    )
}
