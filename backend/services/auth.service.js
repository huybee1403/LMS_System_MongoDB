const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");
const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } = require("../utils/token");

/* ================= REGISTER ================= */
exports.register = async (email, password, user_type = "student") => {
    const exists = await User.findOne({ email });
    if (exists) throw new Error("Email đã tồn tại");

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        email,
        password: hashedPassword,
        user_type,
    });
};

/* ================= LOGIN ================= */
exports.login = async (email, password, res) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Email không tồn tại");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Sai mật khẩu");

    const isProfileComplete = Boolean(user.first_name && user.last_name && user.phone_number && user.address && user.date_of_birth);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // set cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    return {
        accessToken,
        user: {
            id: user._id,
            email: user.email,
            type: user.user_type,
            isProfileComplete,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number,
            address: user.address,
            date_of_birth: user.date_of_birth,
            avatar: user.avatar,
        },
    };
};

/* ================= REFRESH TOKEN ================= */
exports.refreshToken = async (token) => {
    if (!token) throw new Error("No refresh token");

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");

    return generateAccessToken(user);
};

/* ================= LOGOUT ================= */
exports.logout = async (res) => {
    res.clearCookie("refreshToken");
    return { message: "Logged out" };
};

/* ================= REQUEST RESET PASSWORD ================= */
exports.forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Email không tồn tại");

    const token = jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${encodeURIComponent(token)}`;

    await sendEmail.sendResetPasswordEmail(email, resetLink);
};

/* ================= RESET PASSWORD ================= */
exports.resetPassword = async (token, newPassword) => {
    const decoded = verifyAccessToken(token);

    const user = await User.findOne({ email: decoded.email });
    if (!user) throw new Error("Người dùng không tồn tại");

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
        throw new Error("Mật khẩu mới phải khác mật khẩu cũ");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return {
        success: true,
        message: "Đặt lại mật khẩu thành công",
    };
};

/* ================= COMPLETE PROFILE ================= */
exports.completeProfile = async (userId, first_name, last_name, phone_number, address, date_of_birth) => {
    await User.findByIdAndUpdate(userId, {
        first_name,
        last_name,
        phone_number,
        address,
        date_of_birth,
    });
};

/* ================= HEARTBEAT ================= */
exports.handleHeartbeat = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        last_active: new Date(),
        is_online: true,
    });

    const user = await User.findById(userId);

    return {
        message: "Heartbeat updated",
        is_online: user.is_online,
    };
};

/* ================= LOGOUT (DB version) ================= */
exports.logout = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        is_online: false,
    });

    return { message: "User logged out" };
};
