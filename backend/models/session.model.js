const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        class_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
        },

        session_date: {
            type: Date,
            required: true,
        },

        start_time: {
            type: String,
            required: true,
        },

        end_time: {
            type: String,
            required: true,
        },

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

        attendance: {
            type: [
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
            default: [],
        },
    },
    { timestamps: true },
);

// 🔥 chống duplicate session
sessionSchema.index(
    {
        class_id: 1,
        session_date: 1,
        start_time: 1,
        end_time: 1,
    },
    { unique: true },
);

// 🔥 query nhanh
sessionSchema.index({ class_id: 1, session_date: 1 });

// 🔥 teacher query
sessionSchema.index({ substitute_teacher_id: 1 });

module.exports = mongoose.model("Session", sessionSchema);
