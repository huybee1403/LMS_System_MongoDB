const moment = require("moment-timezone");
const Salary = require("../models/salary.model");
const Session = require("../models/session.model");
const Class = require("../models/class.model");
const User = require("../models/user.model");
const NotificationService = require("./notification.service");
const { buildMonthRange, VN_TZ } = require("../utils/dateUtilsForSession");
const { SALARY_CONFIG, NOTIFICATION_TYPES } = require("../constants/constants");

const DEFAULT_RATE = SALARY_CONFIG.DEFAULT_RATE_PER_SESSION;
const DEFAULT_SUBSTITUTE_COEF = SALARY_CONFIG.DEFAULT_SUBSTITUTE_COEFFICIENT;
const DEFAULT_MAKEUP_COEF = SALARY_CONFIG.DEFAULT_MAKEUP_COEFFICIENT;

const calculateMonthlySalaries = async (month, year) => {
    const teachers = await User.find({ user_type: "teacher" });
    const { start, end } = buildMonthRange(month, year);
    const sessions = await Session.find({
        session_date: { $gte: start, $lte: end },
        confirmed: true,
        is_canceled: false,
    }).populate("class_id", "teacher_id name");

    const teacherStats = {};
    teachers.forEach((teacher) => {
        teacherStats[teacher._id.toString()] = {
            teacher,
            total_sessions: 0,
            total_makeup_sessions: 0,
            total_substitute_sessions: 0,
            total_salary: 0,
        };
    });

    for (const session of sessions) {
        const mainTeacherId = session.class_id?.teacher_id?.toString();
        const substituteId = session.substitute_teacher_id?.toString();
        const hasDifferentSubstituteTeacher = substituteId && substituteId !== mainTeacherId;

        if (mainTeacherId && teacherStats[mainTeacherId] && !hasDifferentSubstituteTeacher) {
            const stat = teacherStats[mainTeacherId];
            const salaryDoc = await Salary.findOne({ teacher_id: mainTeacherId, month, year });
            const rate = salaryDoc?.rate_per_session ?? DEFAULT_RATE;
            const substitute_coef = salaryDoc?.substitute_coefficient ?? DEFAULT_SUBSTITUTE_COEF;

            if (substituteId === mainTeacherId) {
                stat.total_substitute_sessions += 1;
                stat.total_salary += rate * substitute_coef;
            } else if (session.is_makeup) {
                stat.total_makeup_sessions += 1;
                stat.total_salary += rate;
            } else {
                stat.total_sessions += 1;
                stat.total_salary += rate;
            }
        }

        if (substituteId && teacherStats[substituteId] && substituteId !== mainTeacherId) {
            const stat = teacherStats[substituteId];
            const salaryDoc = await Salary.findOne({ teacher_id: substituteId, month, year });
            const rate = salaryDoc?.rate_per_session ?? DEFAULT_RATE;
            const subCoef = salaryDoc?.substitute_coefficient ?? DEFAULT_SUBSTITUTE_COEF;
            const makeupCoef = salaryDoc?.makeup_coefficient ?? DEFAULT_MAKEUP_COEF;

            stat.total_substitute_sessions += 1;
            if (session.is_makeup) {
                stat.total_makeup_sessions += 1;
                stat.total_salary += rate * makeupCoef;
            } else {
                stat.total_salary += rate * subCoef;
            }
        }
    }

    for (const teacherId of Object.keys(teacherStats)) {
        const stat = teacherStats[teacherId];
        const salaryDoc = await Salary.findOne({ teacher_id: teacherId, month, year });
        const rate = salaryDoc?.rate_per_session ?? DEFAULT_RATE;
        const substitute_coefficient = salaryDoc?.substitute_coefficient ?? DEFAULT_SUBSTITUTE_COEF;
        const makeup_coefficient = salaryDoc?.makeup_coefficient ?? DEFAULT_MAKEUP_COEF;

        await Salary.findOneAndUpdate(
            { teacher_id: teacherId, month, year },
            {
                teacher_id: teacherId,
                month,
                year,
                rate_per_session: rate,
                substitute_coefficient,
                makeup_coefficient,
                total_sessions: stat.total_sessions,
                total_makeup_sessions: stat.total_makeup_sessions,
                total_substitute_sessions: stat.total_substitute_sessions,
                total_salary: stat.total_salary,
            },
            {
                upsert: true,
                returnDocument: "after", // ✅ FIX
                setDefaultsOnInsert: true,
            },
        );

        const alreadyNotified = await NotificationService.hasSalaryNotification(teacherId, month, year);
        if (!alreadyNotified) {
            await NotificationService.notifyUser({
                user_id: teacherId,
                type: NOTIFICATION_TYPES.SALARY_RELEASED,
                title: "💰 Lương Tháng Đã Được Tính",
                message: `Lương tháng ${month}/${year} của bạn đã được cập nhật.`,
                related_id: null,
                notify_date: new Date(),
            });
        }
    }

    const adminNotified = await NotificationService.hasAdminSalaryNotification(month, year);
    if (!adminNotified) {
        await NotificationService.notifyAdmin({
            type: NOTIFICATION_TYPES.SALARY_RELEASED,
            title: "📊 Hoàn Tất Tính Lương",
            message: `Hệ thống đã tính xong lương giáo viên tháng ${month}/${year}.`,
            related_id: null,
            notify_date: new Date(),
        });
    }
};

