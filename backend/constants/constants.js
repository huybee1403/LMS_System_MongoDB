/**
 * CENTRALIZED CONSTANTS
 * Single source of truth for all application constants
 */

// ==================== TIMEZONE ====================
const TIMEZONE = {
    VN: "Asia/Ho_Chi_Minh",
    UTC: "UTC",
};

// ==================== DATE & TIME FORMATS ====================
const DATE_FORMAT = {
    DISPLAY: "DD-MM-YYYY", // for Vietnamese display
    ISO: "YYYY-MM-DD", // for database and API
    ISO_TIME: "YYYY-MM-DD HH:mm", // with timestamp
    TIME_ONLY: "HH:mm", // time only
};

// ==================== NOTIFICATION TYPES ====================
const NOTIFICATION_TYPES = {
    SALARY_RELEASED: "salary_released",
    TODAY_CLASS: "today_class",
    CHECK_IN: "check_in",
    ABSENT_ALERT: "absent_alert",
};

// ==================== USER ROLES ====================
const USER_ROLES = {
    ADMIN: "admin",
    TEACHER: "teacher",
    STUDENT: "student",
};

// ==================== CLASS STATUS ====================
const CLASS_STATUS = {
    ONGOING: "ongoing",
    COMPLETED: "completed",
    CANCELED: "canceled",
};

// ==================== SESSION STATUS ====================
const SESSION_STATUS = {
    SCHEDULED: "scheduled",
    CONFIRMED: "confirmed",
    CANCELED: "canceled",
    MAKEUP: "makeup",
};

// ==================== ATTENDANCE STATUSES ====================
const ATTENDANCE_STATUS = {
    PRESENT: "present",
    ABSENT: "absent",
    LATE: "late",
    EXCUSED: "excused",
};

// ==================== SALARY CONFIGURATION ====================
const SALARY_CONFIG = {
    DEFAULT_RATE_PER_SESSION: 200000, // VND
    DEFAULT_SUBSTITUTE_COEFFICIENT: 1.2,
    DEFAULT_MAKEUP_COEFFICIENT: 1.2,
};

// ==================== TIME CONSTANTS ====================
const TIME_CONFIG = {
    CLASS_DURATION_MINUTES: 180, // 3 hours
    MIN_START_TIME: "07:30",
    MAX_END_TIME: "22:30",
    MAX_END_TIME_MINUTES: 22 * 60 + 30,
    MIN_START_TIME_MINUTES: 7 * 60 + 30,
};

// ==================== TEACHING CODE ====================
const TEACHING_CODE = {
    LENGTH: 6,
    PREFIX: "TC",
};

// ==================== ERROR MESSAGES ====================
const ERROR_MSG = {
    INVALID_TIME: "Time must be between 07:30 - 22:30",
    MISSING_TEACHER: "Class must have teacher",
    MISSING_DAYS: "days_of_week is required and must contain valid weekdays",
    CLASS_NOT_FOUND: "Class not found",
    SESSION_NOT_FOUND: "Session not found",
    INVALID_CODE: "Mã không hợp lệ hoặc đã hết hạn",
    CODE_EXPIRED: "Code sai hoặc đã hết hạn",
};

// ==================== SUCCESS MESSAGES ====================
const SUCCESS_MSG = {
    CLASS_CREATED: "Tạo lớp học thành công",
    CLASS_UPDATED: "Cập nhật lớp học thành công",
    CLASS_DELETED: "Xoá lớp học thành công",
    SESSION_CONFIRMED: "Xác nhận thành công",
};

module.exports = {
    TIMEZONE,
    DATE_FORMAT,
    NOTIFICATION_TYPES,
    USER_ROLES,
    CLASS_STATUS,
    SESSION_STATUS,
    ATTENDANCE_STATUS,
    SALARY_CONFIG,
    TIME_CONFIG,
    TEACHING_CODE,
    ERROR_MSG,
    SUCCESS_MSG,
};
