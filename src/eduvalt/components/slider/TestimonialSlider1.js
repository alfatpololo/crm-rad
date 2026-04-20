export default function TestimonialSlider1() {
    return (
        <>
            <div className="row align-items-xl-center">
                <div className="col-lg-5 col-md-7 col-sm-9">
                    <div className="testimonial__image-wrapper position-relative">
                        <div className="testimonial__image-active">
                            <div className="testimonial__image-item">
                                <img src="/assets/img/others/testimonial01.jpg" alt="img" />
                            </div>
                        </div>
                        <div className="testimonial__shapes">
                            <img src="/assets/img/objects/testi_shape01.svg" alt="shape" data-aos="fade-up-left" data-aos-delay={300} />
                            <img src="/assets/img/objects/testi_shape02.svg" alt="shape" data-aos="fade-up-right" data-aos-delay={300} />
                            <img src="/assets/img/objects/testi_shape03.svg" alt="shape" className="rotateme" />
                        </div>
                    </div>
                </div>
                <div className="col-lg-7">
                    <div className="testimonial__content-wrapper">
                        <div className="section__title white-title mb-40">
                            <h2 className="title tg-svg">What Our <span className="position-relative"><span className="svg-icon" id="svg-7" data-svg-icon="assets/img/icons/title_shape.svg" />Students</span><br />
                                Say About Us</h2>
                        </div>
                        <div className="testimonial__content-active testimonial__content-nav">
                            <div className="testimonial__content-item">
                                <div className="testimonial__content-icon">
                                    <img src="/assets/img/icons/quote.png" alt="img" />
                                </div>
                                <p>“ when an unknown printer took a galley of type and scrambled to make a type
                                    specimen book. It has survived not only five centuries, but also the leap into
                                    electronic.”</p>
                                <div className="testimonial__content-avatar">
                                    <h5 className="name">Parker Robert</h5>
                                    <span className="designation">UI Designer</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};


