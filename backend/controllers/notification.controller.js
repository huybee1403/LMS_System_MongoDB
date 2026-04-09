const NotificationService = require("../services/notification.service");

exports.getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await NotificationService.getNotificationsByUser(userId);
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ message: err.message || "Không thể lấy thông báo" });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const total = await NotificationService.getUnreadCountByUser(userId);
        res.json({ success: true, total });
    } catch (err) {
        res.status(500).json({ message: err.message || "Không thể lấy số thông báo chưa đọc" });
    }
};

exports.markRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const success = await NotificationService.markNotificationAsRead(id, userId);
        if (!success) return res.status(404).json({ message: "Thông báo không tồn tại" });
        res.json({ success: true, message: "Đã đọc thông báo" });
    } catch (err) {
        res.status(500).json({ message: err.message || "Không thể cập nhật trạng thái thông báo" });
    }
};

exports.markAllRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await NotificationService.markAllNotificationsAsRead(userId);
        res.json({ success: true, message: "Đã đọc tất cả thông báo" });
    } catch (err) {
        res.status(500).json({ message: err.message || "Không thể cập nhật tất cả thông báo" });
    }
};
