const Class = require("../models/class.model");
const Session = require("../models/session.model");
const User = require("../models/user.model");
const moment = require("moment-timezone");
const XLSX = require("xlsx");

const { toMinutes, formatToVN } = require("../utils/helper");
const { generatePlannedSessions, checkTeacherConflict, findMakeupSlot, normalizeDaysOfWeek } = require("../utils/scheduleHelper");
const { VN_TZ } = require("../utils/dateUtilsForSession");
const { TIME_CONFIG } = require("../constants/constants");

const computeEndDate = (startDate, duration) => {
    if (!duration || duration <= 0) return null;
    return moment
        .tz(startDate, VN_TZ)
        .add(duration * 7 - 1, "days")
        .endOf("day")
        .toDate();
};

const getMostCommonTimeRange = (sessions) => {
    const counter = new Map();

    sessions.forEach((session) => {
        const key = `${session.start_time}|${session.end_time}`;
        counter.set(key, (counter.get(key) || 0) + 1);
    });

    let mostCommon = null;
    let maxCount = 0;

    for (const [key, count] of counter.entries()) {
        if (count > maxCount) {
            mostCommon = key;
            maxCount = count;
        }
    }

    if (!mostCommon) return null;
    const [start_time, end_time] = mostCommon.split("|");
    return { start_time, end_time };
};

const mapSessionSummary = (session) => ({
    _id: session._id,
    topic: session.topic,
    start_time: session.start_time,
    end_time: session.end_time,
    session_date: formatToVN(session.session_date),
    is_canceled: session.is_canceled || false,
    is_makeup: session.is_makeup || false,
    confirmed: session.confirmed || false,
    substitute_teacher_id: session.substitute_teacher_id?._id || session.substitute_teacher_id || null,
    substitute_teacher_name: session.substitute_teacher_id ? `${session.substitute_teacher_id.first_name || ""} ${session.substitute_teacher_id.last_name || ""}`.trim() : null,
    attendances: session.attendance || [],
});

const generateSessions = async (classData) => {
    if (!classData.teacher_id) {
        throw new Error("Class must have teacher");
    }

    const plannedDates = generatePlannedSessions(classData.start_date, classData.duration || 0, classData.days_of_week || []);

    const createdSessions = [];
    let topicCounter = 1;

    for (const current of plannedDates) {
        const sessionDateStr = current.format("YYYY-MM-DD");

        let sessionDate = moment.tz(sessionDateStr, "YYYY-MM-DD", VN_TZ).startOf("day").toDate();

        let sessionStart = classData.start_time;
        let sessionEnd = classData.end_time;
        let isMakeup = false;

        const conflict = await checkTeacherConflict(classData.teacher_id, sessionDateStr, sessionStart, sessionEnd);

        if (conflict) {
            const makeupSlot = await findMakeupSlot(classData.teacher_id, sessionDateStr, sessionStart, sessionEnd, classData.end_date);

            if (!makeupSlot) continue;

            sessionDate = moment.tz(makeupSlot.date, "YYYY-MM-DD", VN_TZ).startOf("day").toDate();

            sessionStart = makeupSlot.start_time;
            sessionEnd = makeupSlot.end_time;

            // 🔥 Không đánh dấu là makeup khi tìm thấy slot rảnh thông minh
            isMakeup = false;
        }

        const session = await Session.create({
            class_id: classData._id,
            session_date: sessionDate,
            start_time: sessionStart,
            end_time: sessionEnd,
            topic: `Buổi ${topicCounter}`,
            is_makeup: isMakeup,
        });

        createdSessions.push(session);
        topicCounter++;
    }

    return createdSessions;
};

// ================= CREATE =================
const createClass = async (data) => {
    data.days_of_week = normalizeDaysOfWeek(data.days_of_week);
    if (data.days_of_week.length === 0) {
        throw new Error("days_of_week is required and must contain valid weekdays");
    }

    if (!data.start_date) {
        throw new Error("start_date is required");
    }

    if (!data.end_date && data.duration) {
        data.end_date = computeEndDate(data.start_date, Number(data.duration));
    }

    if (!data.end_date) {
        throw new Error("end_date is required when duration is not provided");
    }

    if (data.number_of_sessions_per_week && Number(data.number_of_sessions_per_week) !== data.days_of_week.length) {
        throw new Error("number_of_sessions_per_week must match the number of days_of_week");
    }

    if (toMinutes(data.start_time) < TIME_CONFIG.MIN_START_TIME_MINUTES || toMinutes(data.end_time) > TIME_CONFIG.MAX_END_TIME_MINUTES) {
        throw new Error("Time must be between 07:30 - 22:30");
    }

    const classPayload = {
        ...data,
        days_of_week: data.days_of_week,
    };

    const newClass = await Class.create(classPayload);
    const createdSessions = await generateSessions(newClass);

    if (createdSessions.length > 0) {
        const endDate = createdSessions[createdSessions.length - 1].session_date;
        const commonTime = getMostCommonTimeRange(createdSessions);
        const updatePayload = { end_date: endDate };
        if (commonTime) {
            updatePayload.start_time = commonTime.start_time;
            updatePayload.end_time = commonTime.end_time;
        }
        await Class.findByIdAndUpdate(newClass._id, updatePayload, { new: true });
    }

    const refreshed = await Class.findById(newClass._id);
    return {
        ...refreshed.toObject(),
        start_date: formatToVN(refreshed.start_date),
        end_date: formatToVN(refreshed.end_date),
    };
};

