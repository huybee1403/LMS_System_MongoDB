import React from "react";

const FilterBar = ({ searchEmail, setSearchEmail, filterRole, setFilterRole, currentPage, totalPages, handlePageChange }) => {
    return (
        <div className="layout-filter">
            <div className="form-group">
                <i className="fa-solid fa-magnifying-glass" />
                <input type="text" className="c_input" placeholder="Tìm tài khoản..." value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} />
            </div>

            <div className="form-role">
                <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="">Chọn vai trò</option>
                    <option value="admin">Admin</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                </select>
            </div>

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
    );
};

export default FilterBar;
