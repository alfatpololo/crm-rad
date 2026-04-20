import Link from "next/link"

const ShopCard = ({ item }) => {
    return (
        <>
            <div className="shop-item">
                <div className="shop-thumb">
                    <Link href={`/shop/${item.id}`}>
                        <img src={`/assets/img/shop/${item.logo}`} alt="img" />
                    </Link>
                    <div className="shop-action">
                        <Link href={`/shop/${item.id}`}><i className="fas fa-shopping-cart" /></Link>
                        <Link href={`/shop/${item.id}`}><i className="far fa-eye" /></Link>
                        <Link href={`/shop/${item.id}`}><i className="far fa-heart" /></Link>
                    </div>
                </div>
                <div className="shop-content">
                    <h4 className="price">$13.00</h4>
                    <h3 className="title"><Link href={`/shop/${item.id}`}>{item.title}</Link></h3>
                    <div className="rating">
                        <i className="fas fa-star" />
                        <i className="fas fa-star" />
                        <i className="fas fa-star" />
                        <i className="fas fa-star" />
                        <i className="fas fa-star" />
                    </div>
                </div>
            </div>
        </>
    )
}

export default ShopCard