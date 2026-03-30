// src/models/refreshToken.model.js
const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        token: String,

        expires_at: Date,

        is_revoked: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model("RefreshToken", refreshTokenSchema);
