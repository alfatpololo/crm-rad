import Link from "next/link"

export default function MobileMenu() {
    return (
        <ul className="navigation">
            <li className="active">
                <Link href="/">Home</Link>
            </li>
            <li>
                <Link href="/services">Kelas</Link>
            </li>
            <li>
                <Link href="/products">Merch</Link>
            </li>
        </ul>
    )
}
