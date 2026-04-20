import Link from "next/link"
import Slider from "react-slick"

const SlickArrowLeft = ({ currentSlide, slideCount, ...props }) => (
    <button
      {...props}
      className={
        "slick-prev slick-arrow slick-prev" +
        (currentSlide === 0 ? " slick-disabled" : "")
      }
      aria-hidden="true"
      aria-disabled={currentSlide === 0 ? true : false}
      type="button"
    >
      <i className="fas fa-arrow-left"></i>
    </button>
  );
  const SlickArrowRight = ({ currentSlide, slideCount, ...props }) => (
    <button
      {...props}
      className={
        "slick-next slick-arrow" +
        (currentSlide === slideCount - 1 ? " slick-disabled" : "")
      }
      aria-hidden="true"
      aria-disabled={currentSlide === slideCount - 1 ? true : false}
      type="button"
    >
      <i className="fas fa-arrow-right"></i>
    </button>
  );


const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    autoplay: false,
    arrows: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    prevArrow: <SlickArrowLeft />,
    nextArrow: <SlickArrowRight />,
    responsive: [
        {
            breakpoint: 1200,
            settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                infinite: true,
            }
        },
        {
            breakpoint: 992,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 1
            }
        },
        {
            breakpoint: 767,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                centerMode: true,
                centerPadding: '110px',
                arrows: false,
            }
        },
        {
            breakpoint: 575,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                centerMode: false,
                centerPadding: '0',
            }
        },
    ]
}

