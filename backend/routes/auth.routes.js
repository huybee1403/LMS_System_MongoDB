const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

/* PUBLIC */
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

/* PRIVATE */
router.post("/logout", authMiddleware, authController.logout);
router.put("/complete-profile", authMiddleware, authController.completeProfile);
router.post("/heartbeat", authMiddleware, authController.heartbeat);

module.exports = router;
