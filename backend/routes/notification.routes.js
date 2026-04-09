const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const notificationController = require("../controllers/notification.controller");

router.get("/my", authMiddleware, notificationController.getMyNotifications);
router.get("/unread-count", authMiddleware, notificationController.getUnreadCount);
router.put("/mark-read/:id", authMiddleware, notificationController.markRead);
router.put("/mark-all-read", authMiddleware, notificationController.markAllRead);

module.exports = router;