export default function CourseSlider1() {
    return (
        <>
            <Slider {...settings} className="row courses-slider-active">
                <div className="col">
                    <div className="courses__item-two shine__animate-item">
                        <div className="courses__item-two-thumb">
                            <Link href="/course-details" className="shine__animate-link">
                                <img src="/assets/img/courses/course_thumb01.jpg" alt="img" />
                            </Link>
                            <div className="author">
                                <Link href="#"><img src="/assets/img/courses/course_author001.png" alt="img" /></Link>
                            </div>
                        </div>
                        <div className="courses__item-two-content">
                            <Link href="#" className="courses__item-tag" style={{ backgroundColor: '#E8F9EF', color: '#04BC53' }}>Graphic Design</Link>
                            <h5 className="title"><Link href="/course-details">Bigener Adobe Illustrator for
                                Graphic Design</Link></h5>
                            <ul className="courses__item-meta list-wrap">
                                <li><i className="flaticon-file" /> 05</li>
                                <li><i className="flaticon-timer" /> 12h 30m</li>
                                <li><i className="flaticon-user-1" /> 35</li>
                            </ul>
                            <div className="courses__item-bottom">
                                <div className="course__price">
                                    <h3 className="price">$29.00</h3>
                                </div>
                                <div className="courses__item-rating">
                                    <i className="fas fa-star" />
                                    <span className="rating-count">(4.2)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="courses__item-two shine__animate-item">
                        <div className="courses__item-two-thumb">
                            <Link href="/course-details" className="shine__animate-link">
                                <img src="/assets/img/courses/course_thumb02.jpg" alt="img" />
                            </Link>
                            <div className="author">
                                <Link href="#"><img src="/assets/img/courses/course_author002.png" alt="img" /></Link>
                            </div>
                        </div>
                        <div className="courses__item-two-content">
                            <Link href="#" className="courses__item-tag" style={{ backgroundColor: '#F7EEFA', color: '#BC18E4' }}>Marketing</Link>
                            <h5 className="title"><Link href="/course-details">How to Market Yourself as a
                                Coach or Consultant</Link></h5>
                            <ul className="courses__item-meta list-wrap">
                                <li><i className="flaticon-file" /> 08</li>
                                <li><i className="flaticon-timer" /> 16h 30m</li>
                                <li><i className="flaticon-user-1" /> 45</li>
                            </ul>
                            <div className="courses__item-bottom">
                                <div className="course__price">
                                    <h3 className="price">Free</h3>
                                </div>
                                <div className="courses__item-rating">
                                    <i className="fas fa-star" />
                                    <span className="rating-count">(4.8)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="courses__item-two shine__animate-item">
                        <div className="courses__item-two-thumb">
                            <Link href="/course-details" className="shine__animate-link">
                                <img src="/assets/img/courses/course_thumb03.jpg" alt="img" />
                            </Link>
                            <div className="author">
                                <Link href="#"><img src="/assets/img/courses/course_author003.png" alt="img" /></Link>
                            </div>
                        </div>
                        <div className="courses__item-two-content">
                            <Link href="#" className="courses__item-tag" style={{ backgroundColor: '#FFF0F9', color: '#FF109F' }}>Finance</Link>
                            <h5 className="title"><Link href="/course-details">Become a Certified JavaScript Web
                                Developer</Link></h5>
                            <ul className="courses__item-meta list-wrap">
                                <li><i className="flaticon-file" /> 12</li>
                                <li><i className="flaticon-timer" /> 19h 30m</li>
                                <li><i className="flaticon-user-1" /> 60</li>
                            </ul>
                            <div className="courses__item-bottom">
                                <div className="course__price">
                                    <h3 className="price"><del>$29.00</del>$12.00</h3>
                                </div>
                                <div className="courses__item-rating">
                                    <i className="fas fa-star" />
                                    <span className="rating-count">(4.7)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="courses__item-two shine__animate-item">
                        <div className="courses__item-two-thumb">
                            <Link href="/course-details" className="shine__animate-link">
                                <img src="/assets/img/courses/course_thumb04.jpg" alt="img" />
                            </Link>
                            <div className="author">
                                <Link href="#"><img src="/assets/img/courses/course_author004.png" alt="img" /></Link>
                            </div>
                        </div>
                        <div className="courses__item-two-content">
                            <Link href="#" className="courses__item-tag" style={{ backgroundColor: '#FFF3D3', color: '#F5B204' }}>Development</Link>
                            <h5 className="title"><Link href="/course-details">Web Development
                                Fully Complete Guideline</Link></h5>
                            <ul className="courses__item-meta list-wrap">
                                <li><i className="flaticon-file" /> 08</li>
                                <li><i className="flaticon-timer" /> 20h 00m</li>
                                <li><i className="flaticon-user-1" /> 40</li>
                            </ul>
                            <div className="courses__item-bottom">
                                <div className="course__price">
                                    <h3 className="price">Free</h3>
                                </div>
                                <div className="courses__item-rating">
                                    <i className="fas fa-star" />
                                    <span className="rating-count">(5.0)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="courses__item-two shine__animate-item">
                        <div className="courses__item-two-thumb">
                            <Link href="/course-details" className="shine__animate-link">
                                <img src="/assets/img/courses/course_thumb05.jpg" alt="img" />
                            </Link>
                            <div className="author">
                                <Link href="#"><img src="/assets/img/courses/course_author002.png" alt="img" /></Link>
                            </div>
                        </div>
                        <div className="courses__item-two-content">
                            <Link href="#" className="courses__item-tag" style={{ backgroundColor: '#F5F0FF', color: '#560EF0' }}>Photography</Link>
                            <h5 className="title"><Link href="/course-details">Photography
                                training for the Artist in you</Link></h5>
                            <ul className="courses__item-meta list-wrap">
                                <li><i className="flaticon-file" /> 10</li>
                                <li><i className="flaticon-timer" /> 20h 00m</li>
                                <li><i className="flaticon-user-1" /> 30</li>
                            </ul>
                            <div className="courses__item-bottom">
                                <div className="course__price">
                                    <h3 className="price"><del>$29.00</del>$16.00</h3>
                                </div>
                                <div className="courses__item-rating">
                                    <i className="fas fa-star" />
                                    <span className="rating-count">(4.9)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="courses__item-two shine__animate-item">
                        <div className="courses__item-two-thumb">
                            <Link href="/course-details" className="shine__animate-link">
                                <img src="/assets/img/courses/course_thumb06.jpg" alt="img" />
                            </Link>
                            <div className="author">
                                <Link href="#"><img src="/assets/img/courses/course_author004.png" alt="img" /></Link>
                            </div>
                        </div>
                        <div className="courses__item-two-content">
                            <Link href="#" className="courses__item-tag" style={{ backgroundColor: '#E8F9EF', color: '#04BC53' }}>Graphic Design</Link>
                            <h5 className="title"><Link href="/course-details">The Complete Guide to the
                                Global Capital Markets</Link></h5>
                            <ul className="courses__item-meta list-wrap">
                                <li><i className="flaticon-file" /> 09</li>
                                <li><i className="flaticon-timer" /> 16h 30m</li>
                                <li><i className="flaticon-user-1" /> 30</li>
                            </ul>
                            <div className="courses__item-bottom">
                                <div className="course__price">
                                    <h3 className="price"><del>$29.00</del>$16.00</h3>
                                </div>
                                <div className="courses__item-rating">
                                    <i className="fas fa-star" />
                                    <span className="rating-count">(5.0)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="courses__item-two shine__animate-item">
                        <div className="courses__item-two-thumb">
                            <Link href="/course-details" className="shine__animate-link">
                                <img src="/assets/img/courses/course_thumb07.jpg" alt="img" />
                            </Link>
                            <div className="author">
                                <Link href="#"><img src="/assets/img/courses/course_author001.png" alt="img" /></Link>
                            </div>
                        </div>
                        <div className="courses__item-two-content">
                            <Link href="#" className="courses__item-tag" style={{ backgroundColor: '#FFF3D3', color: '#F5B204' }}>Business</Link>
                            <h5 className="title"><Link href="/course-details">Bigener Adobe Illustrator for Graphic
                                Design</Link></h5>
                            <ul className="courses__item-meta list-wrap">
                                <li><i className="flaticon-file" /> 19</li>
                                <li><i className="flaticon-timer" /> 10h 30m</li>
                                <li><i className="flaticon-user-1" /> 18</li>
                            </ul>
                            <div className="courses__item-bottom">
                                <div className="course__price">
                                    <h3 className="price">$19.00</h3>
                                </div>
                                <div className="courses__item-rating">
                                    <i className="fas fa-star" />
                                    <span className="rating-count">(4.8)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="courses__item-two shine__animate-item">
                        <div className="courses__item-two-thumb">
                            <Link href="/course-details" className="shine__animate-link">
                                <img src="/assets/img/courses/course_thumb08.jpg" alt="img" />
                            </Link>
                            <div className="author">
                                <Link href="#"><img src="/assets/img/courses/course_author002.png" alt="img" /></Link>
                            </div>
                        </div>
                        <div className="courses__item-two-content">
                            <Link href="#" className="courses__item-tag" style={{ backgroundColor: '#DEF3FF', color: '#0496E9' }}>Technology</Link>
                            <h5 className="title"><Link href="/course-details">Bigener Adobe Illustrator for Graphic
                                Design</Link></h5>
                            <ul className="courses__item-meta list-wrap">
                                <li><i className="flaticon-file" /> 16</li>
                                <li><i className="flaticon-timer" /> 12h 00m</li>
                                <li><i className="flaticon-user-1" /> 19</li>
                            </ul>
                            <div className="courses__item-bottom">
                                <div className="course__price">
                                    <h3 className="price">$14.00</h3>
                                </div>
                                <div className="courses__item-rating">
                                    <i className="fas fa-star" />
                                    <span className="rating-count">(4.0)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Slider>
        </>
    )
}