const getAllSalaries = async (month, year) => {
    const salaries = await Salary.find({ month, year }).populate("teacher_id", "first_name last_name");
    return salaries.map((doc) => ({
        teacher_id: doc.teacher_id._id,
        teacher_name: `${doc.teacher_id.first_name || ""} ${doc.teacher_id.last_name || ""}`.trim(),
        month: doc.month,
        year: doc.year,
        rate_per_session: doc.rate_per_session,
        substitute_coefficient: doc.substitute_coefficient,
        makeup_coefficient: doc.makeup_coefficient,
        total_sessions: doc.total_sessions,
        total_makeup_sessions: doc.total_makeup_sessions,
        total_substitute_sessions: doc.total_substitute_sessions,
        total_salary: doc.total_salary,
    }));
};

const getAllSalariesForExcel = async (month, year) => {
    const salaries = await Salary.find({ month, year }).populate("teacher_id", "first_name last_name");
    const { start, end } = buildMonthRange(month, year);
    const sessions = await Session.find({
        session_date: { $gte: start, $lte: end },
        confirmed: true,
        is_canceled: false,
    }).populate("class_id", "name teacher_id");

    const classesMap = {};
    sessions.forEach((session) => {
        const teacherId = session.substitute_teacher_id?.toString() || session.class_id?.teacher_id?.toString();
        if (!teacherId) return;

        const key = `${teacherId}:${session.class_id?._id?.toString()}`;
        if (!classesMap[key]) {
            classesMap[key] = {
                teacher_id: teacherId,
                teacher_name: "",
                class_id: session.class_id?._id,
                class_name: session.class_id?.name || "",
                total_sessions: 0,
                total_makeup_sessions: 0,
                total_substitute_sessions: 0,
                salary_per_session: DEFAULT_RATE,
                makeup_coefficient: DEFAULT_MAKEUP_COEF,
                substitute_coefficient: DEFAULT_SUBSTITUTE_COEF,
                total_salary: 0,
            };
        }

        const item = classesMap[key];
        const teacherSalary = salaries.find((s) => s.teacher_id._id.toString() === teacherId);
        if (teacherSalary) {
            item.teacher_name = `${teacherSalary.teacher_id.first_name || ""} ${teacherSalary.teacher_id.last_name || ""}`.trim();
            item.salary_per_session = teacherSalary.rate_per_session;
            item.makeup_coefficient = teacherSalary.makeup_coefficient;
            item.substitute_coefficient = teacherSalary.substitute_coefficient;
        }

        if (session.substitute_teacher_id && session.substitute_teacher_id.toString() === teacherId) {
            item.total_substitute_sessions += 1;
            if (session.is_makeup) {
                item.total_makeup_sessions += 1;
                item.total_salary += item.salary_per_session * item.makeup_coefficient;
            } else {
                item.total_salary += item.salary_per_session * item.substitute_coefficient;
            }
        } else if (session.class_id?.teacher_id?.toString() === teacherId) {
            if (session.is_makeup) {
                item.total_salary += item.salary_per_session;
            } else {
                item.total_sessions += 1;
                item.total_salary += item.salary_per_session;
            }
        }
    });

    const grouped = {};
    Object.values(classesMap).forEach((item) => {
        if (!grouped[item.teacher_id]) {
            grouped[item.teacher_id] = {
                teacher_id: item.teacher_id,
                teacher_name: item.teacher_name,
                classes: [],
                total_salary: 0,
            };
        }
        grouped[item.teacher_id].classes.push({
            class_id: item.class_id,
            class_name: item.class_name,
            total_sessions: item.total_sessions,
            total_makeup_sessions: item.total_makeup_sessions,
            total_substitute_sessions: item.total_substitute_sessions,
            salary_per_session: item.salary_per_session,
            makeup_coefficient: item.makeup_coefficient,
            substitute_coefficient: item.substitute_coefficient,
            total_salary: item.total_salary,
        });
        grouped[item.teacher_id].total_salary += item.total_salary;
    });

    return Object.values(grouped);
};

