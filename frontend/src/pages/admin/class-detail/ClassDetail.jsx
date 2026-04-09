import { useEffect, useMemo, useRef, useState } from "react";
import "./ClassDetail.css";
import { getAllUserByRole, getAvailableTeachers, getDetailClass, getTeacherFreeSlots } from "../../../services/apis/api";
import { useParams } from "react-router-dom";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import { useCourses } from "../../../contexts/courses/CourseContext";
import { convertUTCToVNDate, formatDate, getSessionDateVN, getTodayVN, parseDate, stripTime } from "../../../utils/dateUtils";
import { parseISO, format, isValid } from "date-fns";
import { timeToMinutes } from "../../../utils/timeUtils";
import AutoCalculateEndTime from "../../../utils/AutoCalculateEndTime";
import { toast } from "react-toastify";

const ClassDetail = () => {
    // State và biến khác
    const { id } = useParams();
    const [classDetail, setClassDetail] = useState(null);
    const [teachers, setTeachers] = useState([]);

    const {
        handleUploadStudents,
        createTodaySessionForClass,
        handleUpdateAttendance,
        createMakeupSessionForClass,
        createTodaySessionWithSubTeacher,
        handleSendTeachingCode,
        handleConfirmTeachingCode,
        loading,
    } = useCourses();
    const [selectedCell, setSelectedCell] = useState(null); // { studentId, date }
    const [teacherSlots, setTeacherSlots] = useState([]); // slot trống của giáo viên
    const [availableTeachers, setAvailableTeachers] = useState([]); // giáo viên rảnh trong khung giờ
    const [selectedOffSession, setSelectedOffSession] = useState(null);

    // Refs
    const dropdownRef = useRef(null);
    const today = useMemo(() => stripTime(new Date()), []);
    const fileInputRef = useRef(null);
    const fetchCalledRef = useRef(false);

    // Modal
    const [activeModal, setActiveModal] = useState(""); // "upload-students"
    const modalRefs = useRef({});

    // Click ngoài để đóng modal
    useEffect(() => {
        const handler = (e) => {
            if (activeModal && modalRefs.current[activeModal] && !modalRefs.current[activeModal].contains(e.target)) {
                setActiveModal(null);
                setTeacherSlots([]);
                setSelectedOffSession(null);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [activeModal]);

    const getEntityId = (entity) => entity?.id || entity?._id || null;

    const getStudentUserId = (student) => {
        if (!student) return null;
        return student.student_id?._id || student.student_id?.id || student.student_id || student._id || student.id || null;
    };

    const getSessionId = (session) => getEntityId(session);
    const getClassId = (detail) => getEntityId(detail);

    const getSessionByDate = (date) => {
        if (!classDetail?.sessions || !date) return null;
        return classDetail.sessions.find((session) => getSessionDateVN(session.session_date) === date) || null;
    };

    const closeModal = () => {
        setActiveModal(null);
        setTeacherSlots([]);
        setSelectedOffSession(null);
    };

    //Active ô điểm danh
    const handleCellClick = (studentId, date) => {
        setSelectedCell((prev) => (prev && prev.studentId === studentId && prev.date === date ? null : { studentId, date }));
    };

    // Xử lý click bên ngoài dropdown điểm danh
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectedCell && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setSelectedCell(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedCell]);

    //Get free slots khi chọn giáo viên (khi teacher_id thay đổi trong Formik)
    const handleTeacherChange = async (teacherId, date) => {
        if (!teacherId || !date) return setTeacherSlots({ freeSlots: [] }); // object empty

        try {
            const slots = await getTeacherFreeSlots(teacherId, date);
            setTeacherSlots(slots); // slots: { freeSlots: [ {start, end}, ... ] }
        } catch (err) {
            console.error("Lỗi lấy slot giáo viên:", err);
            setTeacherSlots({ freeSlots: [] });
        }
    };

    // Lấy danh sách giáo viên rảnh khi chọn ngày + giờ
    const fetchAvailableTeachers = async (date, start_time, end_time) => {
        // reset state trước khi load
        setAvailableTeachers([]);

        // nếu thiếu thông tin thì return luôn
        if (!date || !start_time || !end_time) return;

        try {
            const teachers = await getAvailableTeachers(date, start_time, end_time);
            setAvailableTeachers(teachers); // [{ id, first_name, last_name }]
        } catch (err) {
            console.error("Lỗi lấy giáo viên rảnh:", err);
            setAvailableTeachers([]);
        }
    };

    const getSessionTimesToday = (sessions = []) => {
        if (!Array.isArray(sessions) || sessions.length === 0) {
            return { start: null, end: null };
        }

        const todayVN = getTodayVN();

        const todaySession = sessions.find((s) => {
            const sessionDateVN = getSessionDateVN(s.session_date);
            return sessionDateVN === todayVN;
        });

        if (!todaySession) return { start: null, end: null };

        return {
            start: todaySession.start_time,
            end: todaySession.end_time,
        };
    };

    // Gọi sau khi classDetail fetch xong
    useEffect(() => {
        if (!classDetail || !classDetail.sessions) return;

        const { start, end } = getSessionTimesToday(classDetail.sessions);

        if (start && end) {
            fetchAvailableTeachers(getTodayVN(), start, end);
        }
    }, [classDetail]);

    // Fetch thông tin lớp và bảng điểm danh
    const fetchDetailClass = async (id) => {
        try {
            const response = await getDetailClass(id);
            setClassDetail(response);
        } catch (error) {
            console.error("Error fetching class:", error);
        }
    };

    const fetchAllTeacher = async () => {
        try {
            setTeachers(await getAllUserByRole("teacher"));
        } catch (e) {
            console.error("Lỗi lấy danh sách giáo viên:", e);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (fetchCalledRef.current) return;
            fetchCalledRef.current = true;

            try {
                await createTodaySessionForClass(id);
                await fetchDetailClass(id);
                await fetchAllTeacher();
                // await fetchAvailableTeachers(getTodayVN(), null, null);
            } catch (error) {
                console.error("Lỗi khi tạo session và lấy thông tin lớp:", error);
            }
        };

        fetchData();
    }, [id]);

    // Tạo danh sách ngày từ session để hiển thị cột điểm danh
    const dates = useMemo(() => {
        if (!classDetail?.sessions) return [];

        // Lấy tất cả ngày từ sessions (bình thường + học bù + cả ngày bị hủy)
        const allDates = classDetail.sessions
            .filter((s) => s.session_date) // chỉ cần có session_date
            .map((s) => {
                const dateObj = parseISO(s.session_date);
                return isValid(dateObj) ? format(dateObj, "dd/MM/yyyy") : s.session_date;
            });

        // Loại trùng
        const uniqueDates = Array.from(new Set(allDates));

        // Sắp xếp theo ngày
        uniqueDates.sort((a, b) => {
            const da = parseISO(a.split("/").reverse().join("-"));
            const db = parseISO(b.split("/").reverse().join("-"));
            return da - db;
        });

        return uniqueDates;
    }, [classDetail]);

    // Formik validation schema upload học sinh
    const validationSchema = Yup.object({
        file: Yup.mixed()
            .required("Bạn cần chọn file Excel")
            .test("fileType", "File không hợp lệ", (value) => value && ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel"].includes(value.type)),
    });

    return (
        <>
            <div className="layout-top">
                <h1 className="headline-1">
                    <span>Lớp:</span> {classDetail && classDetail.name}
                </h1>
                <div className="button" style={{ display: "flex", gap: "12px" }}>
                    <button className="c-button-1" onClick={() => setActiveModal("upload-students")}>
                        <i className="fa-regular fa-square-plus"></i> Thêm Học Sinh
                    </button>
                    <button className="c-button-1" onClick={() => setActiveModal("send-code")}>
                        <i className="fa-solid fa-check"></i>Chấm Công
                    </button>
                </div>
            </div>

            <div className="layout-box">
                <ul className="attendance_infor">
                    <li>
                        <i className="fa-solid fa-user"></i>Giáo viên:
                        {classDetail && <span>{`${classDetail.teacher_first_name} ${classDetail.teacher_last_name}`}</span>}
                    </li>
                    <li>
                        <i className="fa-solid fa-users"></i> Số Học Viên : <span>{classDetail && classDetail.students.length}</span>
                    </li>
                    <li>
                        <i className="fa-solid fa-clock"></i> Giờ học:{" "}
                        <span>
                            {classDetail && classDetail.start_time.slice(0, 5)} - {classDetail && classDetail.end_time.slice(0, 5)}
                        </span>
                    </li>
                    <li>
                        <i className="fa-solid fa-calendar-days"></i> Ngày bắt đầu:
                        {classDetail && <span>{formatDate(classDetail.start_date)}</span>}
                    </li>
                    <li>
                        <i className="fa-solid fa-calendar-days"></i> Ngày kết thúc:
                        {classDetail && <span>{formatDate(classDetail.end_date)}</span>}
                    </li>
                    <li>
                        <i className="fa-solid fa-calendar"></i> Số Buổi / Tuần:
                        <span>{classDetail && classDetail.number_of_sessions_per_week} Buổi </span>
                    </li>
                </ul>
                {/* Thanh mô tả màu */}
                <div className="class-legend" style={{ marginTop: "12px" }}>
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
            </div>

            {/* Bảng danh sách điểm danh */}
            <div className="layout-box">
                <div className="attendance_scroll">
                    <div className="attendance_table">
                        {/* Bảng số vắng */}
                        <table className="fixed-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th className="table_name">Tên học sinh</th>
                                    <th>Vắng mặt</th>
                                </tr>
                            </thead>
                            <tbody id="student-info">
                                {classDetail &&
                                    [...classDetail.students]
                                        .sort((a, b) => {
                                            if (!a || !b) return 0;
                                            const aLast = a.student_id?.last_name || "";
                                            const bLast = b.student_id?.last_name || "";
                                            return aLast.localeCompare(bLast);
                                        })
                                        .map((student, index) => {
                                            const studentUserId = getStudentUserId(student);
                                            const absentCount =
                                                classDetail?.sessions?.reduce((count, session) => {
                                                    const att = session.attendance?.find((a) => a.student_id === studentUserId);
                                                    if (att && (att.status === "absent" || att.status === "excused")) {
                                                        return count + 1;
                                                    }
                                                    return count;
                                                }, 0) || 0;

                                            return (
                                                <tr key={student.student_id._id || index}>
                                                    <td>{index + 1}</td>
                                                    <td className="table_name">
                                                        <a>{student.student_id.first_name + " " + student.student_id.last_name}</a>
                                                    </td>
                                                    <td className="absent-count">{absentCount}</td>
                                                </tr>
                                            );
                                        })}
                                <tr>
                                    <td colSpan="2">
                                        <strong style={{ fontWeight: 500 }}>Tổng số vắng của lớp</strong>
                                    </td>
                                    <td className="absent-count">
                                        {classDetail?.sessions?.reduce((total, session) => {
                                            return total + (session.attendance?.filter((a) => a.status === "absent" || a.status === "excused").length || 0);
                                        }, 0) || 0}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Bảng điểm danh theo buổi */}
                        <div className="scrollable-table">
                            <table>
                                <thead>
                                    <tr>
                                        {dates.map((date, index) => {
                                            const parsed = stripTime(parseDate(date));
                                            const isDone = parsed < today;
                                            const isToday = parsed.getTime() === today.getTime();

                                            // Lấy session tương ứng
                                            const session = getSessionByDate(format(parsed, "yyyy-MM-dd"));

                                            // Kiểm tra trạng thái
                                            const isCanceled = session?.is_canceled;
                                            const isMakeup = session?.is_makeup;

                                            // Màu đỏ nếu bị cancel màu vàng nếu học bù
                                            const thClass = `${isDone ? "done" : ""} ${isToday ? "active-day" : ""} ${isCanceled ? "canceled-day" : ""} ${isMakeup ? "makeup-day" : ""}`;

                                            return (
                                                <th key={index} className={`role ${thClass}`}>
                                                    {!isDone && (
                                                        <button
                                                            type="button"
                                                            className={`off-button ${isToday ? "active" : ""} ${isCanceled ? "canceled-off-button" : ""}`}
                                                            onClick={() => {
                                                                setSelectedOffSession(session);
                                                                setActiveModal("off-modal");
                                                            }}
                                                        >
                                                            OFF
                                                        </button>
                                                    )}

                                                    <span style={{ display: "block" }}>{`Buổi ${index + 1}`}</span>

                                                    <span style={{ fontSize: "12px" }}>{date}</span>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody id="attendance-data">
                                    {classDetail &&
                                        classDetail.students.map((student) => (
                                            <tr key={student.student_id._id}>
                                                {dates.map((date, index) => {
                                                    const studentUserId = getStudentUserId(student);
                                                    const isActive = selectedCell?.studentId === studentUserId && selectedCell?.date === date;
                                                    const session = getSessionByDate(format(parseDate(date), "yyyy-MM-dd"));
                                                    const attendance = session?.attendance?.find((a) => a.student_id === studentUserId);
                                                    const status = attendance?.status || "-";
                                                    const statusClass = {
                                                        present: "present-color",
                                                        absent: "absent-color",
                                                        excused: "excused-color",
                                                        "-": "none",
                                                    }[status];
                                                    const isDisabled = !session || session.is_canceled || stripTime(new Date(session.session_date)) > stripTime(new Date());

                                                    return (
                                                        <td
                                                            key={index}
                                                            className={`att-cell ${isActive ? "active" : ""} ${statusClass}`}
                                                            onClick={() => {
                                                                if (isDisabled) return;
                                                                handleCellClick(studentUserId, date);
                                                            }}
                                                            style={{
                                                                position: "relative",
                                                                cursor: isDisabled ? "not-allowed" : "pointer",
                                                                backgroundColor: session?.is_canceled
                                                                    ? "red"
                                                                    : session?.is_makeup
                                                                    ? "rgb(233, 233, 106)" // màu vàng nhạt cho buổi học bù
                                                                    : "",
                                                                color: session?.is_canceled ? "white" : "",
                                                            }}
                                                        >
                                                            <span>
                                                                {{
                                                                    present: "ĐH",
                                                                    excused: "CP",
                                                                    absent: "KP",
                                                                    "-": "-",
                                                                }[status] || "-"}
                                                            </span>

                                                            <div ref={isActive ? dropdownRef : null} className={`dropdown ${isActive ? "is-active" : ""}`} onClick={(e) => e.stopPropagation()}>
                                                                <div
                                                                    data-date={date}
                                                                    data-value="present"
                                                                    onClick={() => {
                                                                        const sessionId = getSessionId(session);
                                                                        if (!sessionId || !studentUserId) return;
                                                                        handleUpdateAttendance(sessionId, studentUserId, "present", () => {
                                                                            fetchDetailClass(id);
                                                                            setSelectedCell(null);
                                                                        });
                                                                    }}
                                                                >
                                                                    ĐH - Đi học
                                                                </div>

                                                                <div
                                                                    data-date={date}
                                                                    data-value="excused"
                                                                    onClick={() => {
                                                                        const sessionId = getSessionId(session);
                                                                        if (!sessionId || !studentUserId) return;
                                                                        handleUpdateAttendance(sessionId, studentUserId, "excused", () => {
                                                                            fetchDetailClass(id);
                                                                            setSelectedCell(null);
                                                                        });
                                                                    }}
                                                                >
                                                                    CP - Có phép
                                                                </div>

                                                                <div
                                                                    data-date={date}
                                                                    data-value="absent"
                                                                    onClick={() => {
                                                                        const sessionId = getSessionId(session);
                                                                        if (!sessionId || !studentUserId) return;
                                                                        handleUpdateAttendance(sessionId, studentUserId, "absent", () => {
                                                                            fetchDetailClass(id);
                                                                            setSelectedCell(null);
                                                                        });
                                                                    }}
                                                                >
                                                                    KP - Không phép
                                                                </div>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                </tbody>

                                <tfoot>
                                    <tr id="total-absence-row">
                                        {dates.map((date, index) => {
                                            const parsed = stripTime(parseDate(date));
                                            const isDone = parsed < today;
                                            const isToday = parsed.getTime() === today.getTime();
                                            const session = getSessionByDate(format(parsed, "yyyy-MM-dd"));
                                            const absentCount = session?.attendance?.filter((a) => a.status === "absent" || a.status === "excused").length || 0;
                                            const isCanceled = session?.is_canceled;
                                            const isMakeup = session?.is_makeup;
                                            const thClass = `${isDone ? "done" : ""} ${isToday ? "active-day" : ""} ${isCanceled ? "canceled-day" : ""} ${isMakeup ? "makeup-day" : ""}`;

                                            return (
                                                <td key={index} className={thClass}>
                                                    <span style={{ display: "inline-block" }}>{absentCount}</span>/{classDetail.students.length}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal upload học sinh */}
            <div className={`modal ${activeModal === "upload-students" ? "active" : ""}`} ref={(r) => r && (modalRefs.current["upload-students"] = r)}>
                {activeModal === "upload-students" && (
                    <div className="modal_box">
                        <div className="modal-close" onClick={closeModal}>
                            <i className="fa-solid fa-xmark"></i>
                        </div>
                        <div className="modal_group">
                            <h2 className="headline">Tạo Danh Sách Học Sinh</h2>

                            <Formik
                                initialValues={{ file: null }}
                                validationSchema={validationSchema}
                                onSubmit={async (values, { resetForm, setSubmitting }) => {
                                    await handleUploadStudents(values.file, id, resetForm, () => fetchDetailClass(id));
                                    resetForm();
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                    }
                                    setSubmitting(false);
                                    closeModal();
                                }}
                            >
                                {({ setFieldValue, isSubmitting }) => (
                                    <Form encType="multipart/form-data">
                                        <div>
                                            <label htmlFor="file">Chọn File Excel</label>
                                            <input id="file" name="file" type="file" accept=".xlsx,.xls" ref={fileInputRef} onChange={(event) => setFieldValue("file", event.currentTarget.files[0])} />
                                            <ErrorMessage name="file" component="div" className="err" />
                                        </div>

                                        <div style={{ marginTop: "10px" }}>
                                            <button type="submit" className="c-button-1" disabled={isSubmitting}>
                                                {isSubmitting ? "Đang upload..." : "Upload"}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal gửi & nhập mã */}
            <div className={`modal ${activeModal === "send-code" ? "active" : ""}`} ref={(r) => r && (modalRefs.current["send-code"] = r)}>
                {activeModal === "send-code" && (
                    <div className="modal_box">
                        <div className="modal-close" onClick={closeModal}>
                            <i className="fa-solid fa-xmark"></i>
                        </div>
                        <div className="modal_group">
                            <h2 className="headline">Xác Nhận Buổi Dạy</h2>

                            <Formik
                                initialValues={{ email: "", code: "" }}
                                validationSchema={Yup.object({
                                    code: Yup.string().min(6, "Mã tối thiểu 6 ký tự"),
                                })}
                                onSubmit={async (values, { setSubmitting }) => {
                                    setSubmitting(true);
                                    // TÌM BUỔI HỌC HÔM NAY
                                    const todayVN = getTodayVN();
                                    const todaySession = classDetail.sessions.find((s) => convertUTCToVNDate(s.session_date) === todayVN);
                                    const todaySessionId = getSessionId(todaySession);

                                    // ❗ Gộp chung: nếu không có session hoặc không có id → báo lỗi
                                    if (!todaySessionId) {
                                        toast.error("Hôm nay không có buổi học.");
                                        setSubmitting(false);
                                        return;
                                    }

                                    await handleConfirmTeachingCode(todaySessionId, values.code, () => {
                                        closeModal();
                                    });

                                    setSubmitting(false);
                                }}
                            >
                                {({ isSubmitting, setFieldValue, values }) => (
                                    <Form>
                                        {/* Nhập mã xác thực */}
                                        <label>Mã Xác Nhận</label>
                                        <input type="text" name="code" placeholder="Nhập mã xác nhận đã gửi email" onChange={(e) => setFieldValue("code", e.target.value)} value={values.code} />
                                        <ErrorMessage name="code" component="div" className="err" />

                                        <button type="submit" className="c-button-1" disabled={isSubmitting}>
                                            {isSubmitting ? "Đang xác nhận..." : "Xác nhận"}
                                        </button>
                                        <button
                                            type="button"
                                            className="c-button-1"
                                            disabled={loading}
                                            style={{ marginLeft: "12px" }}
                                            onClick={async () => {
                                                // TÌM BUỔI HỌC HÔM NAY
                                                const todayVN = getTodayVN();
                                                const todaySession = classDetail.sessions.find((s) => convertUTCToVNDate(s.session_date) === todayVN);
                                                const todaySessionId = getSessionId(todaySession);

                                                // ❗ Gộp chung: nếu không có session hoặc không có id → báo lỗi
                                                if (!todaySessionId) {
                                                    toast.error("Hôm nay không có buổi học.");
                                                    return;
                                                }

                                                // Gọi hàm gửi mã
                                                await handleSendTeachingCode(todaySessionId);
                                            }}
                                        >
                                            {loading ? "Đang gửi..." : "Gửi mã"}
                                        </button>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal xử lý OFF */}
            <div className={`modal ${activeModal === "off-modal" ? "active" : ""}`} ref={(r) => r && (modalRefs.current["off-modal"] = r)}>
                {activeModal === "off-modal" && (
                    <div className="modal_box">
                        <div className="modal-close" onClick={closeModal}>
                            <i className="fa-solid fa-xmark"></i>
                        </div>

                        <div className="modal_group">
                            <h2 className="headline" style={{ marginBottom: "16px" }}>
                                Xử lý buổi OFF
                            </h2>

                            <p style={{ marginBottom: "16px", color: "#e74c3c" }}>Ngày: {selectedOffSession ? getSessionDateVN(selectedOffSession.session_date) : getTodayVN()}</p>

                            <div className="off-modal-actions">
                                <button
                                    type="button"
                                    className="button-1"
                                    onClick={() => {
                                        setActiveModal("make-up-class"); // mở modal tạo buổi học bù
                                    }}
                                >
                                    🗓️ Tạo buổi học bù
                                </button>

                                <button
                                    type="button"
                                    className="button-2"
                                    onClick={() => {
                                        setActiveModal("substitute-teacher"); // mở modal nhờ giáo viên dạy thay
                                    }}
                                >
                                    👨‍🏫 Nhờ giáo viên dạy thay
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Modal Tạo buổi học bù */}
            <div className={`modal ${activeModal === "make-up-class" ? "active" : ""}`} ref={(r) => r && (modalRefs.current["make-up-class"] = r)}>
                {activeModal === "make-up-class" && (
                    <div className="modal_box">
                        <div className="modal-close" onClick={closeModal}>
                            <i className="fa-solid fa-xmark" />
                        </div>

                        <Formik
                            enableReinitialize
                            initialValues={{
                                classId: id,
                                offDate: selectedOffSession ? getSessionDateVN(selectedOffSession.session_date) : getTodayVN(), // ngày OFF hiện tại
                                makeupDate: "",
                                teacher_id: "",
                                start_time: "",
                                end_time: "",
                            }}
                            validationSchema={Yup.object({
                                teacher_id: Yup.string().required("Bạn phải chọn giáo viên"),
                                makeupDate: Yup.string()
                                    .required("Bạn phải chọn ngày học bù")
                                    .test("makeup-after-off", "Ngày học bù phải sau ngày nghỉ", function (value) {
                                        const { offDate } = this.parent;
                                        if (!offDate || !value) return true;
                                        return new Date(value) > new Date(offDate);
                                    }),
                                start_time: Yup.string()
                                    .required("Bạn phải chọn giờ bắt đầu")
                                    .test("start-time-valid", "Giờ bắt đầu không hợp lệ hoặc không nằm trong slot rảnh của giáo viên (07:30 - 19:30)", function (value) {
                                        if (!value) return false;

                                        const slots = teacherSlots?.freeSlots || [];
                                        const startMinutes = timeToMinutes(value);

                                        // 1️⃣ Giờ bắt đầu hợp lệ (07:30 → 19:30)
                                        const minStart = 7 * 60 + 30;
                                        const maxStart = 19 * 60 + 30;
                                        if (startMinutes < minStart || startMinutes > maxStart) return false;

                                        // 2️⃣ Nằm trong slot rảnh
                                        if (!slots.length) return true; // không có slot thì không check
                                        return slots.some((slot) => startMinutes >= timeToMinutes(slot.start) && startMinutes < timeToMinutes(slot.end));
                                    }),
                                end_time: Yup.string()
                                    .required("Bạn phải chọn giờ kết thúc")

                                    // 📌 1️⃣ Start và End phải nằm hoàn toàn trong 1 slot rảnh
                                    .test("fit-in-slot", "Thời gian buổi học không nằm trong slot rảnh của giáo viên", function (value) {
                                        const start_time = this.resolve(Yup.ref("start_time"));
                                        if (!value || !start_time) return true;

                                        const slots = teacherSlots?.freeSlots || [];
                                        if (!slots.length) return true;

                                        const start = timeToMinutes(start_time);
                                        const end = timeToMinutes(value);

                                        return slots.some((slot) => start >= timeToMinutes(slot.start) && end <= timeToMinutes(slot.end));
                                    })

                                    // 📌 2️⃣ Phải đúng 3 tiếng
                                    .test("three-hours", "Thời lượng buổi học phải đúng 3 tiếng", function (value) {
                                        const start_time = this.resolve(Yup.ref("start_time"));
                                        if (!value || !start_time) return true;

                                        return timeToMinutes(value) - timeToMinutes(start_time) === 180;
                                    }),
                            })}
                            context={{ teacherSlots: teacherSlots }}
                            onSubmit={(values, { setSubmitting }) => {
                                createMakeupSessionForClass(values.classId, values.offDate, values.makeupDate, values.start_time, values.end_time, values.teacher_id).then(() => {
                                    fetchDetailClass(id);
                                });
                                setSubmitting(false);
                                closeModal();
                            }}
                        >
                            {({ isSubmitting, setFieldValue, values }) => (
                                <Form className="modal_group">
                                    <h2 className="headline">Tạo buổi học bù</h2>

                                    {/* Ngày OFF */}
                                    <div>
                                        <label>Ngày nghỉ (OFF):</label>
                                        <Field type="date" name="offDate" readOnly />
                                    </div>

                                    {/* Ngày học bù */}
                                    <div>
                                        <label>Ngày học bù:</label>
                                        <Field
                                            type="date"
                                            name="makeupDate"
                                            onChange={async (e) => {
                                                const date = e.target.value;
                                                setFieldValue("makeupDate", date);
                                                if (values.teacher_id) await handleTeacherChange(values.teacher_id, date);
                                            }}
                                        />
                                        <ErrorMessage name="makeupDate" component="div" className="err" />
                                    </div>

                                    {/* Chọn giáo viên */}
                                    <div>
                                        <label>Chọn giáo viên:</label>
                                        <Field
                                            as="select"
                                            name="teacher_id"
                                            onChange={async (e) => {
                                                const teacherId = e.target.value;
                                                setFieldValue("teacher_id", teacherId);
                                                setFieldValue("start_time", "");
                                                setFieldValue("end_time", "");
                                                await handleTeacherChange(teacherId, values.makeupDate);
                                            }}
                                        >
                                            <option value="">--Chọn giáo viên--</option>
                                            {teachers.map((t) => (
                                                <option key={t._id} value={t._id}>
                                                    {t.first_name} {t.last_name}
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="teacher_id" component="div" className="err" />
                                    </div>

                                    {/* Slot trống */}
                                    <div className="box-infor">
                                        <h3 className="box-infor_title" style={{ fontSize: "14px", marginBottom: "16px" }}>
                                            Danh sách slot trống
                                        </h3>
                                        {teacherSlots?.freeSlots?.length > 0 ? (
                                            <div role="group" style={{ marginBottom: "0px" }}>
                                                {teacherSlots.freeSlots.map((slot, index) => (
                                                    <label key={index} className="item-extra-date">
                                                        <span style={{ fontSize: "14px", marginBottom: "0px", color: "#e74c3c" }}>{`${slot.start} → ${slot.end}`}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ fontSize: "14px", color: "#e74c3c" }}>Không có slot trống cho giáo viên này.</p>
                                        )}
                                    </div>

                                    {/* Chọn giờ */}
                                    <div>
                                        <label>Giờ bắt đầu:</label>
                                        <Field type="time" name="start_time" />
                                        <ErrorMessage name="start_time" component="div" className="err" />
                                    </div>

                                    <div>
                                        <label>Giờ kết thúc:</label>
                                        <Field type="time" name="end_time" readOnly />
                                        <ErrorMessage name="end_time" component="div" className="err" />
                                    </div>

                                    <button type="submit" className="c-button-1" disabled={isSubmitting} style={{ marginTop: "10px" }}>
                                        {isSubmitting ? "Đang tạo..." : "Tạo"}
                                    </button>

                                    <AutoCalculateEndTime />
                                </Form>
                            )}
                        </Formik>
                    </div>
                )}
            </div>

            {/* Modal Nhờ giáo viên dạy thay */}
            <div className={`modal ${activeModal === "substitute-teacher" ? "active" : ""}`} ref={(r) => r && (modalRefs.current["substitute-teacher"] = r)}>
                {activeModal === "substitute-teacher" && (
                    <div className="modal_box">
                        <div className="modal-close" onClick={closeModal}>
                            <i className="fa-solid fa-xmark" />
                        </div>

                        <Formik
                            enableReinitialize
                            initialValues={{
                                teacher_id: "",
                            }}
                            validationSchema={Yup.object({
                                teacher_id: Yup.string().required("Bạn phải chọn giáo viên"),
                            })}
                            onSubmit={(values, { setSubmitting }) => {
                                const classId = getClassId(classDetail);
                                if (!classId) {
                                    setSubmitting(false);
                                    return;
                                }

                                createTodaySessionWithSubTeacher(classId, values.teacher_id).then(() => {
                                    fetchDetailClass(classId); // load lại dữ liệu lớp
                                });

                                setSubmitting(false);
                                closeModal();
                            }}
                        >
                            {({ isSubmitting }) => (
                                <Form className="modal_group">
                                    <h2 className="headline">Nhờ giáo viên dạy thay</h2>

                                    <div>
                                        <label>Chọn giáo viên:</label>
                                        <Field as="select" name="teacher_id">
                                            <option value="">--Chọn giáo viên--</option>
                                            {availableTeachers?.availableTeachers?.map((t) => (
                                                <option key={getEntityId(t)} value={getEntityId(t)}>
                                                    {t.first_name} {t.last_name}
                                                </option>
                                            ))}
                                        </Field>
                                        <ErrorMessage name="teacher_id" component="div" className="err" />
                                    </div>

                                    <button type="submit" className="c-button-1" disabled={isSubmitting} style={{ marginTop: "10px" }}>
                                        {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                                    </button>
                                </Form>
                            )}
                        </Formik>
                    </div>
                )}
            </div>
        </>
    );
};

export default ClassDetail;
