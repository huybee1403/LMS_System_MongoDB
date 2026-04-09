const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");
const sendEmail = require("../utils/sendEmail");
const env = require("../configs/env");
const ms = require("ms");

const { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken } = require("../utils/jwt");

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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    /* 🔐 LƯU refresh token vào DB */
    await RefreshToken.create({
        user_id: user._id,
        token: refreshToken,
        expires_at: new Date(Date.now() + ms(env.REFRESH_TOKEN_EXPIRES)),
    });

    await User.findByIdAndUpdate(user._id, {
        is_online: true,
        last_seen: new Date(),
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: ms(env.REFRESH_TOKEN_EXPIRES),
    });

    return {
        accessToken,
        user: {
            id: user._id,
            email: user.email,
            type: user.user_type,
            is_complete_profile: user.is_complete_profile,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number,
            address: user.address,
            date_of_birth: user.date_of_birth,
            avatar: user.avatar,
        },
    };
};

/* ================= REFRESH TOKEN (ROTATION) ================= */
exports.refreshToken = async (token, res) => {
    if (!token) throw new Error("No refresh token");

    const decoded = verifyRefreshToken(token);

    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");

    /* 🔐 CHECK TOKEN TRONG DB */
    const tokenDoc = await RefreshToken.findOne({ token });

    if (!tokenDoc || tokenDoc.is_revoked) {
        throw new Error("Refresh token không hợp lệ");
    }

    if (tokenDoc.expires_at < new Date()) {
        throw new Error("Refresh token đã hết hạn");
    }

    /* 🔁 ROTATION: revoke token cũ */
    tokenDoc.is_revoked = true;
    await tokenDoc.save();

    /* 🔁 TẠO TOKEN MỚI */
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await RefreshToken.create({
        user_id: user._id,
        token: newRefreshToken,
        expires_at: new Date(Date.now() + ms(env.REFRESH_TOKEN_EXPIRES)),
    });

    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: ms(env.REFRESH_TOKEN_EXPIRES),
    });

    return newAccessToken;
};

/* ================= LOGOUT (1 DEVICE) ================= */
exports.logout = async (refreshToken, res) => {
    try {
        if (refreshToken) {
            // revoke token
            await RefreshToken.findOneAndUpdate({ token: refreshToken }, { is_revoked: true });

            // decode token để lấy userId
            try {
                const decoded = verifyRefreshToken(refreshToken);

                const userId = decoded.id;
                // set offline
                if (userId) {
                    await User.findByIdAndUpdate(userId, {
                        is_online: false,
                        last_seen: new Date(),
                    });
                }
            } catch (err) {
                console.log("Token không hợp lệ hoặc đã hết hạn");
            }
        }

        res.clearCookie("refreshToken");
    } catch (err) {
        console.error(err);
    }
};

/* ================= LOGOUT ALL DEVICES ================= */
exports.logoutAll = async (userId) => {
    await RefreshToken.updateMany({ user_id: userId }, { is_revoked: true });
    // ✅ set offline
    await User.findByIdAndUpdate(userId, {
        is_online: false,
        last_seen: new Date(),
    });
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

    /* 🔐 LOGOUT ALL DEVICES */
    await RefreshToken.updateMany({ user_id: user._id }, { is_revoked: true });

    // ✅ set offline
    await User.findByIdAndUpdate(user._id, {
        is_online: false,
        last_seen: new Date(),
    });

    return {
        success: true,
    };
};

/* ================= REQUEST RESET PASSWORD ================= */
exports.forgotPassword = async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error("Email không tồn tại");

    const token = jwt.sign({ email: user.email }, env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

    const resetLink = `${env.FRONTEND_URL}/reset-password/${encodeURIComponent(token)}`;

    await sendEmail.sendResetPasswordEmail(email, resetLink);
};

/* ================= COMPLETE PROFILE ================= */
exports.completeProfile = async (userId, first_name, last_name, phone_number, address, date_of_birth) => {
    await User.findByIdAndUpdate(userId, {
        first_name,
        last_name,
        phone_number,
        address,
        date_of_birth,
        is_complete_profile: true,
    });

    const user = await User.findById(userId);
    return {
        user: {
            id: user._id,
            email: user.email,
            type: user.user_type,
            is_complete_profile: user.is_complete_profile,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number,
            address: user.address,
            date_of_birth: user.date_of_birth,
            avatar: user.avatar,
        },
    };
};

/* ================= HEARTBEAT ================= */
exports.handleHeartbeat = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        is_online: true,
        last_seen: new Date(),
    });

    return { success: true };
};
