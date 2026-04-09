import React, { useEffect, useRef, useState } from "react";
import "./Header.css";
import thumb from "../../../images/form.png";
import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/authentication/AuthContext";
import avatar from "../../../images/avatar.png";
import { useNotification } from "../../../contexts/notifications/NotificationContext";
import { formatDateVN } from "../../../utils/dateUtils";

const Header = ({ onSidebar }) => {
    const [activeDrop, setActiveDrop] = useState(false); // user dropdown
    const [activeNoti, setActiveNoti] = useState(false); // notification dropdown
    const { handleLogout, user } = useAuth();
    const dropdownRef = useRef(null);
    const notiRef = useRef(null);
    const { notifications, loading, refreshNotifications, markAllRead } = useNotification();

    const avatarSrc = user?.avatar ? `http://localhost:8080/uploads/${user.avatar}${user?.avatar_updated_at ? `?t=${user.avatar_updated_at}` : ""}` : thumb;

    const toggleDrop = () => setActiveDrop(!activeDrop);

    // 🔹 Đóng dropdown nếu click ra ngoài (user & notification)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setActiveDrop(false);
            }
            if (notiRef.current && !notiRef.current.contains(event.target)) {
                setActiveNoti(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 🔹 Tính số thông báo chưa đọc
    const unreadCount = notifications?.data?.filter((n) => n.is_read === 0)?.length || 0;

    return (
        <div className="header">
            <div className="header-hamburger" onClick={onSidebar}>
                <i className="fa-solid fa-bars"></i>
            </div>

            <div className="header-intro">
                <h3>
                    Rất vui được gặp bạn, <b>{user ? user.first_name + " " + user.last_name : "Guest"}</b>
                </h3>
            </div>

            {/* 🔔 Notification */}
            <div className="header-noti" ref={notiRef}>
                <div
                    className={`header-bell ${unreadCount > 0 ? "active" : ""}`}
                    onClick={() => {
                        const newState = !activeNoti;
                        setActiveNoti(newState);

                        if (newState) {
                            markAllRead();
                            refreshNotifications();
                        }
                    }}
                >
                    <i className="fa-regular fa-bell"></i>
                </div>

                <div className={`header-list ${activeNoti ? "active" : ""}`}>
                    <div className="header-list_top">
                        <h3>Thông báo</h3>
                        <div className="noti-close" onClick={() => setActiveNoti(false)}>
                            <i className="fa-solid fa-xmark"></i>
                        </div>
                    </div>

                    <div className="header-tab">
                        <div className="tab">
                            <ul className="tab-content">
                                {loading && <li style={{ fontSize: "var(--fs-14)" }}>Đang tải thông báo...</li>}
                                {!loading && notifications?.data?.length === 0 && <li style={{ fontSize: "var(--fs-14)" }}>Đang tải thông báo...</li>}
                                {!loading &&
                                    notifications?.data?.map((noti) => (
                                        <li key={noti._id}>
                                            <div className="noti-list">
                                                <div className="noti-list_item">
                                                    <div className="noti-list_item-thumb">
                                                        <span>
                                                            <img src={avatar} alt="avatar" />
                                                        </span>
                                                    </div>
                                                    <div className="noti-list_item-content">
                                                        <h3>{noti.title}</h3>
                                                        <ul className="info">
                                                            <li>
                                                                Ngày: <span>{formatDateVN(noti.notify_date)}</span>
                                                            </li>
                                                        </ul>
                                                        <p className="content">{noti.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🔹 User info */}
            <div className="header-user" ref={dropdownRef}>
                <div className="header-user_infor" onClick={toggleDrop}>
                    <div className="header-user_thumb">
                        <img src={avatarSrc} alt="" />
                    </div>
                    <div className="header-user_name">
                        <h3>
                            {user ? user.last_name : "Guest"} <i className="fa fa-caret-down"></i>
                        </h3>
                        <p>Master {user ? user.type : "Guest"}</p>
                    </div>
                    <ul className={`header-user_dropdown ${activeDrop ? "active" : ""}`}>
                        <li>
                            <Link to="account-detail">
                                <i className="fa-solid fa-user"></i> Profile
                            </Link>
                        </li>
                        <li>
                            <Link to="#" onClick={handleLogout}>
                                <i className="fa-solid fa-sign-out"></i> Logout
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Header;
