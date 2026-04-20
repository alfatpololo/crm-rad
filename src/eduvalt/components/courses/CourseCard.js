import Link from "next/link"
const CourseCard = ({ item }) => {
    return (
        <>
            <div className="courses__item-two shine__animate-item">
                <div className="courses__item-two-thumb">
                    <Link href={`/course/${item.id}`} className="shine__animate-link">
                        <img src={`/assets/img/courses/${item.logo}`} alt="img" />
                    </Link>
                    <div className="author">
                    <Link href={`/course/${item.id}`}><img src="/assets/img/courses/course_author001.png" alt="img" /></Link>
                    </div>
                </div>
                <div className="courses__item-two-content">
                    <Link href="#" className="courses__item-tag" style={{ backgroundColor: '#E8F9EF', color: '#04BC53' }}>Graphic Design</Link>
                    <h5 className="title"><Link href={`/course/${item.id}`}>Bigener Adobe Illustrator for
                        Graphic Design</Link></h5>
                    <ul className="courses__item-meta list-wrap">
                        <li><i className="flaticon-file" /> 05</li>
                        <li><i className="flaticon-timer" /> 12h 30m</li>
                        <li><i className="flaticon-user-1" /> 35</li>
                    </ul>
                    <div className="courses__item-bottom">
                        <div className="course__price">
                            <h3 className="price">$29.00</h3>
                        </div>
                        <div className="courses__item-rating">
                            <i className="fas fa-star" />
                            <span className="rating-count">(4.2)</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CourseCard