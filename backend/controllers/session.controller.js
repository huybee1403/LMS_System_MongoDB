const sessionService = require("../services/session.service");

exports.createNormalSession = async (req, res) => {
    try {
        const { classId, substituteTeacherId } = req.body;
        const result = await sessionService.createAttendanceForNormalSession(classId, substituteTeacherId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message || "Lỗi server khi tạo buổi học bình thường." });
    }
};

exports.createMakeupOrOff = async (req, res) => {
    try {
        const { classId, substituteTeacherId, makeupDate, offDate, start_time, end_time } = req.body;
        if (!classId || !offDate || !makeupDate) {
            return res.status(400).json({ message: "Thiếu classId, offDate hoặc makeupDate." });
        }
        const result = await sessionService.createMakeupOrOffSession(classId, offDate, makeupDate, substituteTeacherId, start_time, end_time);
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message || "Lỗi server khi tạo buổi học bù hoặc OFF." });
    }
};

exports.getFreeSlots = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const session_date = req.query.date;
        if (!teacherId || !session_date) {
            return res.status(400).json({ message: "Thiếu teacherId hoặc date" });
        }
        const slots = await sessionService.getTeacherFreeSlotsInDay(teacherId, session_date);
        res.json({ teacherId, date: session_date, freeSlots: slots });
    } catch (err) {
        res.status(500).json({ message: err.message || "Lỗi server khi lấy slot trống" });
    }
};

exports.getAvailableTeachersController = async (req, res) => {
    try {
        const { date: session_date, start_time, end_time } = req.query;
        if (!session_date || !start_time || !end_time) {
            return res.status(400).json({ message: "Thiếu date, start_time hoặc end_time" });
        }
        const availableTeachers = await sessionService.getAvailableTeachers(session_date, start_time, end_time);
        res.json({ date: session_date, start_time, end_time, availableTeachers });
    } catch (err) {
        res.status(500).json({ message: err.message || "Lỗi server khi lấy danh sách giáo viên rảnh" });
    }
};
