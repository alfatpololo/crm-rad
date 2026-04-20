import { useDispatch, useSelector } from "react-redux"
import { addPrice } from "../../features/courseFilterSlice"
import { priceCheck } from "../../features/courseSlice"

const PriceFilter = () => {
    const { price } = useSelector((state) => state.course) || {}
    const dispatch = useDispatch()

    // instructor handler
    const priceHandler = (e, id) => {
        dispatch(addPrice(e.target.value))
        dispatch(priceCheck(id))
    }

    return (
        <ul className="list-wrap">
            {price?.map((item) => (
                <li key={item.id}>
                    <div className="form-check">
                        <label className="form-check-label">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                value={item.value}
                                checked={item.isChecked}
                                onChange={(e) => priceHandler(e, item.id)}
                            />
                            {item.name}
                        </label>
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default PriceFilter
