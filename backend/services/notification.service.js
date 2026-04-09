const moment = require("moment-timezone");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const { parseVNDateStartOfDay, parseVNDateEndOfDay, VN_TZ } = require("../utils/dateUtilsForSession");
const { NOTIFICATION_TYPES } = require("../constants/constants");

const createNotification = async ({ user_id, type, title, message, related_id = null, notify_date = null }) => {
    return Notification.create({
        user_id,
        type,
        title,
        message,
        related_id,
        notify_date,
        is_read: false,
    });
};

const notifyAdmin = async ({ type, title, message, related_id = null, notify_date = null }) => {
    const admins = await User.find({ user_type: "admin" }).select("_id");
    const docs = admins.map((admin) => ({
        user_id: admin._id,
        type,
        title,
        message,
        related_id,
        notify_date,
        is_read: false,
    }));
    if (docs.length > 0) {
        await Notification.insertMany(docs);
    }
};

const notifyUser = async ({ user_id, type, title, message, related_id = null, notify_date = null }) => {
    return createNotification({ user_id, type, title, message, related_id, notify_date });
};

const getNotificationsByUser = async (userId) => {
    return Notification.find({ user_id: userId }).sort({ createdAt: -1 });
};

const getUnreadCountByUser = async (userId) => {
    return Notification.countDocuments({ user_id: userId, is_read: false });
};

const markNotificationAsRead = async (id, userId) => {
    const result = await Notification.updateOne({ _id: id, user_id: userId }, { is_read: true });
    return result.modifiedCount > 0;
};

const markAllNotificationsAsRead = async (userId) => {
    await Notification.updateMany({ user_id: userId, is_read: false }, { is_read: true });
};

const hasSalaryNotification = async (user_id, month, year) => {
    const regex = new RegExp(`${month}/${year}`);
    const record = await Notification.findOne({ user_id, type: NOTIFICATION_TYPES.SALARY_RELEASED, message: regex });
    return Boolean(record);
};

const hasAdminSalaryNotification = async (month, year) => {
    const admins = await User.find({ user_type: "admin" }).select("_id");
    const adminIds = admins.map((admin) => admin._id);
    if (adminIds.length === 0) return false;
    const regex = new RegExp(`${month}/${year}`);
    const record = await Notification.findOne({ user_id: { $in: adminIds }, type: NOTIFICATION_TYPES.SALARY_RELEASED, message: regex });
    return Boolean(record);
};

const hasTodayClassNotification = async (userId, sessionId, date) => {
    const start = parseVNDateStartOfDay(date);
    const end = parseVNDateEndOfDay(date);
    const record = await Notification.findOne({
        user_id: userId,
        type: NOTIFICATION_TYPES.TODAY_CLASS,
        related_id: sessionId,
        notify_date: { $gte: start, $lte: end },
    });
    return Boolean(record);
};

const hasAdminTodayClassNotification = async (date) => {
    const admins = await User.find({ user_type: "admin" }).select("_id");
    const adminIds = admins.map((admin) => admin._id);
    if (adminIds.length === 0) return false;
    const start = parseVNDateStartOfDay(date);
    const end = parseVNDateEndOfDay(date);
    const record = await Notification.findOne({
        user_id: { $in: adminIds },
        type: NOTIFICATION_TYPES.TODAY_CLASS,
        notify_date: { $gte: start, $lte: end },
    });
    return Boolean(record);
};

module.exports = {
    createNotification,
    notifyAdmin,
    notifyUser,
    getNotificationsByUser,
    getUnreadCountByUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    hasSalaryNotification,
    hasAdminSalaryNotification,
    hasTodayClassNotification,
    hasAdminTodayClassNotification,
};
