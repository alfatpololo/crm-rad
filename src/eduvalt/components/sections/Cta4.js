import Link from "next/link"

export default function Cta4() {
    return (
        <>
            <section className="cta-area-three">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="cta__wrapper">
                                <div className="section__title white-title">
                                    <h2 className="title tg-svg">Join us  <span className="position-relative"><span className="svg-icon" id="svg-9" data-svg-icon="assets/img/icons/title_shape.svg" />Spread</span>
                                        Experiences</h2>
                                </div>
                                <div className="cta__desc">
                                    <p>Borem ipsum dolor sit amet, consectetur adipiscing eliawe awUt elit ellus, luctus nec
                                        ullamcorper mattisBorem</p>
                                </div>
                                <div className="tg-button-wrap justify-content-center justify-content-md-end">
                                    <Link href="/contact" className="btn white-btn tg-svg"><span className="text">Become an
                                        Instructor</span> <span className="svg-icon" id="cta-btn" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
                                </div>
                                <img className="object" src="/assets/img/objects/cta_shape01.svg" style={{ left: 25, top: '-35px' }} alt="Object" data-aos="fade-down" data-aos-delay={400} />
                                <img className="object" src="/assets/img/objects/cta_shape02.svg" style={{ right: '-20px', bottom: '-80px' }} alt="Object" data-aos="fade-up" data-aos-delay={400} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
