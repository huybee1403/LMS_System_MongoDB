const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const attendanceController = require("../controllers/attendance.controller");

router.post("/", authMiddleware, authorizeRoles("admin", "teacher"), attendanceController.markAttendance);
router.get("/session/:sessionId", authMiddleware, authorizeRoles("admin", "teacher"), attendanceController.getAttendanceBySession);
router.get("/student/:studentId/class/:classId", authMiddleware, authorizeRoles("admin", "teacher"), attendanceController.getStudentAttendanceInClass);
router.put("/update", authMiddleware, authorizeRoles("admin", "teacher"), attendanceController.updateAttendanceStatus);

module.exports = router;
