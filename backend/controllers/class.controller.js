const classService = require("../services/class.service");

// ================= CREATE =================
exports.createClass = async (req, res) => {
    try {
        const data = await classService.createClass(req.body);

        res.status(201).json({
            message: "Tạo lớp học thành công",
            data,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "Lỗi khi tạo lớp học",
        });
    }
};

// ================= GET ALL =================
exports.getAllClasses = async (req, res) => {
    try {
        const { teacherId, includeSubstitute } = req.query;
        const data = await classService.getAllClasses({
            teacherId,
            includeSubstitute: includeSubstitute === "true",
        });

        res.json({
            message: "Lấy danh sách lớp học thành công",
            data,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message || "Lỗi khi lấy danh sách lớp học",
        });
    }
};

// ================= GET BY ID =================
exports.getClassById = async (req, res) => {
    try {
        const data = await classService.getClassById(req.params.id);

        res.json({
            message: "Lấy thông tin lớp học thành công",
            data,
        });
    } catch (err) {
        res.status(404).json({
            message: err.message || "Không tìm thấy lớp học",
        });
    }
};

// ================= GET CLASSES BY DATE =================
exports.getClassesByDate = async (req, res) => {
    try {
        const { date } = req.query;
        const data = await classService.getClassesByDate(date);

        res.json({
            message: "Lấy danh sách lớp học theo ngày thành công",
            data,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "Lỗi khi lấy lịch học theo ngày",
        });
    }
};

// ================= UPDATE =================
exports.updateClass = async (req, res) => {
    try {
        const data = await classService.updateClass(req.params.id, req.body);

        res.json({
            message: "Cập nhật lớp học thành công",
            data,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "Lỗi khi cập nhật lớp học",
        });
    }
};

// ================= DELETE =================
exports.deleteClass = async (req, res) => {
    try {
        await classService.deleteClass(req.params.id);

        res.json({
            message: "Xoá lớp học thành công",
        });
    } catch (err) {
        res.status(404).json({
            message: err.message || "Không tìm thấy lớp học để xoá",
        });
    }
};

// ================= UPLOAD STUDENTS =================
exports.uploadStudents = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Vui lòng chọn file",
            });
        }

        const data = await classService.uploadStudentsFromExcel(req.params.id, req.file.buffer);

        res.json({
            message: "Tải danh sách học sinh thành công",
            data,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "Lỗi khi upload danh sách học sinh",
        });
    }
};

// ================= REMOVE STUDENT =================
exports.removeStudent = async (req, res) => {
    try {
        const { studentId } = req.body;

        const data = await classService.removeStudent(req.params.id, studentId);

        res.json({
            message: "Xoá học sinh khỏi lớp thành công",
            data,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "Lỗi khi xoá học sinh khỏi lớp",
        });
    }
};
