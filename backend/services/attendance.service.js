const Session = require("../models/session.model");
const moment = require("moment-timezone");
const { getTodayVNStr, isSameDayYYYY, formatDateToDisplay, formatDateToISO } = require("../utils/dateUtilsForSession");
const { timeStrToMinutes, getCurrentMinutesVN } = require("../utils/timeUtilsForSession");

const VALID_STATUSES = new Set(["present", "absent", "late", "excused", "HUY"]);

const validateAttendanceUpdateWindow = (session) => {
    const todayVN = getTodayVNStr();
    const sessionDateStr = formatDateToISO(session.session_date);

    if (!isSameDayYYYY(todayVN, sessionDateStr)) {
        return {
            allowed: false,
            message: `Chỉ được cập nhật điểm danh trong ngày học (${formatDateToDisplay(sessionDateStr)}).`,
        };
    }

    const nowMinutes = getCurrentMinutesVN();
    const startMinutes = timeStrToMinutes(session.start_time);
    const endMinutes = timeStrToMinutes(session.end_time);

    if (nowMinutes < startMinutes) {
        return { allowed: false, message: `Chưa tới giờ học (${session.start_time}).` };
    }

    if (nowMinutes > endMinutes) {
        return { allowed: false, message: `Đã quá giờ học (${session.end_time}).` };
    }

    return { allowed: true };
};

const updateSessionAttendance = async (sessionId, studentId, status) => {
    if (!sessionId || !studentId || !status) {
        return { success: false, message: "Thiếu thông tin để cập nhật điểm danh" };
    }

    if (!VALID_STATUSES.has(status)) {
        return { success: false, message: "Trạng thái điểm danh không hợp lệ" };
    }

    const session = await Session.findById(sessionId);
    if (!session) {
        return { success: false, message: "Không tìm thấy buổi học" };
    }

    const validationResult = validateAttendanceUpdateWindow(session);
    if (!validationResult.allowed) {
        return { success: false, message: validationResult.message };
    }

    const existingIndex = session.attendance.findIndex((item) => item.student_id.toString() === studentId.toString());

    if (status === "HUY") {
        if (existingIndex >= 0) {
            session.attendance.splice(existingIndex, 1);
            await session.save();
        }
        return { success: true, message: "Đã xóa bản ghi điểm danh" };
    }

    if (existingIndex >= 0) {
        session.attendance[existingIndex].status = status;
    } else {
        session.attendance.push({ student_id: studentId, status });
    }

    await session.save();

    return {
        success: true,
        message: existingIndex >= 0 ? "Cập nhật điểm danh thành công" : "Tạo điểm danh thành công",
    };
};

const markAttendance = async (sessionId, studentId, status) => {
    return updateSessionAttendance(sessionId, studentId, status);
};

const getAttendanceBySession = async (sessionId) => {
    if (!sessionId) {
        throw new Error("Thiếu mã buổi học");
    }

    const session = await Session.findById(sessionId)
        .populate("attendance.student_id", "first_name last_name email")
        .populate("substitute_teacher_id", "first_name last_name email")
        .populate({ path: "class_id", select: "teacher_id name" });

    if (!session) {
        throw new Error("Không tìm thấy buổi học");
    }

    return {
        session: {
            id: session._id,
            session_date: moment(session.session_date).format("YYYY-MM-DD"),
            topic: session.topic,
            start_time: session.start_time,
            end_time: session.end_time,
            is_makeup: session.is_makeup,
            is_canceled: session.is_canceled,
            substitute_teacher: session.substitute_teacher_id,
            class_name: session.class_id?.name || null,
        },
        attendance: session.attendance.map((record) => ({
            student_id: record.student_id?._id || record.student_id,
            status: record.status,
            first_name: record.student_id?.first_name || null,
            last_name: record.student_id?.last_name || null,
            email: record.student_id?.email || null,
        })),
    };
};

const getStudentAttendanceInClass = async (studentId, classId) => {
    if (!studentId || !classId) {
        throw new Error("Thiếu mã học viên hoặc mã lớp học");
    }

    const sessions = await Session.find({ class_id: classId }).sort({ session_date: 1 });

    return sessions.map((session) => {
        const attendance = session.attendance.find((item) => item.student_id.toString() === studentId.toString());
        return {
            session_id: session._id,
            session_date: moment(session.session_date).format("YYYY-MM-DD"),
            status: attendance ? attendance.status : null,
            is_makeup: session.is_makeup,
            is_canceled: session.is_canceled,
        };
    });
};

const updateAttendanceStatus = async (sessionId, studentId, status) => {
    return updateSessionAttendance(sessionId, studentId, status);
};

module.exports = {
    markAttendance,
    getAttendanceBySession,
    getStudentAttendanceInClass,
    updateAttendanceStatus,
};
