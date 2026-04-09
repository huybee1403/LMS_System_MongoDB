import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useSalary } from "../../contexts/salaries/SalaryContext";
import { monthNames } from "../../utils/monthHelper";
import "./MySalary.css";

const MySalary = () => {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [year, setYear] = useState(today.getFullYear());

    const { salaryDetail, loading, loadSalaryDetail } = useSalary();

    // 👉 lấy teacherId từ token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        loadSalaryDetail(decoded.id, month, year);
    }, [month, year]);

    return (
        <div className="layout-box">
            <h2 className="headline">
                Bảng lương của tôi –{" "}
                <b>
                    {monthNames[month]}, {year}
                </b>
            </h2>

            {loading && <p style={{ fontSize: "var(--fs-14)", color: "var(--Light-Quaternary-50)" }}>Đang tải dữ liệu…</p>}

            {!loading && !salaryDetail && <p style={{ fontSize: "var(--fs-14)", color: "var(--Light-Quaternary-50)" }}>Không có dữ liệu lương</p>}

            {!loading && salaryDetail && (
                <>
                    {/* BẢNG THEO LỚP */}
                    <div className="table-container">
                        <table className="table-1">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Lớp</th>
                                    <th>Tiền/Buổi</th>
                                    <th>Tổng buổi</th>
                                    <th>Bù / Dạy thay</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salaryDetail.classes.map((cls, index) => (
                                    <tr key={cls.class_id}>
                                        <td>{index + 1}</td>
                                        <td>{cls.class_name}</td>
                                        <td>{Number(salaryDetail.rate_per_session).toLocaleString("vi-VN")}</td>
                                        <td>{cls.total_sessions}</td>
                                        <td>{cls.total_makeup_sessions + cls.total_substitute_sessions}</td>
                                        <td>{Number(salaryDetail.rate_per_session * cls.total_sessions).toLocaleString("vi-VN")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* SUMMARY */}
                    <div className="salary_form">
                        <div className="salary_input">
                            <span>Tổng tiền dạy</span>
                            <div className="form-group c-form-border">
                                <input className="c_input" disabled value={Number(salaryDetail.total_salary).toLocaleString("vi-VN")} />
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
                                            salaryDetail.rate_per_session * salaryDetail.total_makeup_sessions * salaryDetail.makeup_coefficient +
                                                salaryDetail.rate_per_session * salaryDetail.total_substitute_sessions * salaryDetail.substitute_coefficient,
                                        ).toLocaleString("vi-VN")}
                                    />
                                    <span>VND</span>
                                </div>
                            </div>

                            <textarea disabled placeholder="Ghi chú từ trung tâm (nếu có)" />
                        </div>

                        <div className="salary_total">
                            <i className="fa fa-usd"></i>
                            <h3>Tổng lương</h3>
                            <h4>{Number(salaryDetail.total_salary).toLocaleString("vi-VN")} VND</h4>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MySalary;
