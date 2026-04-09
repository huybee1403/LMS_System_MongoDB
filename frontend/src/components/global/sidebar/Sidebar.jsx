import { useEffect, useRef, useState, useMemo } from "react";
import logo from "../../../images/logo.png";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";
import { useAuth } from "../../../contexts/authentication/AuthContext";

const menuForAdmin = [
    { label: "Danh Sách Tài Khoản", icon: "fa-user", path: "/list-user" },
    { label: "Danh Sách Khóa Học", icon: "fa-book", path: "/list-courses" },
    { label: "Danh Sách Giáo Viên", icon: "fa-address-book", path: "/list-teacher" },
    { label: "Danh Sách Học Sinh", icon: "fa-users", path: "/list-student" },
    { label: "Danh Sách Buổi Học", icon: "fa-calendar-days", path: "/list-calender" },
    { label: "Bảng Lương Giáo Viên", icon: "fa-sack-dollar", path: "/list-salary" },
    { label: "Cài Đặt Thông Tin", icon: "fa-screwdriver-wrench", path: "/setting" },
];

const menuForTeacher = [
    { label: "Lớp Học Của Tôi", icon: "fa-book", path: "/list-courses" },
    { label: "Danh Sách Buổi Dạy", icon: "fa-calendar-days", path: "/list-calender" },
    { label: "Bảng Lương Của Tôi", icon: "fa-sack-dollar", path: "/my-salary" },
];

const menuForStudent = [
    { label: "Lớp Học Của Tôi", icon: "fa-book", path: "/list-courses" },
    { label: "Thời Khóa Biểu", icon: "fa-calendar-days", path: "/list-calender" },
];

const Sidebar = ({ active, offSidebar }) => {
    const sidebarRef = useRef(null);
    const [activeLink, setActiveLink] = useState(0);
    const location = useLocation();
    const { user } = useAuth();

    const homeRouteByRole = {
        admin: "/",
        teacher: "/list-courses",
        student: "/list-courses",
    };

    // chọn menu theo role của user
    const menuItems = useMemo(() => {
        if (user?.type === "teacher") return menuForTeacher;
        else if (user?.type === "student") return menuForStudent;
        else return menuForAdmin;
    }, [user?.type]);

    // Xử lý click outside để đóng sidebar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                offSidebar();
            }
        };

        if (active) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [active, offSidebar]);

    // Cập nhật active link theo đường dẫn
    useEffect(() => {
        const currentPath = location.pathname;

        if (currentPath.startsWith("/class-detail")) {
            setActiveLink(1);
            return;
        }

        const activeIndex = menuItems.findIndex((item) => item.path === currentPath);
        setActiveLink(activeIndex !== -1 ? activeIndex : 0);
    }, [location, menuItems]);

    const handleLinkClick = (index) => setActiveLink(index);

    return (
        <div className={`sidebar ${active ? "active" : ""}`}>
            <div className="sidebar_inner" ref={sidebarRef}>
                <div className="sidebar-close" onClick={offSidebar}>
                    <i className="fa-solid fa-xmark"></i>
                </div>
                <Link to={homeRouteByRole[user?.type]} onClick={() => setActiveLink(0)}>
                    <img src={logo} alt="Logo" />
                </Link>
                <ul>
                    {menuItems.map((item, index) => (
                        <li key={index} className={activeLink === index ? "active" : ""} onClick={() => handleLinkClick(index)}>
                            <Link to={item.path}>
                                <i className={`fa-solid ${item.icon}`}></i> {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
