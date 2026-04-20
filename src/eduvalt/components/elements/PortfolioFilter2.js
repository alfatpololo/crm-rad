
import data from "@/util/courses"
import Isotope from "isotope-layout"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
export default function PortfolioFilter1() {
    // Isotope
    const isotope = useRef()
    const [filterKey, setFilterKey] = useState("*")

    useEffect(() => {
        setTimeout(() => {
            isotope.current = new Isotope(".courses-active", {
                itemSelector: ".grid-item",
                // layoutMode: "fitRows",
                percentPosition: true,
                masonry: {
                    columnWidth: ".grid-item",
                },
                animationOptions: {
                    duration: 750,
                    easing: "linear",
                    queue: false,
                },
            })
        }, 1000)
    }, [])

    useEffect(() => {
        if (isotope.current) {
            filterKey === "*"
                ? isotope.current.arrange({ filter: `*` })
                : isotope.current.arrange({ filter: `.${filterKey}` })
        }
    }, [filterKey])

    const handleFilterKeyChange = useCallback((key) => () => {
        setFilterKey(key)
    },
        []
    )

    const activeBtn = (value) => (value === filterKey ? "active" : "")

    return (
        <>
            <div className="section__title-wrap">
                <div className="row align-items-end">
                    <div className="col-lg-6">
                        <div className="section__title text-center text-lg-start">
                            <span className="sub-title">10,000+ Unique Online Courses</span>
                            <h2 className="title tg-svg">Our <span className="position-relative"><span className="svg-icon" id="svg-4" data-svg-icon="assets/img/icons/title_shape.svg" />Featured</span>
                                Courses</h2>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="courses__nav-active">
                            <button className={activeBtn("*")} onClick={handleFilterKeyChange("*")}>All Courses <span>New</span></button>
                            <button className={activeBtn("cat-one")} onClick={handleFilterKeyChange("cat-one")}>Design</button>
                            <button className={activeBtn("cat-two")} onClick={handleFilterKeyChange("cat-two")}>Marketing</button>
                            <button className={activeBtn("cat-three")} onClick={handleFilterKeyChange("cat-three")}>Development</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row courses-active row-cols-1 row-cols-xl-4 row-cols-lg-3 row-cols-md-2 row-cols-sm-1">
                {data.map((item, i) => (
                    <div className={`col grid-item ${item.catcls}`} key={i}>
                        <div className="courses__item-two shine__animate-item">
                            <div className="courses__item-two-thumb">
                                <Link href={`/course/${item.id}`} className="shine__animate-link">
                                    <img src={`/assets/img/courses/${item.logo}`} alt="img" />
                                </Link>
                                <div className="course__price">
                                    <svg viewBox="0 0 104 34" fill="none" x="0px" y="0px" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M17.5689 2.56089L0 34H99C101.761 34 104 31.7614 104 29V0H21.9336C20.1223 0 18.4525 0.979667 17.5689 2.56089Z" fill="currentColor" />
                                    </svg>
                                    <h3 className="price">$29.00</h3>
                                </div>
                            </div>
                            <div className="courses__item-two-content">
                                <Link href="#" className="courses__item-tag" style={{ backgroundColor: '#E8F9EF', color: '#04BC53' }}>{item.category}</Link>
                                <h5 className="title"><Link href={`/course/${item.id}`}>{item.courseTitle}</Link></h5>
                                <ul className="courses__item-meta list-wrap">
                                    <li><i className="flaticon-file" /> 05</li>
                                    <li><i className="flaticon-timer" /> 12h 30m</li>
                                    <li><i className="flaticon-user-1" /> 35</li>
                                </ul>
                                <div className="courses__item-bottom">
                                    <div className="author">
                                        <Link href="#"><img src="/assets/img/courses/course_author.png" alt="img" /></Link>
                                        <Link href="#">David Millar</Link>
                                    </div>
                                    <div className="courses__item-rating">
                                        <i className="fas fa-star" />
                                        <span className="rating-count">(4.2)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
