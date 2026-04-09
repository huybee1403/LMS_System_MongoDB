const AttendanceService = require("../services/attendance.service");

exports.markAttendance = async (req, res) => {
    try {
        const { sessionId, studentId, status } = req.body;
        const result = await AttendanceService.markAttendance(sessionId, studentId, status);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message || "Lỗi máy chủ khi cập nhật điểm danh" });
    }
};

exports.getAttendanceBySession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const data = await AttendanceService.getAttendanceBySession(sessionId);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message || "Không thể lấy danh sách điểm danh" });
    }
};

exports.getStudentAttendanceInClass = async (req, res) => {
    try {
        const { studentId, classId } = req.params;
        const data = await AttendanceService.getStudentAttendanceInClass(studentId, classId);
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message || "Không thể lấy lịch sử điểm danh học sinh" });
    }
};

exports.updateAttendanceStatus = async (req, res) => {
    try {
        const { sessionId, studentId, status } = req.body;

        if (!sessionId || !studentId || !status) {
            return res.status(200).json({ success: false, message: "Thiếu thông tin sessionId, studentId hoặc trạng thái" });
        }

        const result = await AttendanceService.updateAttendanceStatus(sessionId, studentId, status);
        return res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message || "Lỗi máy chủ khi cập nhật trạng thái điểm danh" });
    }
};
