import BrandSlider1 from "../slider/BrandSlider1"
import Link from "next/link"
import { RAD_SITE_URL } from "@/lib/radLandingContent"

export default function Brand1() {
    return (
        <>
            <div className="brand-area pt-3">
                <div className="container text-center">
                    <p className="small text-muted mb-3 mb-lg-4 px-2">
                        PT. Rabindra Annesa Danesjvara Indonesia — pelatihan{' '}
                        <strong>Certified Management Accountant (CMA)</strong> dan program sertifikasi ICMA lainnya.
                        Informasi lengkap gelombang &amp; jadwal juga di{" "}
                        <Link href={RAD_SITE_URL} target="_blank" rel="noopener noreferrer">
                            radindonesia.com
                        </Link>
                        .
                    </p>
                </div>
                <div className="container">
                    <BrandSlider1 />
                </div>
            </div>
        </>
    )
}
