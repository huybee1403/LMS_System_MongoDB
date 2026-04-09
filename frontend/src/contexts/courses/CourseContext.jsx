// context/CoursesContext.js
import { createContext, useContext, useState, useCallback } from "react";
import { toast } from "react-toastify";

import {
    createCourse,
    uploadStudents,
    updateCourse,
    deleteCourse,
    getAllCourse,
    createTodaySession,
    updateAttendance,
    createMakeupSession,
    sendTeachingCode,
    confirmTeachingCode,
} from "../../services/apis/api";

const CoursesContext = createContext();

export const CoursesProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]); // states lớp học

    // ================= COMMON HANDLER =================
    const withLoading = async (asyncFn) => {
        setLoading(true);
        try {
            return await asyncFn();
        } finally {
            setLoading(false);
        }
    };

    const handleError = (error, fallbackMessage) => {
        const message = error?.response?.data?.message || fallbackMessage;
        toast.error(message);
        console.error(error);
    };

    // ================= FETCH COURSES =================
    const fetchCourses = useCallback(async (params = {}) => {
        await withLoading(async () => {
            const res = await getAllCourse(params);
            setCourses(res.data || []);
        }).catch((err) => handleError(err, "!"));
    }, []);

    // ================= COURSE =================
    const handleCreateCourse = useCallback(
        async (values, onSuccess) => {
            await withLoading(async () => {
                const res = await createCourse(values);
                toast.success(res?.message || "Tạo lớp học thành công!");
                await fetchCourses(); // refresh list
                onSuccess?.();
            }).catch((err) => handleError(err, "Lỗi khi tạo lớp!"));
        },
        [fetchCourses],
    );

    const handleUpdateCourse = useCallback(
        async (values, onSuccess) => {
            await withLoading(async () => {
                const res = await updateCourse(values);
                toast.success(res?.message || "Cập nhật lớp học thành công!");
                await fetchCourses(); // refresh list
                onSuccess?.();
            }).catch((err) => handleError(err, "Lỗi khi cập nhật lớp học!"));
        },
        [fetchCourses],
    );

    const handleDeleteCourse = useCallback(
        async (id, onSuccess) => {
            await withLoading(async () => {
                const res = await deleteCourse(id);
                toast.success(res?.message || "Xóa lớp học thành công!");
                await fetchCourses(); // refresh list
                onSuccess?.();
            }).catch((err) => handleError(err, "Lỗi khi xóa lớp học!"));
        },
        [fetchCourses],
    );

    // ================= STUDENTS =================
    const handleUploadStudents = useCallback(
        async (file, classId, resetForm, onSuccess) => {
            await withLoading(async () => {
                const res = await uploadStudents(file, classId);

                if (!res?.count) {
                    toast.warning("Danh sách đã được đăng ký trước đó!");
                } else {
                    toast.success(`Upload thành công ${res.count} học sinh`);
                }

                resetForm?.();
                onSuccess?.();
                await fetchCourses(); // optional refresh
            }).catch((err) => handleError(err, "Upload thất bại!"));
        },
        [fetchCourses],
    );

    // ================= SESSIONS =================
    const createTodaySessionForClass = useCallback(async (classId) => {
        try {
            const res = await createTodaySession(classId);
            if (res) {
                toast.info(res.message);
            }
            return res;
        } catch (error) {
            console.error("Lỗi tạo session cho lớp:", error);
            throw error;
        }
    }, []);

    const createTodaySessionWithSubTeacher = useCallback(async (classId, subTeacherId) => {
        try {
            const res = await createTodaySession(classId, subTeacherId);
            if (res) {
                toast.info(res.message);
            }
            return res;
        } catch (error) {
            console.error("Lỗi tạo session với giáo viên dạy thay:", error);
            throw error;
        }
    }, []);

    const createMakeupSessionForClass = useCallback(async (classId, offDate, makeupDate, startTime, endTime, substituteTeacherId) => {
        try {
            const res = await createMakeupSession(classId, offDate, makeupDate, startTime, endTime, substituteTeacherId);
            if (res) {
                toast.success(res.message || "Tạo buổi học bù thành công!");
            }
            return res;
        } catch (error) {
            console.error("Lỗi khi tạo buổi học bù:", error);
            toast.error(error?.message || "Tạo buổi học bù thất bại!");
            throw error;
        }
    }, []);

    const handleUpdateAttendance = useCallback(async (sessionId, studentId, status, onSuccess, onError) => {
        try {
            const res = await updateAttendance(sessionId, studentId, status);
            if (res?.success === false) {
                const message = res?.message || "Chưa thể cập nhật điểm danh vào lúc này!";
                toast.error(message);
                if (onError) onError({ message });
                return res;
            }

            toast.success(res?.message || "Cập nhật điểm danh thành công!");
            if (onSuccess) onSuccess();
            return res;
        } catch (err) {
            console.error("Lỗi cập nhật:", err);
            toast.error(err?.message || "Cập nhật điểm danh thất bại!");
            if (onError) onError(err);
        }
    }, []);

    const handleSendTeachingCode = useCallback(async (sessionId, onSuccess) => {
        await withLoading(async () => {
            const res = await sendTeachingCode(sessionId);
            if (res?.success === false) {
                toast.error(res?.message || "Không thể gửi mã xác nhận buổi dạy!");
                return res;
            }

            toast.success(res?.message || "Gửi mã xác nhận buổi dạy thành công!");
            onSuccess?.();
            return res;
        }).catch((err) => handleError(err, "Lỗi khi gửi mã xác nhận!"));
    }, []);

    const handleConfirmTeachingCode = useCallback(async (sessionId, code, onSuccess) => {
        await withLoading(async () => {
            const res = await confirmTeachingCode(sessionId, code);
            if (res?.success === false) {
                toast.error(res?.message || "Không thể xác nhận buổi dạy!");
                return res;
            }

            toast.success(res?.message || "Xác nhận buổi dạy thành công!");
            onSuccess?.();
            return res;
        }).catch((err) => handleError(err, "Mã xác nhận không đúng!"));
    }, []);

    return (
        <CoursesContext.Provider
            value={{
                loading,
                courses,
                fetchCourses,

                // courses actions
                handleCreateCourse,
                handleUpdateCourse,
                handleDeleteCourse,

                // students
                handleUploadStudents,

                // sessions
                createTodaySessionForClass,
                createTodaySessionWithSubTeacher,
                createMakeupSessionForClass,
                handleUpdateAttendance,
                handleSendTeachingCode,
                handleConfirmTeachingCode,
            }}
        >
            {children}
        </CoursesContext.Provider>
    );
};

export const useCourses = () => useContext(CoursesContext);
