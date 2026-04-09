const authService = require("../services/auth.service");

/* REGISTER */
exports.register = async (req, res) => {
    try {
        const { email, password, user_type } = req.body;

        await authService.register(email, password, user_type);

        res.status(201).json({
            message: "Đăng ký thành công. Vui lòng đăng nhập để hoàn tất hồ sơ.",
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/* LOGIN */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const data = await authService.login(email, password, res);

        res.json({
            message: "Đăng nhập thành công",
            data: data,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/* REFRESH TOKEN */
exports.refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        const accessToken = await authService.refreshToken(token, res);

        res.json({ accessToken });
    } catch (err) {
        res.status(401).json({ message: err.message });
    }
};

/* LOGOUT */
exports.logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        await authService.logout(refreshToken, res); // ✅ truyền res

        res.json({ message: "Đăng xuất thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* FORGOT PASSWORD */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        await authService.forgotPassword(email);

        res.json({ message: "Kiểm tra email để đặt lại mật khẩu" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/* RESET PASSWORD */
exports.resetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;

        if (!token || !new_password) {
            return res.status(400).json({
                message: "Thiếu token hoặc mật khẩu mới",
            });
        }

        await authService.resetPassword(token, new_password);

        res.json({
            message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/* COMPLETE PROFILE */
exports.completeProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const { first_name, last_name, phone_number, address, date_of_birth } = req.body;

        const result = await authService.completeProfile(userId, first_name, last_name, phone_number, address, date_of_birth);

        res.json({
            message: "Cập nhật hồ sơ thành công",
            data: result,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

/* HEARTBEAT */
exports.heartbeat = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await authService.handleHeartbeat(userId);

        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
