import Link from "next/link"
import { useState } from "react"
export default function MobileMenu() {
    const [isActive, setIsActive] = useState({
        status: false,
        key: "",
    })

    const handleToggle = (key) => {
        if (isActive.key === key) {
            setIsActive({
                status: false,
            })
        } else {
            setIsActive({
                status: true,
                key,
            })
        }
    }

    return (
        <>
            <ul className="navigation">
                <li className="active"><Link href="/">Home</Link></li>
                <li className="menu-item-has-children"><Link href="#">Courses</Link>
                    <ul className="sub-menu" style={{ display: `${isActive.key == 2 ? "block" : "none"}` }}>
                        <li><Link href="/courses">All Courses</Link></li>
                        <li><Link href="/course-details">Course Details</Link></li>
                    </ul>
                    <div className={isActive.key == 2 ? "dropdown-btn open" : "dropdown-btn"} onClick={() => handleToggle(2)}><span className="plus-line" /></div></li>
                <li className="menu-item-has-children"><Link href="#">Pages</Link>
                    <ul className="sub-menu" style={{ display: `${isActive.key == 3 ? "block" : "none"}` }}>
                        <li><Link href="/about-us">About Us</Link></li>
                        <li><Link href="/instructors">Our Instructors</Link></li>
                        <li><Link href="/instructor-details">Instructor Details</Link></li>
                        <li><Link href="/mentors">Our Mentors</Link></li>
                        <li><Link href="/events">Our Events</Link></li>
                        <li><Link href="/events-details">Event Details</Link></li>
                        <li><Link href="/faq">Asked Question</Link></li>
                        <li><Link href="/404">404 Page</Link></li>
                        <li><Link href="/contact">contact</Link></li>
                    </ul>
                    <div className={isActive.key == 3 ? "dropdown-btn open" : "dropdown-btn"} onClick={() => handleToggle(3)}><span className="plus-line" /></div></li>
                <li className="menu-item-has-children"><Link href="#">Shop</Link>
                    <ul className="sub-menu" style={{ display: `${isActive.key == 4 ? "block" : "none"}` }}>
                        <li><Link href="/shop">Shop Page</Link></li>
                        <li><Link href="/shop-details">Shop Details</Link></li>
                    </ul>
                    <div className={isActive.key == 4 ? "dropdown-btn open" : "dropdown-btn"} onClick={() => handleToggle(4)}><span className="plus-line" /></div></li>
                <li className="menu-item-has-children"><Link href="#">Blog</Link>
                    <ul className="sub-menu" style={{ display: `${isActive.key == 5 ? "block" : "none"}` }}>
                        <li><Link href="/blog-grid">Blog Grid</Link></li>
                        <li><Link href="/blog">Blog Standard</Link></li>
                        <li><Link href="/blog-details">Blog Details</Link></li>
                    </ul>
                    <div className={isActive.key == 5 ? "dropdown-btn open" : "dropdown-btn"} onClick={() => handleToggle(5)}><span className="plus-line" /></div>
                </li>
            </ul>
        </>
    )
}
