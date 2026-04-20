import dynamic from 'next/dynamic'
const PortfolioFilter2 = dynamic(() => import('../elements/PortfolioFilter2'), {
    ssr: false,
})

export default function Course2() {
    return (
        <>
            <section className="courses-area section-pt-120 section-pb-90">
                <div className="container">
                    <PortfolioFilter2 />
                </div>
                <div className="courses__shapes">
                    <div className="courses__shapes-item alltuchtopdown"><img src="/assets/img/courses/course_shape01.png" alt="shape" /></div>
                    <div className="courses__shapes-item alltuchtopdown"><img src="/assets/img/courses/course_shape02.png" alt="shape" /></div>
                </div>
            </section>
        </>
    )
}
