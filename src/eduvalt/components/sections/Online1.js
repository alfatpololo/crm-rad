import Link from "next/link"

export default function Online1() {
    return (
        <>
            <section className="online-area tg-motion-effects">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-7 col-lg-7">
                            <div className="online__image-wrap">
                                <div className="main-img">
                                    <img src="/assets/img/others/online_img.jpg" alt="img" />
                                </div>
                                <div className="enrolled__students position-absolute">
                                    <p><span>36K+</span> Enrolled Students</p>
                                    <ul className="list-wrap">
                                        <li><img src="/assets/img/others/student01.png" alt="img" /></li>
                                        <li><img src="/assets/img/others/student02.png" alt="img" /></li>
                                        <li><img src="/assets/img/others/student03.png" alt="img" /></li>
                                        <li><img src="/assets/img/others/student04.png" alt="img" /></li>
                                        <li><img src="/assets/img/others/student05.png" alt="img" /></li>
                                        <li><img src="/assets/img/others/student06.png" alt="img" /></li>
                                    </ul>
                                </div>
                                <img src="/assets/img/icons/online_icons.png" alt="img" className="icons position-absolute" />
                                <img src="/assets/img/objects/online_01.png" alt="shape" className="left-shape position-absolute tg-motion-effects3" />
                                <img src="/assets/img/objects/online_02.png" alt="shape" className="top-shape position-absolute tg-motion-effects4" />
                                <img src="/assets/img/objects/online_03.svg" alt="shape" className="svg-shape position-absolute tg-motion-effects6" />
                                <img src="/assets/img/objects/categories_shape02.png" alt="shape" className="bottom-shape position-absolute tg-motion-effects3" />
                            </div>
                        </div>
                        <div className="col-xl-5 col-lg-5">
                            <div className="online__content">
                                <div className="section__title">
                                    <span className="sub-title">Unique online courses</span>
                                    <h2 className="title">Online Learning <br /> Courses Designed <br /> For Real Life</h2>
                                </div>
                                <p>Borem ipsum dolor sit amet, consectetur adipiscing eliawe awUt elit ellus, luctus nec
                                    ullamcorper mattisBorem ipsum dolor awes atnse awctetur.</p>
                                <div className="tg-button-wrap">
                                    <Link href="/courses" className="btn tg-svg"><span className="text">See All Categories</span>
                                        <span className="svg-icon" id="online-btn" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
                                </div>
                                <img src="/assets/img/objects/online_04.png" alt="shape" className="right-shape position-absolute tg-motion-effects5" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
