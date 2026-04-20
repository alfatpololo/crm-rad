import Link from "next/link"
import Slider from "react-slick"
const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    autoplay: true,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
}

export default function Slider1() {
    return (
        <>
            <section className="slider-area">
                <Slider {...settings} className="slider__active">
                    <div className="slider__item d-flex" data-background="/assets/img/banner/slider_bg01.jpg">
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-6 col-lg-8">
                                    <div className="slider__content">
                                        <span className="sub-title" data-delay-in=".2" data-duration-in="1.5">Any Time, Any Where To Do Discover Courses</span>
                                        <h2 className="title tg-svg" data-delay-in=".4" data-duration-in="1.5">Find The Best Suitable <span className="position-relative"><span className="svg-icon" id="slider-svg01" data-svg-icon="assets/img/icons/title_shape.svg" />Courses</span>
                                            From Here</h2>
                                        <ul className="list-wrap" data-delay-in=".6" data-duration-in="1.5">
                                            <li><i className="fas fa-check-circle" />You can access 7,900+ different courses
                                            </li>
                                            <li><i className="fas fa-check-circle" />Lifetime Access For All</li>
                                        </ul>
                                        <div className="tg-button-wrap" data-delay-in=".8" data-duration-in="1.5">
                                            <Link href="/courses" className="btn tg-svg"><span className="text">Explore
                                                Courses</span> <span className="svg-icon" id="slider-btn01" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <img src="/assets/img/objects/categories_shape02.png" alt="shape" width={108} className="top-shape" data-delay-in="1.2" data-duration-in="1.5" />
                        <img src="/assets/img/banner/slider_shape.png" alt="shape" className="bottom-shape" data-delay-in="1.2" data-duration-in="1.5" />
                    </div>
                    <div className="slider__item d-flex" data-background="/assets/img/banner/slider_bg02.jpg">
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-6 col-lg-8">
                                    <div className="slider__content">
                                        <span className="sub-title" data-delay-in=".2" data-duration-in="1.5">Any Time, Any Where To Do Discover Courses</span>
                                        <h2 className="title tg-svg" data-delay-in=".4" data-duration-in="1.5">Find The Best Suitable <span className="position-relative"><span className="svg-icon" id="slider-svg02" data-svg-icon="assets/img/icons/title_shape.svg" />Courses</span>
                                            From Here</h2>
                                        <ul className="list-wrap" data-delay-in=".6" data-duration-in="1.5">
                                            <li><i className="fas fa-check-circle" />You can access 7,900+ different courses
                                            </li>
                                            <li><i className="fas fa-check-circle" />Lifetime Access For All</li>
                                        </ul>
                                        <div className="tg-button-wrap" data-delay-in=".8" data-duration-in="1.5">
                                            <Link href="/courses" className="btn tg-svg"><span className="text">Explore
                                                Courses</span> <span className="svg-icon" id="slider-btn02" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <img src="/assets/img/objects/categories_shape02.png" alt="shape" width={108} className="top-shape" data-delay-in="1.2" data-duration-in="1.5" />
                        <img src="/assets/img/banner/slider_shape.png" alt="shape" className="bottom-shape" data-delay-in="1.2" data-duration-in="1.5" />
                    </div>
                    <div className="slider__item d-flex" data-background="/assets/img/banner/slider_bg03.jpg">
                        <div className="container">
                            <div className="row">
                                <div className="col-xl-6 col-lg-8">
                                    <div className="slider__content">
                                        <span className="sub-title" data-delay-in=".2" data-duration-in="1.5">Any Time, Any Where To Do Discover Courses</span>
                                        <h2 className="title tg-svg" data-delay-in=".4" data-duration-in="1.5">Find The Best Suitable <span className="position-relative"><span className="svg-icon" id="slider-svg03" data-svg-icon="assets/img/icons/title_shape.svg" />Courses</span>
                                            From Here</h2>
                                        <ul className="list-wrap" data-delay-in=".6" data-duration-in="1.5">
                                            <li><i className="fas fa-check-circle" />You can access 7,900+ different courses
                                            </li>
                                            <li><i className="fas fa-check-circle" />Lifetime Access For All</li>
                                        </ul>
                                        <div className="tg-button-wrap" data-delay-in=".8" data-duration-in="1.5">
                                            <Link href="/courses" className="btn tg-svg"><span className="text">Explore
                                                Courses</span> <span className="svg-icon" id="slider-btn03" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <img src="/assets/img/objects/categories_shape02.png" alt="shape" width={108} className="top-shape" data-delay-in="1.2" data-duration-in="1.5" />
                        <img src="/assets/img/banner/slider_shape.png" alt="shape" className="bottom-shape" data-delay-in="1.2" data-duration-in="1.5" />
                    </div>
                </Slider>
            </section>
        </>
    )
}
