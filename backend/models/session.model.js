// src/models/session.model.js
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        class_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
        },

        session_date: Date,
        start_time: String,
        end_time: String,

        topic: String,

        is_makeup: { type: Boolean, default: false },
        is_canceled: { type: Boolean, default: false },

        substitute_teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        teaching_code: String,
        code_expiry: Date,

        confirmed: { type: Boolean, default: false },

        // 🔥 attendance embedded
        attendance: [
            {
                student_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                status: {
                    type: String,
                    enum: ["present", "absent", "late", "excused"],
                    default: "absent",
                },
            },
        ],
    },
    { timestamps: true },
);

module.exports = mongoose.model("Session", sessionSchema);
