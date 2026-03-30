// src/models/user.model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        user_type: {
            type: String,
            enum: ["student", "teacher", "admin"],
            default: "student",
        },

        first_name: { type: String, required: true },
        last_name: { type: String, required: true },

        avatar: String,

        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },

        phone_number: String,
        address: String,
        date_of_birth: Date,

        is_online: { type: Boolean, default: false },
        last_seen: Date,
    },
    { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