// ================= GET ALL =================
const getAllClasses = async ({ teacherId = null, includeSubstitute = false } = {}) => {
    let classQuery = {};

    if (teacherId) {
        const queryConditions = [{ teacher_id: teacherId }];

        if (includeSubstitute) {
            const substituteClassIds = await Session.distinct("class_id", {
                substitute_teacher_id: teacherId,
                is_makeup: true,
            });

            if (substituteClassIds.length > 0) {
                queryConditions.push({ _id: { $in: substituteClassIds } });
            }
        }

        classQuery = { $or: queryConditions };
    }

    const classes = await Class.find(classQuery).populate("teacher_id", "first_name last_name email").populate("students.student_id", "first_name last_name email");

    const classIds = classes.map((item) => item._id);
    const sessions = await Session.find({ class_id: { $in: classIds } })
        .populate("substitute_teacher_id", "first_name last_name email")
        .sort({ session_date: 1, start_time: 1 });

    const sessionsByClassId = new Map();
    const substituteTeacherIdsByClassId = new Map();
    sessions.forEach((session) => {
        const classId = session.class_id?.toString();
        if (!classId) return;
        if (!sessionsByClassId.has(classId)) {
            sessionsByClassId.set(classId, []);
        }
        if (!substituteTeacherIdsByClassId.has(classId)) {
            substituteTeacherIdsByClassId.set(classId, new Set());
        }

        const substituteTeacherId = session.substitute_teacher_id?._id?.toString() || session.substitute_teacher_id?.toString();
        if (substituteTeacherId) {
            substituteTeacherIdsByClassId.get(classId).add(substituteTeacherId);
        }

        sessionsByClassId.get(classId).push(mapSessionSummary(session));
    });

    return classes.map((c) => ({
        ...c.toObject(),
        start_date: formatToVN(c.start_date),
        end_date: formatToVN(c.end_date),
        sessions: sessionsByClassId.get(c._id.toString()) || [],
        assigned_substitute_teacher_ids: Array.from(substituteTeacherIdsByClassId.get(c._id.toString()) || []),
    }));
};

const getClassesByDate = async (date) => {
    if (!date) {
        throw new Error("Tham số date là bắt buộc");
    }

    const parsedDate = moment.tz(date, "YYYY-MM-DD", VN_TZ);
    if (!parsedDate.isValid()) {
        throw new Error("Định dạng date không hợp lệ, vui lòng dùng YYYY-MM-DD");
    }

    const dateString = parsedDate.format("YYYY-MM-DD");

    const startOfDay = parsedDate.startOf("day").toDate();
    const endOfDay = parsedDate.clone().endOf("day").toDate();

    // 🔥 LẤY SESSION + POPULATE
    const sessions = await Session.find({
        session_date: { $gte: startOfDay, $lte: endOfDay },
    })
        .populate({
            path: "class_id",
            populate: {
                path: "teacher_id",
                select: "first_name last_name email",
            },
        })
        .populate({
            path: "substitute_teacher_id", // ✅ FIX: thêm populate giáo viên dạy bù
            select: "first_name last_name email",
        })
        .sort({ start_time: 1 });

    // 🔥 GROUP THEO CLASS
    const classMap = new Map();

    for (const s of sessions) {
        const classId = s.class_id?._id?.toString();
        if (!classId) continue;

        if (!classMap.has(classId)) {
            classMap.set(classId, {
                ...s.class_id.toObject(),

                class_name: s.class_id.name || `Lớp ${classId}`,

                teacher_name: `${s.class_id.teacher_id?.first_name || ""} ${s.class_id.teacher_id?.last_name || ""}`,

                total_students: s.class_id.students?.length || 0,

                start_date: formatToVN(s.class_id.start_date),
                end_date: formatToVN(s.class_id.end_date),

                scheduled_date: dateString,
                sessions: [],
            });
        }

        classMap.get(classId).sessions.push(mapSessionSummary(s));
    }

    return Array.from(classMap.values());
};

