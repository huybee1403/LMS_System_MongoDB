const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const TeacherSalaryController = require("../controllers/teacherSalary.controller");

router.get("/", authMiddleware, authorizeRoles("admin"), TeacherSalaryController.getSalaries);
router.get("/export", authMiddleware, authorizeRoles("admin"), TeacherSalaryController.exportSalaries);
router.get("/teacher/:teacherId", authMiddleware, authorizeRoles("admin", "teacher"), TeacherSalaryController.getSalaryByTeacher);
router.post("/:id/send-code", authMiddleware, authorizeRoles("admin", "teacher"), TeacherSalaryController.sendTeachingCode);
router.post("/:id/confirm", authMiddleware, authorizeRoles("admin", "teacher"), TeacherSalaryController.confirmTeachingCode);
router.put("/config", authMiddleware, authorizeRoles("admin"), TeacherSalaryController.updateSalaryConfig);

module.exports = router;
