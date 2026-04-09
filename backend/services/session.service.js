const Session = require("../models/session.model");
const Class = require("../models/class.model");
const User = require("../models/user.model");
const { parseSessionDate, getTodayVNStr, isSameDayYYYY, formatDateToDisplay } = require("../utils/dateUtilsForSession");
const { timeStrToMinutes, getCurrentMinutesVN } = require("../utils/timeUtilsForSession");
const { getFreeTimeSlots, CLASS_DURATION_MINUTES, toMinutes, isOverlapping } = require("../utils/timeUtils");

const createAttendanceIfNeeded = async (session, classData) => {
    if (!session || !classData) {
        throw new Error("Session or class data is missing");
    }

    if (session.attendance && session.attendance.length > 0) {
        return `Attendance cho buổi học (${formatDateToDisplay(session.session_date.toISOString().slice(0, 10))}) đã tồn tại.`;
    }

    const nowMinutes = getCurrentMinutesVN();
    const startMinutes = timeStrToMinutes(session.start_time);
    const endMinutes = timeStrToMinutes(session.end_time);

    if (nowMinutes < startMinutes) {
        return `Chưa tới giờ học (${session.start_time}).`;
    }
    if (nowMinutes > endMinutes) {
        return `Đã quá giờ học (${session.end_time}).`;
    }

    session.attendance = classData.students.map((item) => ({
        student_id: item.student_id,
        status: "absent",
    }));

    await session.save();
    return `Đã tạo danh sách điểm danh cho buổi học (${formatDateToDisplay(session.session_date.toISOString().slice(0, 10))}).`;
};

const createAttendanceForNormalSession = async (classId, substituteTeacherId = null) => {
    if (!classId) throw new Error("Thiếu classId.");

    const todayVN = getTodayVNStr();
    const todayDate = parseSessionDate(todayVN);

    const session = await Session.findOne({ class_id: classId, session_date: todayDate });
    if (!session) {
        return { message: `Hôm nay (${formatDateToDisplay(todayVN)}) không có buổi học.` };
    }

    if (session.is_canceled) {
        return { message: `Buổi học hôm nay (${formatDateToDisplay(todayVN)}) đã bị hủy.` };
    }

    if (substituteTeacherId) {
        session.substitute_teacher_id = substituteTeacherId;
        await session.save();
    }

    const classData = await Class.findById(classId).populate("students.student_id", "first_name last_name email");
    if (!classData) throw new Error("Class not found");

    const msg = await createAttendanceIfNeeded(session, classData);
    if (substituteTeacherId && session.attendance.length > 0) {
        return {
            message: `Đã cập nhật giáo viên dạy thay cho buổi học hôm nay (${formatDateToDisplay(todayVN)}).`,
            sessionId: session._id,
        };
    }

    return { message: msg, sessionId: session._id };
};

const createMakeupOrOffSession = async (classId, offDate, makeupDate, substituteTeacherId = null, startTime = null, endTime = null) => {
    if (!classId || !offDate || !makeupDate) {
        throw new Error("Thiếu classId, offDate hoặc makeupDate.");
    }

    const offDateObj = parseSessionDate(offDate);
    const makeupDateObj = parseSessionDate(makeupDate);

    const existing = await Session.findOne({ class_id: classId, session_date: offDateObj });
    if (!existing) {
        throw new Error(`Không tìm thấy session ngày ${formatDateToDisplay(offDate)} để OFF.`);
    }

    existing.attendance = [];
    existing.is_canceled = true;
    existing.is_makeup = false;
    existing.topic = `Buổi nghỉ ngày ${formatDateToDisplay(offDate)}`;
    await existing.save();

    const newSession = await Session.create({
        class_id: classId,
        session_date: makeupDateObj,
        start_time: startTime || existing.start_time,
        end_time: endTime || existing.end_time,
        topic: `Buổi học bù ngày ${formatDateToDisplay(makeupDate)}`,
        substitute_teacher_id: substituteTeacherId || null,
        is_makeup: true,
        is_canceled: false,
    });

    const result = {
        message: `Đã OFF ngày ${formatDateToDisplay(offDate)} và tạo buổi học bù ngày ${formatDateToDisplay(makeupDate)}.`,
        offSessionId: existing._id,
        makeupSessionId: newSession._id,
    };

    if (isSameDayYYYY(getTodayVNStr(), makeupDate)) {
        const classData = await Class.findById(classId).populate("students.student_id", "first_name last_name email");
        const msg = await createAttendanceIfNeeded(newSession, classData);
        result.message = msg;
    }

    return result;
};

const getTeacherFreeSlotsInDay = async (teacherId, session_date) => {
    if (!teacherId || !session_date) {
        throw new Error("Thiếu teacherId hoặc session_date");
    }

    const dateObj = parseSessionDate(session_date);
    const nextDayObj = new Date(dateObj.getTime() + 24 * 60 * 60 * 1000);

    const classes = await Class.find({ teacher_id: teacherId }).select("_id");
    const classIds = classes.map((cls) => cls._id);

    // 🔥 Dùng range query để lấy sessions đúng ngày
    const sessions = await Session.find({
        session_date: { $gte: dateObj, $lt: nextDayObj },
        $or: [{ substitute_teacher_id: teacherId }, { class_id: { $in: classIds } }],
    }).select("start_time end_time");

    const freeSlots = getFreeTimeSlots(sessions);
    return freeSlots.filter((slot) => toMinutes(slot.end) - toMinutes(slot.start) >= CLASS_DURATION_MINUTES);
};

const getAvailableTeachers = async (session_date, start_time, end_time) => {
    if (!session_date || !start_time || !end_time) {
        throw new Error("Thiếu session_date, start_time hoặc end_time");
    }

    const dateObj = parseSessionDate(session_date);
    const sessions = await Session.find({ session_date: dateObj }).populate("class_id", "teacher_id");
    const busyTeachers = new Set();

    sessions.forEach((session) => {
        if (isOverlapping(session.start_time, session.end_time, start_time, end_time)) {
            if (session.substitute_teacher_id) busyTeachers.add(session.substitute_teacher_id.toString());
            if (session.class_id?.teacher_id) busyTeachers.add(session.class_id.teacher_id.toString());
        }
    });

    const teachers = await User.find({ user_type: "teacher" }).select("first_name last_name email");
    return teachers
        .filter((teacher) => !busyTeachers.has(teacher._id.toString()))
        .map((teacher) => ({
            id: teacher._id,
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            email: teacher.email,
        }));
};

module.exports = {
    createAttendanceForNormalSession,
    createMakeupOrOffSession,
    getTeacherFreeSlotsInDay,
    getAvailableTeachers,
};
