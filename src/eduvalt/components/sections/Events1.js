import Link from "next/link"

export default function Events1() {
    return (
        <>
            <section className="events-area position-relative section-pt-120 section-pb-90">
                <div className="container">
                    <div className="section__title-wrap mb-55">
                        <div className="row align-items-center gap-4 gap-md-0">
                            <div className="col-md-8">
                                <div className="section__title text-center text-md-start">
                                    <span className="sub-title">Featured Events</span>
                                    <h2 className="title tg-svg">Upcoming <span className="position-relative"><span className="svg-icon" id="event-svg" data-svg-icon="assets/img/icons/title_shape.svg" />Events</span></h2>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="tg-button-wrap justify-content-center justify-content-md-end">
                                    <Link href="/instructor" className="btn btn-border tg-svg"><span className="text">Our All
                                        Events</span> <span className="svg-icon" id="events-btn" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-lg-4 col-md-6 col-sm-10">
                            <div className="events__item shine__animate-item">
                                <div className="events__item-thumb">
                                    <Link href="/events-details" className="shine__animate-link">
                                        <img src="/assets/img/events/event_thumb01.jpg" alt="img" />
                                    </Link>
                                    <span className="events__date"><i className="flaticon-calendar-date" /> 25 May, 2023</span>
                                </div>
                                <div className="events__item-content">
                                    <h4 className="title"><Link href="/events-details">Aewe Creating Futures Through
                                        Technology Conference</Link></h4>
                                    <span className="location"><i className="flaticon-pin-1" /> United Kingdom</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-10">
                            <div className="events__item shine__animate-item">
                                <div className="events__item-thumb">
                                    <Link href="/events-details" className="shine__animate-link">
                                        <img src="/assets/img/events/event_thumb02.jpg" alt="img" />
                                    </Link>
                                    <span className="events__date"><i className="flaticon-calendar-date" /> 25 May, 2023</span>
                                </div>
                                <div className="events__item-content">
                                    <h4 className="title"><Link href="/events-details">Exactly How Technology Can Make Reading
                                        Better</Link></h4>
                                    <span className="location"><i className="flaticon-pin-1" /> Tokyo Japan</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6 col-sm-10">
                            <div className="events__item shine__animate-item">
                                <div className="events__item-thumb">
                                    <Link href="/events-details" className="shine__animate-link">
                                        <img src="/assets/img/events/event_thumb03.jpg" alt="img" />
                                    </Link>
                                    <span className="events__date"><i className="flaticon-calendar-date" /> 25 May, 2023</span>
                                </div>
                                <div className="events__item-content">
                                    <h4 className="title"><Link href="/events-details">Aewe Creating Futures Through
                                        Technology Conference</Link></h4>
                                    <span className="location"><i className="flaticon-pin-1" /> New Work</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mentors__shapes">
                    <img src="/assets/img/objects/mentors_shape01.png" alt="shape" />
                    <img src="/assets/img/objects/events_shape.png" width={98} alt="shape" />
                </div>
            </section>
        </>
    )
}
