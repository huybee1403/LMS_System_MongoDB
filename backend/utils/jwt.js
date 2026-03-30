const jwt = require("jsonwebtoken");

exports.generateAccessToken = (payload) => {
    return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
        expiresIn: env.ACCESS_TOKEN_EXPIRES,
    });
};
exports.generateRefreshToken = (payload) => {
    return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
        expiresIn: env.REFRESH_TOKEN_EXPIRES,
    });
};

exports.verifyAccessToken = (token) => {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
};

exports.verifyRefreshToken = (token) => {
    return jwt.verify(token, env.REFRESH_TOKEN_SECRET);
};
