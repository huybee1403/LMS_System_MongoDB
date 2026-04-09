// context/NotificationContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { getAllNotifications, markAllNotificationsRead } from "../../services/apis/api";

// Tạo context
const NotificationContext = createContext();

// Provider
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    // Hàm lấy danh sách thông báo
    const getNotifications = async () => {
        try {
            setLoading(true);
            const response = await getAllNotifications();
            setNotifications(response);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách thông báo:", error);
            setLoading(false);
        }
    };

    // Hàm đánh dấu tất cả thông báo là đã đọc
    const markAllRead = async () => {
        try {
            await markAllNotificationsRead(); // Gọi API backend
        } catch (error) {
            console.error("Lỗi khi đánh dấu tất cả thông báo là đã đọc:", error);
        }
    };

    // Context value
    return (
        <NotificationContext.Provider
            value={{
                notifications,
                loading,
                refreshNotifications: getNotifications,
                markAllRead,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);