// ================= GET BY ID =================
const getClassById = async (id) => {
    const classData = await Class.findById(id).populate("teacher_id", "first_name last_name email").populate("students.student_id", "first_name last_name email");

    if (!classData) throw new Error("Class not found");

    const sessions = await Session.find({ class_id: id }).sort({ session_date: 1, start_time: 1 });

    const classObject = classData.toObject();

    return {
        ...classObject,
        start_date: formatToVN(classData.start_date),
        end_date: formatToVN(classData.end_date),
        sessions,
        teacher_first_name: classObject.teacher_id?.first_name || "",
        teacher_last_name: classObject.teacher_id?.last_name || "",
    };
};

// ================= UPDATE =================
const updateClass = async (id, data) => {
    const oldClass = await Class.findById(id);
    if (!oldClass) throw new Error("Class not found");

    if (data.days_of_week) {
        data.days_of_week = normalizeDaysOfWeek(data.days_of_week);
        if (data.days_of_week.length === 0) {
            throw new Error("days_of_week is required and must contain valid weekdays");
        }
    }

    if (data.duration && !data.end_date) {
        const startDate = data.start_date || oldClass.start_date;
        data.end_date = computeEndDate(startDate, Number(data.duration));
    }

    if (data.number_of_sessions_per_week && data.days_of_week && Number(data.number_of_sessions_per_week) !== data.days_of_week.length) {
        throw new Error("number_of_sessions_per_week must match the number of days_of_week");
    }

    if (data.start_time || data.end_time) {
        const startTime = data.start_time || oldClass.start_time;
        const endTime = data.end_time || oldClass.end_time;
        if (toMinutes(startTime) < TIME_CONFIG.MIN_START_TIME_MINUTES || toMinutes(endTime) > TIME_CONFIG.MAX_END_TIME_MINUTES) {
            throw new Error("Time must be between 07:30 - 22:30");
        }
    }

    const updated = await Class.findByIdAndUpdate(id, data, {
        new: true,
    });

    // remove old sessions
    await Session.deleteMany({ class_id: id });

    // regenerate
    const createdSessions = await generateSessions(updated);
    if (createdSessions.length > 0) {
        const endDate = createdSessions[createdSessions.length - 1].session_date;
        const commonTime = getMostCommonTimeRange(createdSessions);
        const updatePayload = { end_date: endDate };
        if (commonTime) {
            updatePayload.start_time = commonTime.start_time;
            updatePayload.end_time = commonTime.end_time;
        }
        await Class.findByIdAndUpdate(id, updatePayload, { new: true });
    }

    const refreshed = await Class.findById(id);

    return {
        ...refreshed.toObject(),
        start_date: formatToVN(refreshed.start_date),
        end_date: formatToVN(refreshed.end_date),
    };
};

// ================= DELETE =================
const deleteClass = async (id) => {
    const classData = await Class.findById(id);
    if (!classData) throw new Error("Class not found");

    await Session.deleteMany({ class_id: id });
    await Class.findByIdAndDelete(id);

    return true;
};

// ================= UPLOAD STUDENTS =================
const uploadStudentsFromExcel = async (classId, fileBuffer) => {
    const classData = await Class.findById(classId);
    if (!classData) throw new Error("Class not found");

    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) throw new Error("Excel file is empty");

    const emails = [];
    const results = [];

    rows.forEach((row, index) => {
        const rowIndex = index + 2;

        if (!row.email) {
            results.push({
                row: rowIndex,
                email: null,
                status: "error",
                message: "Missing email",
            });
            return;
        }

        const email = row.email.toLowerCase().trim();
        emails.push(email);

        results.push({
            row: rowIndex,
            email,
            status: "pending",
        });
    });

    const users = await User.find({ email: { $in: emails } });

    const userMap = new Map();
    users.forEach((u) => userMap.set(u.email.toLowerCase(), u));

    let added = 0;

    for (let item of results) {
        if (item.status === "error") continue;

        const user = userMap.get(item.email);

        if (!user) {
            item.status = "error";
            item.message = "User not found";
            continue;
        }

        if (user.role && user.role !== "student") {
            item.status = "error";
            item.message = "Not a student";
            continue;
        }

        const exists = classData.students.find((s) => s.student_id.toString() === user._id.toString());

        if (exists) {
            item.status = "error";
            item.message = "Already enrolled";
            continue;
        }

        classData.students.push({ student_id: user._id });
        item.status = "success";
        added++;
    }

    await classData.save();

    return {
        total: rows.length,
        added,
        failed: results.filter((r) => r.status === "error").length,
        results,
    };
};

// ================= REMOVE STUDENT =================
const removeStudent = async (classId, studentId) => {
    const classData = await Class.findById(classId);
    if (!classData) throw new Error("Class not found");

    classData.students = classData.students.filter((s) => s.student_id.toString() !== studentId);

    await classData.save();

    return classData;
};

module.exports = {
    createClass,
    getAllClasses,
    getClassesByDate,
    getClassById,
    updateClass,
    deleteClass,
    uploadStudentsFromExcel,
    removeStudent,
};
