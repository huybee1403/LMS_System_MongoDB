// src/models/notification.model.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        type: {
            type: String,
            enum: ["class_created", "salary_released", "today_class"],
        },

        title: String,
        message: String,

        related_id: mongoose.Schema.Types.ObjectId,

        notify_date: Date,
        is_read: { type: Boolean, default: false },
    },
    { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
