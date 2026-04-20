import { useDispatch, useSelector } from "react-redux"
import { addInstructor } from "../../features/courseFilterSlice"
import { instructorsCheck } from "../../features/courseSlice"

const instructorLevel = () => {
    const { instructors } = useSelector((state) => state.course) || {}
    const dispatch = useDispatch()

    // instructor handler
    const instructorHandler = (e, id) => {
        dispatch(addInstructor(e.target.value))
        dispatch(instructorsCheck(id))
    }

    return (
        <ul className="list-wrap">
            {instructors?.map((item) => (
                <li key={item.id}>
                    <div className="form-check">
                        <label className="form-check-label">
                            <input className="form-check-input"
                                type="checkbox"
                                checked={item.isChecked}
                                value={item.value}
                                onChange={(e) => instructorHandler(e, item.id)}
                            />
                            {item.name}
                        </label>
                    </div>
                </li>
            ))}

        </ul>
    )
}
export default instructorLevel
