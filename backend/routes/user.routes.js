const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

/* ================= ROUTES ================= */

router.get("/all", authMiddleware, authorizeRoles("admin"), userController.getAllUsers);

router.get("/search", authMiddleware, userController.getUsersByName);

router.get("/role/:role", authMiddleware, authorizeRoles("admin", "teacher"), userController.getUsersByRole);

router.put("/update", authMiddleware, authorizeRoles("admin"), userController.updateUser);

router.put("/account", authMiddleware, upload.single("avatar"), userController.updateUserAccount);

router.delete("/delete/:id", authMiddleware, authorizeRoles("admin"), userController.deleteUserById);

module.exports = router;
