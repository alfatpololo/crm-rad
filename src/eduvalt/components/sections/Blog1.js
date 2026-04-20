import Link from "next/link"
import BlogPost from "../blog/BlogPost"

export default function Blog1() {
    return (
        <>
            <section className="blog-area blog-bg-circle section-pt-205 section-pb-90">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-xl-6 col-lg-7 col-md-8">
                            <div className="section__title text-center mb-40">
                                <span className="sub-title">Always Smart To Hear News</span>
                                <h2 className="title tg-svg">Latest <span className="position-relative"><span className="svg-icon" id="svg-10" data-svg-icon="assets/img/icons/title_shape.svg" />News</span>
                                    Blog</h2>
                                <p className="desc">Receive huge benefits with our lifetime Plumbing Receive huge benefits with
                                    our lifetime Plumbing email address will be shown</p>
                            </div>
                        </div>
                    </div>
                    <div className="row justify-content-center">
                        <BlogPost style={1} showItem={3}/>
                    </div>
                </div>
                <img className="object" src="/assets/img/objects/blog_shape01.png" width={97} style={{ left: '8%', top: '32%' }} alt="Object" />
                <img className="object rotateme" src="/assets/img/objects/blog_shape02.png" width={66} style={{ right: '9%', bottom: '23%' }} alt="Object" />
            </section>
        </>
    )
}
