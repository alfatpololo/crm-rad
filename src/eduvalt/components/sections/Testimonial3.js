import TestimonalSlider2 from "../slider/TestimonalSlider2"

export default function Testimonial3() {
    return (
        <>
            <section className="testimonial-area position-relative section-pt-120 section-pb-57">
                <div className="container">
                    <div className="testimonial__wrapper">
                        <div className="row justify-content-center">
                            <div className="col-xl-6 col-lg-7 col-md-8">
                                <div className="section__title text-center">
                                    <span className="sub-title">Our Testimonials</span>
                                    <h2 className="title tg-svg">What’s Our <span className="position-relative"><span className="svg-icon" id="testimonial-svg" data-svg-icon="assets/img/icons/title_shape.svg" />Student</span>
                                        Think</h2>
                                </div>
                            </div>
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-xl-9 col-lg-11">
                                <TestimonalSlider2 />
                            </div>
                        </div>
                        <div className="testimonial__avatars">
                            <img src="/assets/img/others/testi01.png" alt="img" data-aos="zoom-in" data-aos-delay={200} />
                            <img src="/assets/img/others/testi02.png" alt="img" data-aos="zoom-in" data-aos-delay={300} />
                            <img src="/assets/img/others/testi03.png" alt="img" data-aos="zoom-in" data-aos-delay={400} />
                            <img src="/assets/img/others/testi04.png" alt="img" data-aos="zoom-in" data-aos-delay={500} />
                            <img src="/assets/img/others/testi05.png" alt="img" data-aos="zoom-in" data-aos-delay={600} />
                            <img src="/assets/img/others/testi06.png" alt="img" data-aos="zoom-in" data-aos-delay={700} />
                        </div>
                    </div>
                </div>
                <div className="testimonial__shapes-two">
                    <img className="object" src="/assets/img/objects/blog_shape01.png" width={97} alt="Object" />
                    <img className="object rotateme" src="/assets/img/objects/blog_shape02.png" width={66} alt="Object" />
                </div>
            </section>
        </>
    )
}
