import Link from 'next/link'
import Slider from "react-slick"

const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    autoplay: false,
    arrows: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    prevArrow: (
        <button type="button" className="slick-prev">
            <i className="fas fa-arrow-left"></i>
        </button>
    ),
    nextArrow: (
        <button type="button" className="slick-next">
            <i className="fas fa-arrow-right"></i>
        </button>
    ),
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
                slidesToShow: 2,
                slidesToScroll: 1,
                arrows: false,
            }
        },
        {
            breakpoint: 575,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
            }
        },
    ]
}

export default function ShopRelatedSlider1() {
    return (
        <>
            <Slider {...settings} className="row shop-active">
                <div className="col-lg-4">
                    <div className="shop-item">
                        <div className="shop-thumb">
                            <Link href="/shop-details"><img src="/assets/img/shop/shop_img01.jpg" alt="" /></Link>
                            <div className="shop-action">
                                <Link href="/shop-details"><i className="fas fa-shopping-cart" /></Link>
                                <Link href="/shop-details"><i className="far fa-eye" /></Link>
                                <Link href="/shop-details"><i className="far fa-heart" /></Link>
                            </div>
                        </div>
                        <div className="shop-content">
                            <h4 className="price">$13.00</h4>
                            <h3 className="title"><Link href="/shop-details">SEO Tricks  Tips</Link></h3>
                            <div className="rating">
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="shop-item">
                        <div className="shop-thumb">
                            <Link href="/shop-details"><img src="/assets/img/shop/shop_img02.jpg" alt="" /></Link>
                            <div className="shop-action">
                                <Link href="/shop-details"><i className="fas fa-shopping-cart" /></Link>
                                <Link href="/shop-details"><i className="far fa-eye" /></Link>
                                <Link href="/shop-details"><i className="far fa-heart" /></Link>
                            </div>
                        </div>
                        <div className="shop-content">
                            <h4 className="price">$15.00</h4>
                            <h3 className="title"><Link href="/shop-details">My Book Cover</Link></h3>
                            <div className="rating">
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="shop-item">
                        <div className="shop-thumb">
                            <Link href="/shop-details"><img src="/assets/img/shop/shop_img03.jpg" alt="" /></Link>
                            <div className="shop-action">
                                <Link href="/shop-details"><i className="fas fa-shopping-cart" /></Link>
                                <Link href="/shop-details"><i className="far fa-eye" /></Link>
                                <Link href="/shop-details"><i className="far fa-heart" /></Link>
                            </div>
                        </div>
                        <div className="shop-content">
                            <h4 className="price">$17.00</h4>
                            <h3 className="title"><Link href="/shop-details">Book Cover Design</Link></h3>
                            <div className="rating">
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="shop-item">
                        <div className="shop-thumb">
                            <Link href="/shop-details"><img src="/assets/img/shop/shop_img04.jpg" alt="" /></Link>
                            <div className="shop-action">
                                <Link href="/shop-details"><i className="fas fa-shopping-cart" /></Link>
                                <Link href="/shop-details"><i className="far fa-eye" /></Link>
                                <Link href="/shop-details"><i className="far fa-heart" /></Link>
                            </div>
                        </div>
                        <div className="shop-content">
                            <h4 className="price">$14.00</h4>
                            <h3 className="title"><Link href="/shop-details">EBook Cover Design</Link></h3>
                            <div className="rating">
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="shop-item">
                        <div className="shop-thumb">
                            <Link href="/shop-details"><img src="/assets/img/shop/shop_img05.jpg" alt="" /></Link>
                            <div className="shop-action">
                                <Link href="/shop-details"><i className="fas fa-shopping-cart" /></Link>
                                <Link href="/shop-details"><i className="far fa-eye" /></Link>
                                <Link href="/shop-details"><i className="far fa-heart" /></Link>
                            </div>
                        </div>
                        <div className="shop-content">
                            <h4 className="price">$19.00</h4>
                            <h3 className="title"><Link href="/shop-details">Create An EBook Cover</Link></h3>
                            <div className="rating">
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                                <i className="fas fa-star" />
                            </div>
                        </div>
                    </div>
                </div>
            </Slider>
        </>
    )
}
