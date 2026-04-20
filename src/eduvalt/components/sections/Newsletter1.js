export default function Newsletter1() {
    return (
        <>
            <section className="newsletter-area section-py-55">
                <div className="container">
                    <div className="row align-items-center justify-content-center">
                        <div className="col-xl-6 col-lg-4">
                            <div className="newsletter__img-wrap">
                                <div className="newsletter__img" data-aos="fade-right">
                                    <img src="/assets/img/others/newsletter.png" alt="img" />
                                </div>
                                <div className="newsletter__content">
                                    <h4 className="title">Let’s Join To <br /> Our Newsletters</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-7">
                            <div className="newsletter__form">
                                <form action="#">
                                    <input type="email" placeholder="Enter your email" required />
                                    <button type="submit">Subscribe Now</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
