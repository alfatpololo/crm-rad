import Link from "next/link"

export default function BrandSlider1() {
    return (
        <>
            <div className="row brand-active">
                <div className="col">
                    <div className="brand__item">
                        <Link href="#"><img src="/assets/img/brand/brand01.png" alt="brand" /></Link>
                    </div>
                </div>
                <div className="col">
                    <div className="brand__item">
                        <Link href="#"><img src="/assets/img/brand/brand02.png" alt="brand" /></Link>
                    </div>
                </div>
                <div className="col">
                    <div className="brand__item">
                        <Link href="#"><img src="/assets/img/brand/brand03.png" alt="brand" /></Link>
                    </div>
                </div>
                <div className="col">
                    <div className="brand__item">
                        <Link href="#"><img src="/assets/img/brand/brand04.png" alt="brand" /></Link>
                    </div>
                </div>
                <div className="col">
                    <div className="brand__item">
                        <Link href="#"><img src="/assets/img/brand/brand05.png" alt="brand" /></Link>
                    </div>
                </div>
                <div className="col">
                    <div className="brand__item">
                        <Link href="#"><img src="/assets/img/brand/brand06.png" alt="brand" /></Link>
                    </div>
                </div>
                <div className="col">
                    <div className="brand__item">
                        <Link href="#"><img src="/assets/img/brand/brand07.png" alt="brand" /></Link>
                    </div>
                </div>
            </div>
        </>
    )
}
