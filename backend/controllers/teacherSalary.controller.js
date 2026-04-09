const TeacherSalaryService = require("../services/teacherSalary.service");
const TeachingCodeService = require("../services/teachingCode.service");
const { exportTeacherSalariesToExcel } = require("../utils/excelHelper");

const TEACHING_CODE_BUSINESS_MESSAGES = new Set([
    "Không tìm thấy buổi học hợp lệ để gửi mã xác nhận",
    "Chỉ có thể gửi mã xác nhận cho buổi học hôm nay",
    "Buổi học này đã được xác nhận trước đó",
    "Không tìm thấy giáo viên của buổi học này",
    "Không tìm thấy thông tin giáo viên",
    "Chỉ có thể gửi mã trong thời gian diễn ra buổi học",
    "Thiếu mã xác nhận",
    "Mã xác nhận không hợp lệ hoặc đã hết hạn",
]);

exports.getSalaries = async (req, res) => {
    try {
        const month = parseInt(req.query.month);
        const year = parseInt(req.query.year);
        if (!month || !year) return res.status(400).json({ message: "Thiếu month hoặc year" });

        await TeacherSalaryService.calculateMonthlySalaries(month, year);
        const salaries = await TeacherSalaryService.getAllSalaries(month, year);
        res.json(salaries);
    } catch (err) {
        res.status(500).json({ message: err.message || "Lỗi khi lấy lương giáo viên" });
    }
};

exports.exportSalaries = async (req, res) => {
    try {
        const month = parseInt(req.query.month);
        const year = parseInt(req.query.year);
        if (!month || !year) return res.status(400).json({ message: "Thiếu month hoặc year" });

        await TeacherSalaryService.calculateMonthlySalaries(month, year);
        const salaries = await TeacherSalaryService.getAllSalariesForExcel(month, year);
        await exportTeacherSalariesToExcel(salaries, month, year, res);
    } catch (err) {
        res.status(500).json({ message: err.message || "Lỗi khi xuất Excel" });
    }
};

exports.getSalaryByTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const month = parseInt(req.query.month);
        const year = parseInt(req.query.year);

        if (!teacherId || !month || !year) {
            return res.status(400).json({ message: "Thiếu teacherId, month hoặc year." });
        }

        const result = await TeacherSalaryService.getByTeacher(teacherId, month, year);
        if (!result) {
            return res.status(404).json({ message: "Không tìm thấy lương cho giáo viên trong tháng này." });
        }

        res.status(200).json({ message: "Lấy dữ liệu lương thành công.", data: result });
    } catch (err) {
        res.status(500).json({ message: err.message || "Lỗi server." });
    }
};

exports.sendTeachingCode = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const result = await TeachingCodeService.createAndSendCode(sessionId);
        return res.json({ success: true, message: "Đã gửi mã xác nhận buổi dạy thành công!", ...result });
    } catch (err) {
        if (TEACHING_CODE_BUSINESS_MESSAGES.has(err.message)) {
            return res.json({ success: false, message: err.message });
        }

        return res.status(500).json({ success: false, message: err.message || "Không thể gửi mã xác nhận buổi dạy" });
    }
};

exports.confirmTeachingCode = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const { code } = req.body;
        const confirmed = await TeachingCodeService.confirmSessionCode(sessionId, code);

        if (confirmed) {
            return res.json({ success: true, message: "Xác nhận buổi dạy thành công" });
        }

        return res.json({ success: false, message: "Mã xác nhận không đúng hoặc đã hết hạn" });
    } catch (err) {
        if (TEACHING_CODE_BUSINESS_MESSAGES.has(err.message)) {
            return res.json({ success: false, message: err.message });
        }

        return res.status(500).json({ success: false, message: err.message || "Không thể xác nhận mã buổi dạy" });
    }
};

exports.updateSalaryConfig = async (req, res) => {
    try {
        const { rate_per_session = null, substitute_coefficient = null, makeup_coefficient = null } = req.body;
        await TeacherSalaryService.updateRateAndCoefficients(rate_per_session, substitute_coefficient, makeup_coefficient);
        res.json({ message: "Cập nhật cấu hình lương thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message || "Lỗi cập nhật cấu hình lương" });
    }
};
