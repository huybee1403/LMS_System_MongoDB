const jwt = require("jsonwebtoken");
const env = require("../configs/env");

exports.generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.user_type,
            is_complete_profile: user.is_complete_profile,
        },
        env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: env.ACCESS_TOKEN_EXPIRES,
        },
    );
};

exports.generateRefreshToken = (user) => {
    return jwt.sign({ id: user._id }, env.REFRESH_TOKEN_SECRET, {
        expiresIn: env.REFRESH_TOKEN_EXPIRES,
    });
};

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
};

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
};
