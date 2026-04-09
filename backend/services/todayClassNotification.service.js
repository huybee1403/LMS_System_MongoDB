const moment = require("moment-timezone");
const Session = require("../models/session.model");
const NotificationService = require("./notification.service");
const Class = require("../models/class.model");
const { getTodayVNStr, parseVNDateStartOfDay, VN_TZ } = require("../utils/dateUtilsForSession");
const { NOTIFICATION_TYPES } = require("../constants/constants");

const notifyTodayClassesOnStartup = async () => {
    try {
        const today = getTodayVNStr();
        const todayDate = parseVNDateStartOfDay(today);

        const sessions = await Session.find({ session_date: todayDate, is_canceled: false }).populate("class_id", "name students.student_id teacher_id");

        if (!sessions.length) {
            console.log("📘 Hôm nay không có buổi học để gửi thông báo.");
            return;
        }

        let totalSessions = sessions.length;

        for (const session of sessions) {
            const classData = session.class_id;
            if (!classData) continue;

            const className = classData.name || "lớp học";
            const teacherId = classData.teacher_id;

            const teacherNotified = await NotificationService.hasTodayClassNotification(teacherId, session._id, today);
            if (!teacherNotified) {
                await NotificationService.notifyUser({
                    user_id: teacherId,
                    type: NOTIFICATION_TYPES.TODAY_CLASS,
                    title: "📚 Hôm Nay Có Buổi Dạy",
                    message: `Hôm nay bạn có buổi dạy lớp "${className}".`,
                    related_id: session._id,
                    notify_date: new Date(),
                });
            }

            const studentIds = classData.students.map((item) => item.student_id).filter(Boolean);
            for (const studentId of studentIds) {
                const studentNotified = await NotificationService.hasTodayClassNotification(studentId, session._id, today);
                if (!studentNotified) {
                    await NotificationService.notifyUser({
                        user_id: studentId,
                        type: NOTIFICATION_TYPES.TODAY_CLASS,
                        title: "📘 Hôm Nay Có Buổi Học",
                        message: `Hôm nay bạn có buổi học lớp "${className}".`,
                        related_id: session._id,
                        notify_date: new Date(),
                    });
                }
            }
        }

        const adminNotified = await NotificationService.hasAdminTodayClassNotification(today);
        if (!adminNotified && totalSessions > 0) {
            await NotificationService.notifyAdmin({
                type: NOTIFICATION_TYPES.TODAY_CLASS,
                title: "📊 Lịch Học Hôm Nay",
                message: `Hôm nay có ${totalSessions} buổi học diễn ra.`,
                related_id: null,
                notify_date: new Date(),
            });
        }

        console.log("✅ Hoàn tất thông báo buổi học hôm nay");
    } catch (err) {
        console.error("❌ Lỗi notifyTodayClassesOnStartup:", err.message || err);
    }
};

module.exports = notifyTodayClassesOnStartup;
