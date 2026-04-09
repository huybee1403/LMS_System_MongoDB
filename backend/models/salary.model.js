// src/models/salary.model.js
const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
    {
        teacher_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        month: Number,
        year: Number,

        rate_per_session: { type: Number, default: 200000 },
        substitute_coefficient: { type: Number, default: 1.2 },
        makeup_coefficient: { type: Number, default: 1.2 },

        total_sessions: Number,
        total_makeup_sessions: Number,
        total_substitute_sessions: Number,

        total_salary: Number,
    },
    { timestamps: true },
);

module.exports = mongoose.model("Salary", salarySchema);
