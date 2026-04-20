import Link from "next/link"

export default function Categories2() {
    return (
        <>
            <section className="categories-area section-pb-90">
                <div className="container">
                    <div className="row align-items-center justify-content-center mb-55">
                        <div className="col-xl-7 col-lg-8 col-md-10">
                            <div className="categories__title-wrap text-center text-lg-start m-0">
                                <div className="section__title mb-0">
                                    <span className="sub-title">Unique online courses</span>
                                    <h2 className="title tg-svg">Browse By <span className="position-relative"><span className="svg-icon" id="svg-5" data-svg-icon="assets/img/icons/title_shape.svg" />Categories</span>
                                    </h2>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-5 col-lg-4 col-md-6">
                            <div className="tg-button-wrap mt-4 mt-lg-0 justify-content-center justify-content-lg-end">
                                <Link href="/courses" className="btn btn-border tg-svg"><span className="text">All
                                    Categories</span> <span className="svg-icon" id="svg-6" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center row-cols-1 row-cols-sm-2 row-cols-md-3">
                        <div className="col">
                            <div className="categories__item-two tg-svg">
                                <Link href="/courses">
                                    <div className="icon">
                                        <span className="svg-icon" id="cat_svg1" data-svg-icon="assets/img/icons/categories_icon.svg" />
                                        <i className="flaticon-graphic-design" />
                                    </div>
                                    <div className="info">
                                        <span className="name">Graphic Design</span>
                                        <span className="courses">19 Courses</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className="col">
                            <div className="categories__item-two tg-svg">
                                <Link href="/courses">
                                    <div className="icon">
                                        <span className="svg-icon" id="cat_svg2" data-svg-icon="assets/img/icons/categories_icon.svg" />
                                        <i className="flaticon-email-marketing" />
                                    </div>
                                    <div className="info">
                                        <span className="name">Marketing</span>
                                        <span className="courses">10 Courses</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className="col">
                            <div className="categories__item-two tg-svg">
                                <Link href="/courses">
                                    <div className="icon">
                                        <span className="svg-icon" id="cat_svg3" data-svg-icon="assets/img/icons/categories_icon.svg" />
                                        <i className="flaticon-bars" />
                                    </div>
                                    <div className="info">
                                        <span className="name">Finance</span>
                                        <span className="courses">22 Courses</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className="col">
                            <div className="categories__item-two tg-svg">
                                <Link href="/courses">
                                    <div className="icon">
                                        <span className="svg-icon" id="cat_svg4" data-svg-icon="assets/img/icons/categories_icon.svg" />
                                        <i className="flaticon-programming-language" />
                                    </div>
                                    <div className="info">
                                        <span className="name">Web Development</span>
                                        <span className="courses">15 Courses</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className="col">
                            <div className="categories__item-two tg-svg">
                                <Link href="/courses">
                                    <div className="icon">
                                        <span className="svg-icon" id="cat_svg5" data-svg-icon="assets/img/icons/categories_icon.svg" />
                                        <i className="flaticon-atom" />
                                    </div>
                                    <div className="info">
                                        <span className="name">Science</span>
                                        <span className="courses">14 Courses</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                        <div className="col">
                            <div className="categories__item-two tg-svg">
                                <Link href="/courses">
                                    <div className="icon">
                                        <span className="svg-icon" id="cat_svg6" data-svg-icon="assets/img/icons/categories_icon.svg" />
                                        <i className="flaticon-camera" />
                                    </div>
                                    <div className="info">
                                        <span className="name">Photography</span>
                                        <span className="courses">24 Courses</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="categories__shapes-two">
                    <div className="categories__shapes-item-two rotateme">
                        <img src="/assets/img/objects/categories_shape05.png" alt="shape" />
                    </div>
                    <div className="categories__shapes-item-two" data-aos="fade-up">
                        <img src="/assets/img/objects/categories_shape02.png" alt="shape" />
                    </div>
                </div>
            </section>
        </>
    )
}
