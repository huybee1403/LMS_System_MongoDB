import axios from "../../utils/axios.customize";

/* =========================================================
   🔐 AUTH APIs
========================================================= */

// Đăng ký
export const registerUser = async (data) => {
    const response = await axios.post(`/auth/register`, data);
    return response.data;
};

// Đăng nhập
export const loginUser = async (data) => {
    const response = await axios.post(`/auth/login`, data);
    return response.data;
};

// Yêu cầu reset password
export const requestPasswordReset = async (data) => {
    const response = await axios.post(`/auth/forgot-password`, data);
    return response.data;
};

// Reset password
export const resetPassword = async (data) => {
    const response = await axios.post(`/auth/reset-password`, data);
    return response.data;
};

// Cập nhật profile lần đầu (complete profile)
export const updateProfile = async (data) => {
    const response = await axios.put(`/auth/complete-profile`, data);
    return response.data;
};

// Logout
export const logoutUser = async () => {
    const response = await axios.post(`/auth/logout`);
    return response.data;
};

// Heartbeat (giữ trạng thái online)
export const heartbeatUser = async (userId) => {
    const response = await axios.post(`/auth/heartbeat`, { userId });
    return response.data;
};

/* =========================================================
   👤 USER APIs
========================================================= */

// Lấy tất cả user
export const getAllUser = async () => {
    const response = await axios.get(`/users/all`);
    return response.data;
};

// Update account (admin / general)
export const updateAccount = async (data) => {
    const response = await axios.put(`/users/update`, data);
    return response.data;
};

// Update account detail (profile cá nhân)
export const updateAccountDetail = async (data) => {
    const response = await axios.put(`/users/account`, data);
    return response.data;
};

// Lấy user theo role (teacher, student, ...)
export const getAllUserByRole = async (role) => {
    const response = await axios.get(`/users/role/${role}`);
    return response.data;
};

// Xoá user
export const deleteAccount = async (id) => {
    try {
        const response = await axios.delete(`/users/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
    }
};

/* =========================================================
   📚 COURSES / CLASSES APIs
========================================================= */

// Lấy tất cả lớp
export const getAllCourse = async (params = {}) => {
    const response = await axios.get(`/classes/all`, { params });
    return response.data;
};

// Tạo lớp
export const createCourse = async (data) => {
    const response = await axios.post(`/classes/create`, data);
    return response.data;
};

// Lấy chi tiết lớp
export const getDetailClass = async (id) => {
    const response = await axios.get(`/classes/get/${id}`);
    return response.data.data;
};

// Update lớp
export const updateCourse = async (values) => {
    const response = await axios.put(`/classes/update/${values.id}`, values);
    return response.data;
};

// Xoá lớp
export const deleteCourse = async (id) => {
    const response = await axios.delete(`/classes/delete/${id}`);
    return response.data;
};

/* =========================================================
   📥 UPLOAD STUDENTS
========================================================= */

// Upload danh sách học sinh bằng Excel
export const uploadStudents = async (file, classId) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`/classes/upload-students/${classId}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

/* =========================================================
   🗓️ SESSIONS APIs
========================================================= */

// Tạo buổi học hôm nay (có thể có giáo viên thay)
export const createTodaySession = async (classId, substituteTeacherId) => {
    const response = await axios.post("/sessions/normal", {
        classId,
        substituteTeacherId,
    });
    return response.data;
};

// Gửi mã xác thực buổi dạy
export const sendTeachingCode = async (sessionId) => {
    const response = await axios.post(`/teacher-salaries/${sessionId}/send-code`);
    return response.data;
};

// Xác nhận chấm công giáo viên
export const confirmTeachingCode = async (sessionId, code) => {
    const response = await axios.post(`/teacher-salaries/${sessionId}/confirm`, {
        code,
    });
    return response.data;
};

// Lấy slot rảnh của giáo viên theo ngày
export const getTeacherFreeSlots = async (teacherId, date) => {
    const response = await axios.get(`/sessions/${teacherId}/free-slots`, {
        params: { date },
    });
    return response.data;
};

// Lấy danh sách giáo viên rảnh theo khung giờ
export const getAvailableTeachers = async (date, start_time, end_time) => {
    const response = await axios.get("/sessions/teachers/available", {
        params: { date, start_time, end_time },
    });
    return response.data;
};

// Tạo buổi học bù
export const createMakeupSession = async (classId, offDate, makeupDate, start_time, end_time, substituteTeacherId) => {
    try {
        const response = await axios.post("/sessions/makeup-off", {
            classId,
            offDate,
            makeupDate,
            start_time,
            end_time,
            substituteTeacherId,
        });

        return response.data;
    } catch (err) {
        throw err.response?.data || { message: "Lỗi khi tạo buổi học bù." };
    }
};

/* =========================================================
   📊 ATTENDANCE APIs
========================================================= */

// Update điểm danh
export const updateAttendance = async (sessionId, studentId, status) => {
    const response = await axios.put("/attendance/update", {
        sessionId,
        studentId,
        status,
    });
    return response.data;
};

// Lấy course theo student
export const getCoursesByStudentId = async (studentId) => {
    const response = await axios.get(`/courses/student-attendance/${studentId}`);
    return response.data;
};

/* =========================================================
   🏫 CLASS MANAGEMENT APIs
========================================================= */

// Lấy lớp theo ngày
export const getClassesByDate = async (date) => {
    const response = await axios.get(`/classes/get-class`, {
        params: { date },
    });
    return response.data;
};

/* =========================================================
   💰 SALARY MANAGEMENT APIs
========================================================= */

// Lấy lương giáo viên (admin)
export const getTeacherSalaries = async (month, year) => {
    const response = await axios.get(`/teacher-salaries/`, {
        params: { month, year },
    });
    return response.data;
};

// Export lương giáo viên (file)
export const exportTeacherSalaries = async (month, year) => {
    const response = await axios.get(`/teacher-salaries/export`, {
        params: { month, year },
        responseType: "blob",
    });
    return response.data;
};

// Lấy lương theo giáo viên
export const getSalariesByTeacher = async (teacherId, month, year) => {
    const response = await axios.get(`/teacher-salaries/teacher/${teacherId}`, {
        params: { month, year },
    });
    return response.data;
};

// Update config lương
export const updateSalaryConfig = async (config) => {
    const response = await axios.put("/teacher-salaries/config", config);
    return response.data;
};

/* =========================================================
   🔔 NOTIFICATIONS APIs
========================================================= */

// Lấy tất cả thông báo của user hiện tại
export const getAllNotifications = async () => {
    const response = await axios.get(`/notifications/my`);
    return response.data;
};

// Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsRead = async () => {
    const response = await axios.put("/notifications/mark-all-read");
    return response.data;
};
