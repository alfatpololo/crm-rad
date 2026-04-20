import { useDispatch, useSelector } from "react-redux"
import { addDifficulty } from "../../features/courseFilterSlice"
import { difficultyCheck } from "../../features/courseSlice"

const DifficultyFilter = () => {
    const { difficulty } = useSelector((state) => state.course) || {}
    const dispatch = useDispatch()

    // instructor handler
    const difficultyHandler = (e, id) => {
        dispatch(addDifficulty(e.target.value))
        dispatch(difficultyCheck(id))
    }

    return (
        <ul className="list-wrap">
            {difficulty?.map((item) => (
                <li key={item.id}>
                    <div className="form-check">
                        <label className="form-check-label">
                            <input className="form-check-input"
                                type="checkbox"
                                checked={item.isChecked}
                                value={item.value}
                                onChange={(e) => difficultyHandler(e, item.id)}
                            />
                            {item.name}
                        </label>
                    </div>
                </li>
            ))}
        </ul>
    )
}

export default DifficultyFilter