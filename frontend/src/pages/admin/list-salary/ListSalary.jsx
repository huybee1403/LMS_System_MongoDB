import { useState, useEffect, useRef, useMemo } from "react";
import { debounce } from "lodash";

import { isNextDisabled, isPrevDisabled, getPrevMonthYear, getNextMonthYear, monthNames } from "../../../utils/monthHelper";
import "./ListSalary.css";
import { useSalary } from "../../../contexts/salaries/SalaryContext";

const ListSalary = () => {
    const today = new Date();
    const { salaries, salaryDetail, loading, loadSalaries, loadSalaryDetail, exportSalaries } = useSalary();

    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());
    const [search, setSearch] = useState("");

    const [debouncedSearch, setDebouncedSearch] = useState(search);

    const [activeModal, setActiveModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    const modalRef = useRef(null);

    const disablePrev = isPrevDisabled();
    const disableNext = isNextDisabled(month, year);

    // ================= CLICK OUTSIDE =================
    useEffect(() => {
        const handleOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                setActiveModal(false);
            }
        };

        if (activeModal) document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [activeModal]);

    // ================= FETCH =================
    useEffect(() => {
        loadSalaries(month, year);
    }, [month, year]);

    useEffect(() => {
        if (selectedTeacher) {
            loadSalaryDetail(selectedTeacher.teacher_id, month, year);
        }
    }, [selectedTeacher, month, year]);

    // ================= MONTH =================
    const prevMonth = () => {
        const d = getPrevMonthYear(month, year);
        setMonth(d.month);
        setYear(d.year);
    };

    const nextMonth = () => {
        if (disableNext) return;
        const d = getNextMonthYear(month, year);
        setMonth(d.month);
        setYear(d.year);
    };

    // ================= SEARCH =================
    useEffect(() => {
        const handler = debounce(() => {
            setDebouncedSearch(search);
        }, 300);

        handler();
        return () => handler.cancel();
    }, [search]);

    const filteredSalary = useMemo(() => {
        return salaries.filter((t) => (t.first_name + " " + t.last_name).toLowerCase().includes(debouncedSearch.toLowerCase()));
    }, [salaries, debouncedSearch]);

    return (
        <>
            {/* HEADER */}
            <div className="layout-box">
                <div className="layout-filter">
                    <div className="form-group">
                        <i className="fa fa-search"></i>
                        <input type="text" className="c_input" placeholder="Tìm giáo viên" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>

                    <div className="button-group">
                        <button className="c-button-1" onClick={() => exportSalaries(month, year)} disabled={loading}>
                            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-file-export"></i>} Xuất excel
                        </button>

                        <div className="salary_month">
                            <h3>
                                {monthNames[month]}, {year}
                            </h3>

                            <div className="salary_arrow">
                                <button className={`arrow ${disablePrev ? "disable" : ""}`} disabled={disablePrev} onClick={prevMonth}>
                                    <i className="fa fa-angle-left"></i>
                                </button>

                                <button className={`arrow ${disableNext ? "disable" : ""}`} disabled={disableNext} onClick={nextMonth}>
                                    <i className="fa fa-angle-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="layout-box">
                <div className="table-container">
                    <table className="table-1">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Giáo viên</th>
                                <th>Tổng buổi</th>
                                <th>Tiền khác</th>
                                <th>Tiền lương</th>
                                <th>Chi tiết</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", fontSize: "var(--fs-14)", color: "var(--Light-Quaternary-50)" }}>
                                        Đang tải dữ liệu…
                                    </td>
                                </tr>
                            ) : filteredSalary.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", fontSize: "var(--fs-14)", color: "var(--Light-Quaternary-50)" }}>
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            ) : (
                                filteredSalary.map((item, index) => {
                                    const extra =
                                        item.rate_per_session * item.total_makeup_sessions * item.makeup_coefficient +
                                        item.rate_per_session * item.total_substitute_sessions * item.substitute_coefficient;

                                    return (
                                        <tr key={item._id || index}>
                                            <td>{index + 1}</td>
                                            <td>{item.teacher_name}</td>
                                            <td>{item.total_sessions}</td>
                                            <td>{extra.toLocaleString("vi-VN")}</td>
                                            <td>{Number(item.total_salary).toLocaleString("vi-VN")}</td>
                                            <td>
                                                <i
                                                    className="fa-solid fa-circle-info"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => {
                                                        setSelectedTeacher(item);
                                                        setActiveModal(true);
                                                    }}
                                                ></i>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL */}
            <div className={`modal ${activeModal ? "active" : ""}`}>
                {activeModal && (
                    <div className="modal_box" ref={modalRef} style={{ maxWidth: "1200px" }}>
                        <div className="modal-close" onClick={() => setActiveModal(false)}>
                            <i className="fa-solid fa-xmark"></i>
                        </div>

                        <div className="modal_group">
                            <h2 className="headline">
                                Bảng tổng hợp lương{" "}
                                <b>
                                    Tháng {month}, {year}
                                </b>
                            </h2>

                            <div className="modal_body">
                                <div className="salary_class table-container">
                                    <table className="table-1">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Tên lớp</th>
                                                <th>Tiền/Buổi</th>
                                                <th>Tổng buổi</th>
                                                <th>Bù / Dạy thay</th>
                                                <th>Thành tiền</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={6} style={{ textAlign: "center" }}>
                                                        Đang tải dữ liệu…
                                                    </td>
                                                </tr>
                                            ) : !salaryDetail || salaryDetail.classes.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} style={{ textAlign: "center" }}>
                                                        Không có dữ liệu
                                                    </td>
                                                </tr>
                                            ) : (
                                                salaryDetail.classes.map((cls, index) => (
                                                    <tr key={cls.class_id || index}>
                                                        <td>{index + 1}</td>
                                                        <td>{cls.class_name}</td>
                                                        <td>{Number(salaryDetail.rate_per_session).toLocaleString("vi-VN")}</td>
                                                        <td>{cls.total_sessions}</td>
                                                        <td>{cls.total_makeup_sessions + cls.total_substitute_sessions}</td>
                                                        <td>{Number(salaryDetail.rate_per_session * cls.total_sessions).toLocaleString("vi-VN")}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* SUMMARY */}
                                <div className="salary_form">
                                    <div className="salary_input">
                                        <span>Tổng Tiền Dạy</span>
                                        <div className="form-group c-form-border">
                                            <input type="text" className="c_input" value={Number(salaryDetail?.total_salary ?? 0).toLocaleString("vi-VN")} disabled />
                                            <span>VND</span>
                                        </div>
                                    </div>

                                    <div className="salary_other">
                                        <div className="salary_input">
                                            <span>Tiền khác</span>
                                            <div className="form-group c-form-border">
                                                <input
                                                    className="c_input"
                                                    disabled
                                                    value={Number(
                                                        (salaryDetail?.rate_per_session ?? 0) * (salaryDetail?.total_makeup_sessions ?? 0) * (salaryDetail?.makeup_coefficient ?? 0) +
                                                            (salaryDetail?.rate_per_session ?? 0) * (salaryDetail?.total_substitute_sessions ?? 0) * (salaryDetail?.substitute_coefficient ?? 0),
                                                    ).toLocaleString("vi-VN")}
                                                />
                                                <span>VND</span>
                                            </div>
                                        </div>

                                        <div className="form-group c-form-border">
                                            <textarea rows="5" disabled placeholder="Chưa có"></textarea>
                                        </div>
                                    </div>

                                    <div className="salary_total">
                                        <i className="fa fa-usd"></i>
                                        <h3>Tổng tiền lương (VND)</h3>
                                        <h4>{Number(salaryDetail?.total_salary ?? 0).toLocaleString("vi-VN")}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ListSalary;
