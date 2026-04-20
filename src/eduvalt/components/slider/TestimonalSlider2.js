import Slider from "react-slick"

const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    autoplay: false,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: (
        <button type="button" className="slick-prev">
            <i className="flaticon-chevron"></i>
        </button>
    ),
    nextArrow: (
        <button type="button" className="slick-next">
            <i className="flaticon-chevron"></i>
        </button>
    ),
}

export default function TestimonalSlider2() {
    return (
        <>
            <Slider {...settings} className="testimonial-active">
                <div className="testimonial__item">
                    <div className="testimonial__quote">
                        <img src="/assets/img/icons/quote02.png" alt="icon" />
                    </div>
                    <div className="testimonial__rating">
                        <i className="fas fa-star" />
                        <i className="fas fa-star" />
                        <i className="fas fa-star" />
                        <i className="fas fa-star" />
                        <i className="fas fa-star" />
                    </div>
                    <p>“ when an unknown printer took a galley type and scrambled atype specimen
                        book. It has survived not centuries leapelectronic types essentially
                        unchanged. “</p>
                    <div className="testimonial__avatar">
                        <h4 className="name">Parker Robert</h4>
                        <span className="designation">UI Designer</span>
                    </div>
                </div>
                <div className="testimonial__item">
                    <div className="testimonial__quote">
                        <img src="/assets/img/icons/quote02.png" alt="icon" />
                    </div>
                    <div className="testimonial__rating">
                        <i className="fas fa-star" />
                        <i className="fas fa-star" />
                        <i className="fas fa-star" />
                        <i className="fas fa-star" />
                        <i className="fas fa-star" />
                    </div>
                    <p>“ when an unknown printer took a galley type and scrambled atype specimen
                        book. It has survived not centuries leapelectronic types essentially
                        unchanged. “</p>
                    <div className="testimonial__avatar">
                        <h4 className="name">Harry Protar</h4>
                        <span className="designation">Web Designer</span>
                    </div>
                </div>
            </Slider>
        </>
    )
}
