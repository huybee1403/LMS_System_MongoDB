const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const sessionController = require("../controllers/session.controller");

router.post("/normal", authMiddleware, authorizeRoles("admin", "teacher"), sessionController.createNormalSession);
router.post("/makeup-off", authMiddleware, authorizeRoles("admin", "teacher"), sessionController.createMakeupOrOff);
router.get("/:teacherId/free-slots", authMiddleware, authorizeRoles("admin", "teacher"), sessionController.getFreeSlots);
router.get("/teachers/available", authMiddleware, authorizeRoles("admin", "teacher"), sessionController.getAvailableTeachersController);

module.exports = router;
