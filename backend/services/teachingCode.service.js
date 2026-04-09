const crypto = require("crypto");
const moment = require("moment-timezone");
const Session = require("../models/session.model");
const User = require("../models/user.model");
const { getTodayVNStr, formatDateToISO, VN_TZ } = require("../utils/dateUtilsForSession");
const { timeStrToMinutes } = require("../utils/timeUtilsForSession");
const sendEmail = require("../utils/sendEmail");
const { TEACHING_CODE, DATE_FORMAT } = require("../constants/constants");

const generateTeachingCode = () => {
    const randomNumber = crypto.randomInt(0, Math.pow(10, TEACHING_CODE.LENGTH));
    return String(randomNumber).padStart(TEACHING_CODE.LENGTH, "0");
};

const nowVN = () => {
    return new Date(new Date().toLocaleString("en-US", { timeZone: VN_TZ }));
};

const createAndSendCode = async (sessionId) => {
    const todayVN = getTodayVNStr();
    const session = await Session.findOne({ _id: sessionId, is_canceled: false }).populate("class_id", "teacher_id");
    if (!session) throw new Error("Không tìm thấy buổi học hợp lệ để gửi mã xác nhận");

    const sessionDate = formatDateToISO(session.session_date);
    if (sessionDate !== todayVN) throw new Error("Chỉ có thể gửi mã xác nhận cho buổi học hôm nay");
    if (session.confirmed) throw new Error("Buổi học này đã được xác nhận trước đó");

    const teacherId = session.substitute_teacher_id || session.class_id?.teacher_id;
    if (!teacherId) throw new Error("Không tìm thấy giáo viên của buổi học này");

    const teacher = await User.findById(teacherId).select("email");
    if (!teacher) throw new Error("Không tìm thấy thông tin giáo viên");

    const now = nowVN();
    const startTime = timeStrToMinutes(session.start_time);
    const endTime = timeStrToMinutes(session.end_time);
    const current = now.getHours() * 60 + now.getMinutes();

    if (current < startTime || current > endTime) {
        throw new Error("Chỉ có thể gửi mã trong thời gian diễn ra buổi học");
    }

    const code = generateTeachingCode();
    const expiry = moment.tz(`${sessionDate} ${session.end_time}`, DATE_FORMAT.ISO_TIME, VN_TZ).toDate();

    session.teaching_code = code;
    session.code_expiry = expiry;
    await session.save();

    await sendEmail.sendTeachingCodeEmail(teacher.email, code);
    return { code, expiry };
};

const confirmSessionCode = async (sessionId, code) => {
    if (!code) throw new Error("Thiếu mã xác nhận");

    const now = new Date();
    const session = await Session.findOne({
        _id: sessionId,
        teaching_code: code,
        code_expiry: { $gte: now },
    });

    if (!session) {
        throw new Error("Mã xác nhận không hợp lệ hoặc đã hết hạn");
    }

    session.confirmed = true;
    await session.save();
    return true;
};

module.exports = {
    generateTeachingCode,
    createAndSendCode,
    confirmSessionCode,
};
