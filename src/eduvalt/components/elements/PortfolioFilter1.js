import data from "@/util/courses.json"
import Link from "next/link"
import { useCallback, useMemo, useState } from "react"

export default function PortfolioFilter1() {
    const [filterKey, setFilterKey] = useState("*")
    const filteredData = useMemo(() => {
        if (filterKey === "*") return data
        return data.filter((item) => item.catcls === filterKey)
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
            <div className="row courses-active row-cols-1 row-cols-xl-3 row-cols-lg-2 row-cols-md-2 row-cols-sm-1">
                {filteredData.map((item, i) => (
                    <div className={`col grid-item ${item.catcls}`} key={i}>
                        <div className="courses__item shine__animate-item">
                            <div className="courses__item-thumb">
                                {item.category === "Marketing" && <Link href="#" className="courses__item-tag" style={{ backgroundColor: '#BC18E4' }}>{item.category}</Link>}
                                {item.category === "Design" && <Link href="#" className="courses__item-tag" style={{ backgroundColor: '#04BC53' }}>{item.category}</Link>}
                                {item.category === "Development" && <Link href="#" className="courses__item-tag" style={{ backgroundColor: '#FF109F' }}>{item.category}</Link>}
                                <Link href={`/course/${item.id}`} className="shine__animate-link">
                                    <img src={`/assets/img/courses/${item.logo}`} alt="img" />
                                </Link>
                            </div>
                            <div className="courses__item-content">
                                <ul className="courses__item-meta list-wrap">
                                    <li><i className="flaticon-file" /> 05 Lessons</li>
                                    <li><i className="flaticon-timer" /> 12h 30m</li>
                                    <li><i className="flaticon-user-1" /> Students</li>
                                </ul>
                                <h5 className="title"><Link href={`/course/${item.id}`}>{item.courseTitle}</Link></h5>
                                <div className="courses__item-rating">
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                    <i className="fas fa-star" />
                                    <span className="rating-count">(06)</span>
                                </div>
                                <div className="courses__item-bottom">
                                    <div className="author">
                                        <Link href="/instructor-details"><img src="/assets/img/courses/course_author.png" alt="img" /></Link>
                                        <Link href="/instructor-details">David Millar</Link>
                                    </div>
                                    <h5 className="price">$11.00</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}
