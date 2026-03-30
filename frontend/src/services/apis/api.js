import axios from "./axios.customize";

//Auth API
export const registerUser = async (data) => {
    const response = await axios.post(`/auth/register`, data);
    return response.data;
};

export const loginUser = async (data) => {
    const response = await axios.post(`/auth/login`, data);
    console.log("Login response:", response);

    return response.data;
};

export const requestPasswordReset = async (data) => {
    const response = await axios.post(`/auth/forgot-password`, data);
    return response.data;
};

export const resetPassword = async (token, new_password) => {
    const response = await axios.post(`/auth/reset-password`, {
        token,
        new_password,
    });
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await axios.post(`/auth/complete-profile`, data);
    return response.data;
};

export const logoutUser = async (userId) => {
    const response = await axios.post(`/auth/logout`, { userId });
    return response.data;
};

export const heartbeatUser = async (userId) => {
    const response = await axios.post(`/auth/heartbeat`, { userId });
    return response.data;
};

//User API
export const getAllUser = async () => {
    const response = await axios.get(`/users/all`);
    return response.data;
};

export const updateAccount = async (data) => {
    const response = await axios.post(`/users/update-account`, data);
    return response.data;
};

export const updateAccountDetail = async (data) => {
    const response = await axios.post(`/users/update-account-detail`, data);
    return response.data;
};

export const getAllUserByRole = async (role) => {
    const response = await axios.get(`/users/role/${role}`);
    return response.data;
};
export const deleteAccount = async (id) => {
    try {
        const response = await axios.delete(`/users/delete/${id}`);
        return response.data;
    } catch (error) {
        // Nếu có lỗi từ API, trả về lỗi chi tiết
        console.log(error);
    }
};

//Courses API
export const getAllCourse = async () => {
    const response = await axios.get(`/courses/all-classes`);
    return response.data;
};
export const createCourse = async (data) => {
    const response = await axios.post(`/courses/create-classes`, data);
    return response.data;
};

export const getDetailClass = async (id) => {
    const response = await axios.get(`/courses/detail-classes/${id}`);
    return response.data;
};

export const uploadStudents = async (file, classId) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`/studentUploads/upload-students/${classId}`, formData);

    return response.data;
};

export const updateCourse = async (values) => {
    const response = await axios.put(`/courses/edit-classes/${values.id}`, values);
    return response.data;
};

export const deleteCourse = async (id) => {
    const response = await axios.delete(`/courses/delete-classes/${id}`);
    return response.data;
};

// Sessions API
export const createTodaySession = async (classId, substituteTeacherId) => {
    const response = await axios.post("/sessions/normal", {
        classId,
        substituteTeacherId,
    });
    return response.data;
};

// Gửi mã xác thực cho buổi học
export const sendTeachingCode = async (sessionId) => {
    const response = await axios.post(`/teacher-salaries/${sessionId}/send-code`);
    return response.data;
};

// Chấm công giáo viên
export const confirmTeachingCode = async (sessionId, code) => {
    const response = await axios.post(`/teacher-salaries/${sessionId}/confirm`, {
        code,
    });
    return response.data;
};

// Lấy danh sách slot trống của giáo viên trong ngày cụ thể
export const getTeacherFreeSlots = async (teacherId, date) => {
    // date là optional, vd: "2025-11-16"
    const response = await axios.get(`/sessions/${teacherId}/free-slots`, {
        params: { date },
    });
    return response.data; // mảng slot trống
};

// Lấy danh sách giáo viên có thời gian rảnh trong khung giờ nhất định
export const getAvailableTeachers = async (date, start_time, end_time) => {
    const response = await axios.get("/sessions/teachers/available", {
        params: { date, start_time, end_time },
    });
    return response.data; // Danh sách giáo viên
};

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

// Attendance API
export const updateAttendance = async (sessionId, studentId, status) => {
    const response = await axios.put("/attendance/update", {
        sessionId,
        studentId,
        status,
    });
    return response.data;
};

export const getCoursesByStudentId = async (studentId) => {
    const response = await axios.get(`/courses/student-attendance/${studentId}`);
    return response.data;
};

//Management Class
export const getClassesByDate = async (date) => {
    const response = await axios.get(`/classes/get-class`, { params: { date } });
    return response.data;
};

//Salary Management
// 🔹 Lấy lương giáo viên theo tháng/năm (Admin only)
export const getTeacherSalaries = async (month, year) => {
    const response = await axios.get(`/teacher-salaries/`, {
        params: { month, year },
    });
    return response.data;
};
// 🔹 Xuất lương giáo viên theo tháng/năm (Admin only)
export const exportTeacherSalaries = async (month, year) => {
    const response = await axios.get(`/teacher-salaries/export`, {
        params: { month, year },
        responseType: "blob", // quan trọng: nhận file
    });
    return response.data;
};

// 🔹 Lấy lương giáo viên theo tháng/năm
export const getSalariesByTeacher = async (teacherId, month, year) => {
    const response = await axios.get(`/teacher-salaries/teacher/${teacherId}`, {
        params: { month, year },
    });
    return response.data;
};
// 🔹 Config (Admin only)
export const updateSalaryConfig = async (config) => {
    const response = await axios.put("/teacher-salaries/config", config);
    return response.data;
};

// 🔹 Nofication
// 🔹 Lấy tất cả thông báo
export const getAllNotifications = async () => {
    const response = await axios.get(`/nofication/all`);
    return response.data;
};

// 🔹 Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsRead = async () => {
    const response = await axios.patch("/nofication/read-all");
    return response.data; // thường là { success: true } hoặc thông tin đã cập nhật
};
