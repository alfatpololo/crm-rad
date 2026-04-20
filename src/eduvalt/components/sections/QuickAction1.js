import Link from "next/link"

export default function QuickAction1() {
    return (
        <>
            <section className="quick__action-area section-pt-100 section-pb-70">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6 col-md-10 col-sm-11">
                            <div className="quick__action-item" data-background="/assets/img/bg/quick_action01.jpg">
                                <div className="quick__action-content">
                                    <h4 className="title">Best Instructors from around <br /> the world</h4>
                                    <div className="tg-button-wrap">
                                        <Link href="/contact" className="btn white-btn tg-svg"><span className="text">Register
                                            Now</span> <span className="svg-icon" id="reg-btn" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-10 col-sm-11">
                            <div className="quick__action-item" data-background="/assets/img/bg/quick_action02.jpg">
                                <div className="quick__action-content">
                                    <h4 className="title">Get unlimited access to 6,000+ of courses</h4>
                                    <div className="tg-button-wrap">
                                        <Link href="/about-us" className="btn white-btn tg-svg"><span className="text">Discover
                                            Now</span> <span className="svg-icon" id="discover-btn" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
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
