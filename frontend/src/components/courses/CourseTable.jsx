import CourseRow from "./CourseRow";

const CourseTable = ({ currentItems, currentPage, user, onEdit, onDelete }) => {
    const showActions = user?.type === "admin";

    return (
        <div className="layout-box">
            <div className="table-container">
                <table className="table-1">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Lớp</th>
                            <th>Giáo viên</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>

                            {showActions && (
                                <>
                                    <th>Sửa</th>
                                    <th>Xóa</th>
                                </>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {currentItems.length === 0 ? (
                            <tr>
                                <td colSpan={showActions ? 7 : 5} className="none_class">
                                    Không có lớp học nào phù hợp bộ lọc.
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((item, index) => (
                                <CourseRow key={item._id ?? item.id} item={item} index={index} currentPage={currentPage} user={user} onEdit={onEdit} onDelete={onDelete} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CourseTable;
