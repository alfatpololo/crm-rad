import { useDispatch, useSelector } from "react-redux"
import { addCategory } from "../../features/courseFilterSlice"
import { categoryCheck } from "../../features/courseSlice"

const CategoryLevel = () => {
    const { category } = useSelector((state) => state.course) || {}
    const dispatch = useDispatch()

    // instructor handler
    const categoryHandler = (e, id) => {
        dispatch(addCategory(e.target.value))
        dispatch(categoryCheck(id))
    }

    return (
        <ul className="list-wrap">
            {category?.map((item) => (
                <li key={item.id}>
                    <div className="form-check">
                        <label className="form-check-label">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                checked={item.isChecked}
                                value={item.value}
                                onChange={(e) => categoryHandler(e, item.id)}
                            />
                            {item.name}
                        </label>
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default CategoryLevel