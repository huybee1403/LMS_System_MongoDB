const userService = require("../services/user.service");
const User = require("../models/user.model");

/* ================= GET ALL ================= */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= GET BY NAME ================= */
exports.getUsersByName = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ message: "Missing name" });
        }

        const users = await userService.getUsersByName(name);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= GET BY ROLE ================= */
exports.getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;

        const users = await userService.getUsersByRole(role);

        if (!users.length) {
            return res.status(404).json({ message: "No users found" });
        }

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= UPDATE (ADMIN) ================= */
exports.updateUser = async (req, res) => {
    try {
        const { email, new_password, role } = req.body;

        await userService.updateUser(email, new_password, role);

        res.json({ message: "Cập nhật người dùng thành công" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/* ================= UPDATE ACCOUNT ================= */
exports.updateUserAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        const avatar = req.file ? req.file.filename : undefined;

        const updatedUser = await userService.updateUserAccount(userId, {
            ...req.body,
            avatar,
        });

        res.json({
            message: "Cập nhật tài khoản thành công",
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                type: updatedUser.user_type,
                is_complete_profile: updatedUser.is_complete_profile,
                first_name: updatedUser.first_name,
                last_name: updatedUser.last_name,
                phone_number: updatedUser.phone_number,
                address: updatedUser.address,
                date_of_birth: updatedUser.date_of_birth,
                avatar: updatedUser.avatar,
            },
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/* ================= DELETE ================= */
exports.deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await userService.deleteUserById(id);

        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Xóa người dùng thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
