import Link from "next/link"
import CourseSlider1 from "../slider/CourseSlider1"

export default function Course3() {
    return (
        <>
            <section className="courses-area-three position-relative section-pb-90">
                <div className="container">
                    <div className="section__title-wrap mb-50">
                        <div className="row align-items-end">
                            <div className="col-lg-7">
                                <div className="section__title text-center text-lg-start">
                                    <span className="sub-title">10,000+ Unique Online Courses</span>
                                    <h2 className="title tg-svg">Recent <span className="position-relative"><span className="svg-icon" id="svg-4" data-svg-icon="assets/img/icons/title_shape.svg" />Trending</span>
                                        Courses</h2>
                                </div>
                            </div>
                            <div className="col-lg-5">
                                <div className="tg-button-wrap mt-4 mt-lg-0 justify-content-center justify-content-lg-end">
                                    <Link href="/courses" className="btn btn-border tg-svg"><span className="text">View All
                                        Courses</span> <span className="svg-icon" id="course-btn" data-svg-icon="assets/img/icons/btn-arrow.svg" /></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CourseSlider1 />
                </div>
                <div className="courses__shapes">
                    <div className="courses__shapes-item alltuchtopdown"><img src="/assets/img/courses/course_shape01.png" alt="shape" /></div>
                    <div className="courses__shapes-item alltuchtopdown"><img src="/assets/img/courses/course_shape02.png" alt="shape" /></div>
                </div>
            </section>
        </>
    )
}
