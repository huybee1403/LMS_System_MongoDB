// src/models/class.model.js
const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
    {
        name: String,
        description: String,
        duration: Number,

        teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        start_date: Date,
        end_date: Date,

        start_time: String,
        end_time: String,

        status: {
            type: String,
            enum: ["ongoing", "completed", "canceled"],
            default: "ongoing",
        },

        days_of_week: [String],

        number_of_sessions_per_week: {
            type: Number,
            default: 3,
        },

        // 🔥 embed students
        students: [
            {
                student_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                enrolled_at: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true },
);

module.exports = mongoose.model("Class", classSchema);
