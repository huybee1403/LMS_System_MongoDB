import { createContext, useContext, useState } from "react";

import { toast } from "react-toastify";
import { exportTeacherSalaries, getSalariesByTeacher, getTeacherSalaries } from "../../services/apis/api";

const SalaryContext = createContext();

export const SalaryProvider = ({ children }) => {
    const [salaries, setSalaries] = useState([]);
    const [salaryDetail, setSalaryDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load danh sách lương theo tháng và năm
    const loadSalaries = async (month, year) => {
        try {
            setLoading(true);
            const data = await getTeacherSalaries(month, year);
            setSalaries(data);
        } catch (err) {
            toast.error("Không tải được danh sách lương!");
        } finally {
            setLoading(false);
        }
    };

    // Load chi tiết lương 1 giáo viên theo teacherId
    const loadSalaryDetail = async (teacherId, month, year) => {
        try {
            setLoading(true);
            const data = await getSalariesByTeacher(teacherId, month, year);
            setSalaryDetail(data.data);
        } catch (err) {
            toast.error("Không lấy được chi tiết lương!");
        } finally {
            setLoading(false);
        }
    };

    // Xuất file excel lương giáo viên theo tháng và năm
    const exportSalaries = async (month, year) => {
        try {
            setLoading(true);

            const blob = await exportTeacherSalaries(month, year);

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Teacher_Salaries_${month}_${year}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error("Không lấy được chi tiết lương!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SalaryContext.Provider
            value={{
                salaries,
                salaryDetail,
                loading,
                loadSalaries,
                loadSalaryDetail,
                exportSalaries,
            }}
        >
            {children}
        </SalaryContext.Provider>
    );
};

export const useSalary = () => useContext(SalaryContext);
