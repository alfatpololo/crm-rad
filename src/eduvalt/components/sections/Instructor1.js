import Link from "next/link"

export default function Instructor1() {
    return (
        <>
            <section className="instructor-area section-pt-120 section-pb-70">
                <div className="container">
                    <div className="section__title-wrap">
                        <div className="row align-items-center gap-4 gap-md-0">
                            <div className="col-md-8">
                                <div className="section__title text-center text-md-start">
                                    <span className="sub-title">Our Qualified People Matter</span>
                                    <h2 className="title tg-svg">Top <span className="position-relative"><span className="svg-icon" id="svg-8" data-svg-icon="assets/img/icons/title_shape.svg" />Class</span>
                                        instructor</h2>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="tg-button-wrap justify-content-center justify-content-md-end">
                                    <Link href="/instructor" className="btn tg-svg"><span className="text">All Instructors</span>
                                        <span className="svg-icon" id="instructor-btn" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-xl-3 col-lg-4 col-sm-6">
                            <div className="instructor__item">
                                <div className="instructor__img">
                                    <div className="instructor__shape" style={{ backgroundColor: '#E2FAFF', borderRadius: '135px 0 0 0' }} />
                                    <Link href="/instructor-details"><img src="/assets/img/instructor/instructor01.png" alt="instructor" /></Link>
                                </div>
                                <div className="instructor__content">
                                    <div className="left">
                                        <span className="designation">Graphic Design</span>
                                        <h4 className="name"><Link href="/instructor-details">Robert Smith</Link></h4>
                                    </div>
                                    <div className="right">
                                        <span className="share"><i className="flaticon-share" /></span>
                                        <ul className="social-list list-wrap">
                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-linkedin-in" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-youtube" /></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-sm-6">
                            <div className="instructor__item">
                                <div className="instructor__img">
                                    <div className="instructor__shape" style={{ backgroundColor: '#E4FFE2', borderRadius: '135px 115px 115px 0' }} />
                                    <Link href="/instructor-details"><img src="/assets/img/instructor/instructor02.png" alt="instructor" /></Link>
                                </div>
                                <div className="instructor__content">
                                    <div className="left">
                                        <span className="designation">Web Design</span>
                                        <h4 className="name"><Link href="/instructor-details">Olivia Mia</Link></h4>
                                    </div>
                                    <div className="right">
                                        <span className="share"><i className="flaticon-share" /></span>
                                        <ul className="social-list list-wrap">
                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-linkedin-in" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-youtube" /></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-sm-6">
                            <div className="instructor__item">
                                <div className="instructor__img">
                                    <div className="instructor__shape" style={{ backgroundColor: '#E8EDFF', borderRadius: '135px 0 0 0' }} />
                                    <Link href="/instructor-details"><img src="/assets/img/instructor/instructor03.png" alt="instructor" /></Link>
                                </div>
                                <div className="instructor__content">
                                    <div className="left">
                                        <span className="designation">Digital Marketing</span>
                                        <h4 className="name"><Link href="/instructor-details">William Hope</Link></h4>
                                    </div>
                                    <div className="right">
                                        <span className="share"><i className="flaticon-share" /></span>
                                        <ul className="social-list list-wrap">
                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-linkedin-in" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-youtube" /></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-3 col-lg-4 col-sm-6">
                            <div className="instructor__item">
                                <div className="instructor__img">
                                    <div className="instructor__shape" style={{ backgroundColor: '#FFE2E2', borderRadius: '135px 115px 115px 0' }} />
                                    <Link href="/instructor-details"><img src="/assets/img/instructor/instructor04.png" alt="instructor" /></Link>
                                </div>
                                <div className="instructor__content">
                                    <div className="left">
                                        <span className="designation">Web Development</span>
                                        <h4 className="name"><Link href="/instructor-details">Sophia Ava</Link></h4>
                                    </div>
                                    <div className="right">
                                        <span className="share"><i className="flaticon-share" /></span>
                                        <ul className="social-list list-wrap">
                                            <li><Link href="#"><i className="fab fa-facebook-f" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-twitter" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-linkedin-in" /></Link></li>
                                            <li><Link href="#"><i className="fab fa-youtube" /></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
