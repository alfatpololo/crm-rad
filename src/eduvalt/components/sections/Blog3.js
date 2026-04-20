import Link from "next/link"

export default function Blog3() {
    return (
        <>
            <section className="blog-area-two section-pt-120 section-pb-90">
                <div className="container">
                    <div className="section__title-wrap mb-55">
                        <div className="row align-items-center gap-4 gap-md-0">
                            <div className="col-md-8">
                                <div className="section__title text-center text-md-start">
                                    <span className="sub-title">Always Smart To Hear News</span>
                                    <h2 className="title tg-svg">Our Latest <span className="position-relative"><span className="svg-icon" id="blog-two-svg" data-svg-icon="assets/img/icons/title_shape.svg" />Blog</span></h2>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="tg-button-wrap justify-content-center justify-content-md-end">
                                    <Link href="/blog-grid" className="btn btn-border tg-svg"><span className="text">See All
                                        Posts</span> <span className="svg-icon" id="blog-two-btn" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-xl-4 col-md-6">
                            <div className="blog__post-item-four shine__animate-item">
                                <div className="blog__post-thumb-two">
                                    <Link href="/blog-details" className="shine__animate-link">
                                        <img src="/assets/img/blog/blog_standard02.jpg" alt="img" />
                                    </Link>
                                </div>
                                <div className="blog__post-content-two">
                                    <Link href="#" className="cat">Education</Link>
                                    <h4 className="title"><Link href="/blog-details">When printer took are gallery of
                                        scrambled</Link></h4>
                                    <ul className="list-wrap blog__post-meta">
                                        <li><i className="flaticon-account" /> by <Link href="#">Admin</Link></li>
                                        <li><i className="flaticon-calendar-date" /> 23 Aug, 2023</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-md-6">
                            <div className="blog__post-item-four shine__animate-item">
                                <div className="blog__post-thumb-two">
                                    <Link href="/blog-details" className="shine__animate-link">
                                        <img src="/assets/img/blog/blog_standard03.jpg" alt="img" />
                                    </Link>
                                </div>
                                <div className="blog__post-content-two">
                                    <Link href="#" className="cat">Development</Link>
                                    <h4 className="title"><Link href="/blog-details">The Growing Need For Effective
                                        Password</Link></h4>
                                    <ul className="list-wrap blog__post-meta">
                                        <li><i className="flaticon-account" /> by <Link href="#">Admin</Link></li>
                                        <li><i className="flaticon-calendar-date" /> 23 Aug, 2023</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-md-6">
                            <div className="blog__post-item-four shine__animate-item">
                                <div className="blog__post-thumb-two">
                                    <Link href="/blog-details" className="shine__animate-link">
                                        <img src="/assets/img/blog/blog_standard04.jpg" alt="img" />
                                    </Link>
                                </div>
                                <div className="blog__post-content-two">
                                    <Link href="#" className="cat">Management</Link>
                                    <h4 className="title"><Link href="/blog-details">Make Your Magnificent Wallpapers
                                        Edition</Link></h4>
                                    <ul className="list-wrap blog__post-meta">
                                        <li><i className="flaticon-account" /> by <Link href="#">Admin</Link></li>
                                        <li><i className="flaticon-calendar-date" /> 23 Aug, 2023</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <img className="object" src="/assets/img/objects/blog_shape03.png" width={76} style={{ left: '8%', top: '32%' }} alt="Object" />
                <img className="object rotateme" src="/assets/img/objects/blog_shape04.png" width={66} style={{ right: '9%', bottom: '23%' }} alt="Object" />
            </section>
        </>
    )
}
