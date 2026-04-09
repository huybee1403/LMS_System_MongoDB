const FilterBar = ({ searchTerm, setSearchTerm, teachers, selectedTeacherId, setSelectedTeacherId, status, setStatus, currentPage, totalPages, handlePageChange, showTeacherFilter }) => {
    return (
        <>
            <div className="layout-box">
                <div className="layout-filter">
                    <div className="tab untab">
                        <ul className="tab-menu">
                            <li className={status === "ongoing" ? "active" : ""} onClick={() => setStatus("ongoing")}>
                                Đang học
                            </li>
                            <li className={status === "completed" ? "active" : ""} onClick={() => setStatus("completed")}>
                                Hoàn thành
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="layout-box">
                <div className="layout-filter">
                    <div className="form-group">
                        <i className="fa-solid fa-magnifying-glass" />
                        <input type="text" placeholder="Tìm lớp..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="c_input" />
                    </div>

                    {showTeacherFilter && (
                        <div className="form-role">
                            <select value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)}>
                                <option value="">Lọc giáo viên</option>
                                {teachers.map((t) => (
                                    <option key={t._id} value={t._id}>
                                        {t.first_name} {t.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="pagination">
                        <div className="pagination_number">
                            <span>{currentPage}</span>/<span>{totalPages}</span>
                        </div>
                        <div className="pagination_arrow">
                            <span className={currentPage === 1 ? "disable" : ""} onClick={() => handlePageChange("prev")}>
                                <i className="fa fa-angle-left" />
                            </span>
                            <span className={currentPage === totalPages ? "disable" : ""} onClick={() => handlePageChange("next")}>
                                <i className="fa fa-angle-right" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FilterBar;