const getByTeacher = async (teacherId, month, year) => {
    const salary = await Salary.findOne({ teacher_id: teacherId, month, year }).populate("teacher_id", "first_name last_name");
    if (!salary) return null;

    const { start, end } = buildMonthRange(month, year);
    const sessions = await Session.find({
        session_date: { $gte: start, $lte: end },
        confirmed: true,
        is_canceled: false,
        $or: [{ substitute_teacher_id: teacherId }, { class_id: { $in: await getClassesByTeacher(teacherId) } }],
    }).populate("class_id", "name teacher_id");

    const classes = {};
    sessions.forEach((session) => {
        const classId = session.class_id?._id?.toString();
        if (!classId) return;
        if (!classes[classId]) {
            classes[classId] = {
                class_id: classId,
                class_name: session.class_id.name || "",
                total_sessions: 0,
                total_makeup_sessions: 0,
                total_substitute_sessions: 0,
            };
        }
        const current = classes[classId];
        const isMain = session.class_id.teacher_id?.toString() === teacherId.toString();
        const isSub = session.substitute_teacher_id?.toString() === teacherId.toString();

        if (isSub) {
            current.total_substitute_sessions += 1;
        } else if (isMain && session.is_makeup) {
            current.total_makeup_sessions += 1;
        } else if (isMain) {
            current.total_sessions += 1;
        }
    });

    return {
        teacher_id: salary.teacher_id._id,
        first_name: salary.teacher_id.first_name,
        last_name: salary.teacher_id.last_name,
        month: salary.month,
        year: salary.year,
        rate_per_session: salary.rate_per_session,
        substitute_coefficient: salary.substitute_coefficient,
        makeup_coefficient: salary.makeup_coefficient,
        total_sessions: salary.total_sessions,
        total_makeup_sessions: salary.total_makeup_sessions,
        total_substitute_sessions: salary.total_substitute_sessions,
        total_salary: salary.total_salary,
        classes: Object.values(classes),
    };
};

const getClassesByTeacher = async (teacherId) => {
    const classes = await Class.find({ teacher_id: teacherId }).select("_id");
    return classes.map((cls) => cls._id);
};

const updateRateAndCoefficients = async (rate_per_session = null, substitute_coefficient = null, makeup_coefficient = null) => {
    const update = {};
    if (rate_per_session !== null) update.rate_per_session = rate_per_session;
    if (substitute_coefficient !== null) update.substitute_coefficient = substitute_coefficient;
    if (makeup_coefficient !== null) update.makeup_coefficient = makeup_coefficient;

    if (Object.keys(update).length === 0) {
        return;
    }

    await Salary.updateMany({}, { $set: update });
};

module.exports = {
    calculateMonthlySalaries,
    getAllSalaries,
    getAllSalariesForExcel,
    getByTeacher,
    updateRateAndCoefficients,
};
