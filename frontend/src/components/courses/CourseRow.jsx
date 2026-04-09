import { Link } from "react-router-dom";

const CourseRow = ({ item, index, currentPage, user, onEdit, onDelete }) => {
    const classId = item._id ?? item.id;
    const start = item.start_date ? new Date(item.start_date) : null;
    const end = item.end_date ? new Date(item.end_date) : null;
    const isSubstituteOnlyClass = Boolean(item.__isSubstituteOnlyClass);

    return (
        <tr>
            <td>{currentPage > 0 ? (currentPage - 1) * 7 + index + 1 : index + 1}</td>

            <td>
                {user?.type === "student" ? (
                    item.name
                ) : (
                    <Link to={`/class-detail/${classId}`} className="name">
                        {item.name}
                        {isSubstituteOnlyClass ? " (Dạy bù)" : ""}
                    </Link>
                )}
            </td>

            <td className="teacher_name">{item.teacher_id ? `${item.teacher_id.first_name} ${item.teacher_id.last_name}` : ""}</td>

            <td>{start && !Number.isNaN(start.getTime()) ? start.toLocaleDateString("vi-VN") : "—"}</td>
            <td>{end && !Number.isNaN(end.getTime()) ? end.toLocaleDateString("vi-VN") : "—"}</td>

            {user && user.type !== "student" && user.type !== "teacher" && (
                <>
                    <td>
                        <i className="fa fa-pencil" onClick={() => onEdit(item)} />
                    </td>
                    <td>
                        <i className="fa fa-trash" onClick={() => onDelete(item)} />
                    </td>
                </>
            )}
        </tr>
    );
};

export default CourseRow;
