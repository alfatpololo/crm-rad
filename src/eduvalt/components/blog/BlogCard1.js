import Link from "next/link"

export default function BlogCard1({ item }) {
    return (
        <>
            <div className="col-lg-4 col-md-6 col-sm-9">
                <div className="blog__post-item shine__animate-item">
                    <div className="blog__post-thumb">
                        <Link href={`/blog/${item.id}`} className="shine__animate-link"><img src={`/assets/img/blog/${item.img}`} alt="img" /></Link>
                    </div>
                    <div className="blog__post-content">
                        <Link href="#" className="cat">{item.category}</Link>
                        <h4 className="title"><Link href={`/blog/${item.id}`}>{item.title}</Link></h4>
                        <ul className="list-wrap blog__post-meta">
                            <li><i className="flaticon-account" /> by <Link href="#">{item.author}</Link></li>
                            <li><i className="flaticon-calendar-date" /> 23 Aug, 2023</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}
