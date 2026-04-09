import React, { useState, useRef, useEffect } from "react";
import "./ListCalender.css";
import { getTodayInputFormat, formatDateToDisplay, getVietnameseDayOfWeek, loadSavedDate, saveSelectedDate, formatDate } from "../../../utils/dateUtils";
import { getClassesByDate } from "../../../services/apis/api";
import { useAuth } from "../../../contexts/authentication/AuthContext";

const ListCalender = () => {
    const [selectedDate, setSelectedDate] = useState("");
    const [classes, setClasses] = useState({ data: [] }); // 🔥 fix
    const dateInputRef = useRef(null);
    const [shiftFilter, setShiftFilter] = useState("all");

    const { user } = useAuth();

    // 🔹 lấy ngày mặc định
    useEffect(() => {
        const savedDate = loadSavedDate();
        const date = savedDate || getTodayInputFormat();
        setSelectedDate(date);
        saveSelectedDate(date);
    }, []);

    // 🔹 fetch + filter
    useEffect(() => {
        if (!selectedDate) return;

        const fetchClasses = async () => {
            try {
                const res = await getClassesByDate(selectedDate);
                const raw = res?.data || [];

                const userId = user?._id || user?.id;

                const filtered = raw
                    .map((cls) => {
                        const teacherId = cls.teacher_id?._id || cls.teacher_id;

                        let sessions = Array.isArray(cls.sessions) ? cls.sessions : [];

                        if (user?.type === "teacher") {
                            sessions = sessions.filter((session) => {
                                const substituteTeacherId = session?.substitute_teacher_id;
                                return String(teacherId) === String(userId) || String(substituteTeacherId) === String(userId);
                            });
                        }

                        sessions = sessions.filter((session) => {
                            const start = session?.start_time;
                            if (!start) return false;

                            const hour = parseInt(start.split(":")[0]);
                            if (shiftFilter === "morning") return hour >= 5 && hour < 12;
                            if (shiftFilter === "afternoon") return hour >= 12 && hour < 18;
                            if (shiftFilter === "evening") return hour >= 18 && hour < 24;

                            return true;
                        });

                        if (sessions.length === 0) return null;

                        return {
                            ...cls,
                            sessions: sessions.sort((a, b) => (a.start_time || "23:59:59").localeCompare(b.start_time || "23:59:59")),
                        };
                    })
                    .filter(Boolean);

                // 🔹 sort theo giờ
                const sorted = filtered.sort((a, b) => {
                    const timeA = a.sessions?.[0]?.start_time || "23:59:59";
                    const timeB = b.sessions?.[0]?.start_time || "23:59:59";
                    return timeA.localeCompare(timeB);
                });

                setClasses({ data: sorted });
            } catch (err) {
                console.error("❌ Lỗi khi lấy danh sách lớp:", err);
            }
        };

        fetchClasses();
    }, [selectedDate, shiftFilter, user]);

    const handleDateChange = (e) => {
        const value = e.target.value;
        setSelectedDate(value);
        saveSelectedDate(value);
    };

    const handleButtonClick = () => {
        if (dateInputRef.current) {
            try {
                dateInputRef.current.showPicker?.();
            } catch {
                dateInputRef.current.click();
            }
        }
    };

    return (
        <>
            <div className="layout-top">
                <h1 className="headline-1">{user?.type === "admin" ? "Quản lý buổi học" : user?.type === "teacher" ? "Danh sách buổi dạy" : "Thời khóa biểu"}</h1>

                <div className="date-picker-container">
                    <button type="button" className="c-button-1" onClick={handleButtonClick}>
                        <i className="fa-solid fa-calendar-days"></i> Chọn Ngày
                    </button>

                    <input type="date" ref={dateInputRef} value={selectedDate} onChange={handleDateChange} className="hidden-date-input" />
                </div>
            </div>

            <div className="layout-box">
                {selectedDate && (
                    <p className="selected-date-display">
                        📌 Ngày được chọn:{" "}
                        <b>
                            {getVietnameseDayOfWeek(selectedDate)}, {formatDateToDisplay(selectedDate)}
                        </b>
                    </p>
                )}

                {/* legend */}
                <div className="class-legend">
                    <div className="legend-item">
                        <span className="legend-color normal"></span> Lớp học tới ngày
                    </div>
                    <div className="legend-item">
                        <span className="legend-color canceled"></span> Buổi học bị huỷ
                    </div>
                    <div className="legend-item">
                        <span className="legend-color makeup"></span> Buổi học bù
                    </div>
                </div>

                {/* filter ca */}
                <div className="shift-filter">
                    <button className={shiftFilter === "all" ? "active" : ""} onClick={() => setShiftFilter("all")}>
                        🟢 Tất Cả
                    </button>
                    <button className={shiftFilter === "morning" ? "active" : ""} onClick={() => setShiftFilter("morning")}>
                        🌞 Ca Sáng
                    </button>
                    <button className={shiftFilter === "afternoon" ? "active" : ""} onClick={() => setShiftFilter("afternoon")}>
                        ☀️ Ca Chiều
                    </button>
                    <button className={shiftFilter === "evening" ? "active" : ""} onClick={() => setShiftFilter("evening")}>
                        🌙 Ca Tối
                    </button>
                </div>
            </div>

            <div className="layout-box">
                {!classes.data || classes.data.length === 0 ? (
                    <p className="none_class">❌ Không Có Lớp Học Nào Trong Ngày Này (Hoặc Ca Này).</p>
                ) : (
                    classes.data.map((item, index) =>
                        item.sessions.map((sessionItem, i) => {
                            const cardClass = sessionItem.is_canceled ? "card-container canceled" : sessionItem.is_makeup ? "card-container makeup" : "card-container";

                            return (
                                <div className={cardClass} key={`${index}-${i}`}>
                                    <h3 className="card-headline">Lớp: {item.class_name}</h3>
                                    <h3 className="card-headline">Buổi: {sessionItem.topic}</h3>

                                    <ul className="attendance_infor">
                                        <li>
                                            <i className="fa-solid fa-user"></i> Giáo viên: <span>{sessionItem.substitute_teacher_id ? sessionItem.substitute_teacher_name : item.teacher_name}</span>
                                        </li>

                                        <li>
                                            <i className="fa-solid fa-users"></i> Số học viên: <span>{item.total_students}</span>
                                        </li>

                                        <li>
                                            <i className="fa-solid fa-clock"></i> Giờ học:{" "}
                                            <span>
                                                {sessionItem.start_time.slice(0, 5)} - {sessionItem.end_time.slice(0, 5)}
                                            </span>
                                        </li>

                                        <li>
                                            <i className="fa-solid fa-calendar-days"></i> Ngày bắt đầu: <span>{formatDate(item.start_date)}</span>
                                        </li>

                                        <li>
                                            <i className="fa-solid fa-calendar-days"></i> Ngày kết thúc: <span>{formatDate(item.end_date)}</span>
                                        </li>

                                        <li>
                                            <i className="fa-solid fa-calendar"></i> Ngày học:{" "}
                                            <span>
                                                {getVietnameseDayOfWeek(selectedDate)}, {formatDateToDisplay(selectedDate)}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            );
                        }),
                    )
                )}
            </div>
        </>
    );
};

export default ListCalender;
