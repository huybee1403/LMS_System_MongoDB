const express = require("express");
const router = express.Router();
const classController = require("../controllers/class.controller");
const upload = require("../middlewares/uploadExcel.middleware");

// ================= CRUD =================
router.post("/create", classController.createClass);
router.get("/all", classController.getAllClasses);
router.get("/get-class", classController.getClassesByDate);
router.get("/get/:id", classController.getClassById);
router.put("/update/:id", classController.updateClass);
router.delete("/delete/:id", classController.deleteClass);

// ================= ENROLL =================
router.post("/upload-students/:id", upload.single("file"), classController.uploadStudents);
router.post("/remove-student/:id", classController.removeStudent);

module.exports = router;
