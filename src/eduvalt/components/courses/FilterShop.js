import BookCategories from "../filter/BookCategories"
import BookInstructor from "../filter/BookInstructor"
import BookLanguageFilter from "../filter/BookLanguageFilter"

const FilterShop = () => {
    return (
        <>
            <aside className="courses__sidebar">
                <div className="shop-widget">
                    <h4 className="widget-title">Filter by Category</h4>
                    <div className="shop-cat-list">
                        <BookCategories />
                    </div>
                </div>
                <div className="shop-widget">
                    <h4 className="widget-title">Author</h4>
                    <div className="shop-cat-list">
                        <BookInstructor />
                    </div>
                </div>
                <div className="shop-widget">
                    <h4 className="widget-title">Languages</h4>
                    <div className="shop-cat-list">
                        <BookLanguageFilter />
                    </div>
                </div>
            </aside>
        </>
    )
}

export default FilterShop
