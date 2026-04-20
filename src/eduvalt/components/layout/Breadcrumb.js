import Link from "next/link"

export default function Breadcrumb({ breadcrumbTitle }) {
    return (
        <>
            <section className="breadcrumb-area breadcrumb-bg" data-background="/assets/img/bg/breadcrumb_bg.jpg">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="breadcrumb-content">
                                <h3 className="title">{breadcrumbTitle}</h3>
                                <nav className="breadcrumb">
                                    <span property="itemListElement" typeof="ListItem">
                                        <Link href="/">Home</Link>
                                    </span>
                                    <span className="breadcrumb-separator"><i className="fas fa-angle-right" /></span>
                                    <span property="itemListElement" typeof="ListItem">{breadcrumbTitle}</span>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
