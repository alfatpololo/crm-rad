import CategoryLevel from "../filter/Categories"
import DifficultyFilter from "../filter/DifficultyFilter"
import Instructor from "../filter/Instructor"
import LanguageFilter from "../filter/LanguageFilter"
import PriceFilter from "../filter/PriceFilter"

const FilterCourses = () => {
    return (
        <>
            <aside className="courses__sidebar">
                <div className="shop-widget">
                    <h4 className="widget-title">Filter by Category</h4>
                    <div className="shop-cat-list">
                        <CategoryLevel />
                    </div>
                </div>
                <div className="shop-widget">
                    <h4 className="widget-title">Price Type</h4>
                    <div className="shop-cat-list">
                        <PriceFilter />
                    </div>
                </div>
                <div className="shop-widget">
                    <h4 className="widget-title">Instructors</h4>
                    <div className="shop-cat-list">
                        <Instructor />
                    </div>
                </div>
                <div className="shop-widget">
                    <h4 className="widget-title">Languages</h4>
                    <div className="shop-cat-list">
                        <LanguageFilter />
                    </div>
                </div>
                <div className="shop-widget">
                    <h4 className="widget-title">Difficulty Level</h4>
                    <div className="shop-cat-list">
                        <DifficultyFilter />
                    </div>
                </div>
            </aside>
        </>
    )
}

export default FilterCourses
