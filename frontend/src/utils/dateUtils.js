// Hàm định dạng ngày (Date object hoặc chuỗi ISO) thành định dạng "dd/MM/yyyy"
import getVietnameseDays from "./getVietnameseDays";

export const formatDate = (dateInput) => {
    const date = new Date(dateInput);
    const day = date.getDate().toString().padStart(2, "0"); // Lấy ngày (dd)
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Lấy tháng (mm) - nhớ cộng 1 vì tháng tính từ 0
    const year = date.getFullYear(); // Lấy năm (yyyy)
    return `${day}/${month}/${year}`; // Trả về chuỗi dạng "dd/MM/yyyy"
};

export const formatDateVN = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);

    return new Intl.DateTimeFormat("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
};

// Hàm tạo danh sách các ngày giữa hai mốc thời gian (định dạng "dd/MM/yyyy")
export const getDateRange = (startDateStr, endDateStr) => {
    // Chuyển chuỗi ngày từ "dd/MM/yyyy" thành "yyyy-MM-dd" để tạo đối tượng Date
    const startDate = new Date(startDateStr.split("/").reverse().join("-"));
    const endDate = new Date(endDateStr.split("/").reverse().join("-"));

    const dates = [];

    // Lặp từ ngày bắt đầu đến ngày kết thúc
    while (startDate <= endDate) {
        // Lấy ngày hiện tại, format thành chuỗi "dd/MM/yyyy"
        const day = startDate.getDate().toString().padStart(2, "0"); // Đảm bảo 2 chữ số (vd: 01, 02, ...)
        const month = (startDate.getMonth() + 1).toString().padStart(2, "0"); // Tháng trong JavaScript bắt đầu từ 0 → cộng thêm 1
        const year = startDate.getFullYear().toString(); // Lấy năm

        // Thêm ngày đã định dạng vào mảng
        dates.push(`${day}/${month}/${year}`);

        // Tăng ngày hiện tại lên 1
        startDate.setDate(startDate.getDate() + 1);
    }

    // Trả về mảng các ngày dưới dạng chuỗi "dd/MM/yyyy"
    return dates;
};

export const getTodayVN = () => {
    const vnDate = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
    });

    const d = new Date(vnDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Hàm lấy ngày mai theo giờ Việt Nam (UTC+7)
export const getTomorrowVN = () => {
    const now = new Date();

    // Chuyển sang VN đúng cách
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const vnTime = new Date(utc + 7 * 60 * 60 * 1000);

    // Tăng 1 ngày
    vnTime.setDate(vnTime.getDate() + 1);

    const year = vnTime.getFullYear();
    const month = String(vnTime.getMonth() + 1).padStart(2, "0");
    const day = String(vnTime.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// Từ chuỗi "dd/MM/yyyy" → Date object
export const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/");
    return new Date(`${year}-${month}-${day}`);
};

// Loại bỏ phần giờ/phút để so sánh thuần ngày
export const stripTime = (d) => {
    const date = new Date(d);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// Trả về các ngày trong tuần theo days_of_week (2–8) từ start–end (định dạng "dd/MM/yyyy")
export const getFilteredDatesByDaysOfWeek = (startDateStr, endDateStr, daysOfWeekStr) => {
    const startDate = new Date(startDateStr.split("/").reverse().join("-"));
    const endDate = new Date(endDateStr.split("/").reverse().join("-"));

    const validWeekdays = daysOfWeekStr.split(",").map((d) => parseInt(d.trim())); // [2, 3, 5, 8]

    const dates = [];

    while (startDate <= endDate) {
        const jsDay = startDate.getDay(); // 0=CN → 8, 1=T2 → 2, ..., 6=T7 → 7

        const customWeekDay = jsDay === 0 ? 8 : jsDay + 1;

        if (validWeekdays.includes(customWeekDay)) {
            const day = startDate.getDate().toString().padStart(2, "0");
            const month = (startDate.getMonth() + 1).toString().padStart(2, "0");
            const year = startDate.getFullYear().toString();
            dates.push(`${day}/${month}/${year}`);
        }

        startDate.setDate(startDate.getDate() + 1);
    }

    return dates;
};

// Chuyển chuỗi ISO date thành định dạng yyyy-MM-dd theo giờ VN
export const convertToVietnamDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);

    // Lấy thời gian theo múi giờ VN
    const offset = 7 * 60; // +7 giờ
    const local = new Date(date.getTime() + offset * 60 * 1000);

    const yyyy = local.getUTCFullYear();
    const mm = String(local.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(local.getUTCDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`; // định dạng yyyy-mm-dd
};

// Lấy ngày theo múi giờ VN từ chuỗi session_date
export const getSessionDateVN = (session_date) => {
    if (!session_date) return null;

    // tạo Date từ UTC
    const d = new Date(session_date);

    // lấy ngày theo VN
    const dayVN = d.toLocaleDateString("en-CA", {
        timeZone: "Asia/Ho_Chi_Minh",
    });

    return dayVN; // "YYYY-MM-DD"
};
// Chuyển chuỗi UTC sang ngày theo múi giờ VN, định dạng "yyyy-MM-dd"
export const convertUTCToVNDate = (utcString) => {
    if (!utcString) return null;

    const utcDate = new Date(utcString);

    // Convert UTC → VN
    const vnString = utcDate.toLocaleString("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
    });

    const vnDate = new Date(vnString);

    const year = vnDate.getFullYear();
    const month = String(vnDate.getMonth() + 1).padStart(2, "0");
    const day = String(vnDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// 🔹 Định dạng yyyy-mm-dd → dd-mm-yyyy
export const formatDateToDisplay = (dateStr) => {
    if (!dateStr) return "";
    const [yyyy, mm, dd] = dateStr.split("-");
    return `${dd}-${mm}-${yyyy}`;
};

// 🔹 Lấy ngày hôm nay ở định dạng yyyy-mm-dd (chuẩn cho input[type="date"])
export const getTodayInputFormat = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

// 🔹 Lấy tên thứ bằng tiếng Việt (dựa trên utils gốc)
export const getVietnameseDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    const jsDay = date.getDay(); // 0 = Chủ Nhật
    const customDay = jsDay === 0 ? 8 : jsDay + 1;
    return getVietnameseDays(String(customDay));
};

// 🔹 LocalStorage helpers
const STORAGE_KEY = "selectedDate";

export const loadSavedDate = () => {
    return localStorage.getItem(STORAGE_KEY) || null;
};

export const saveSelectedDate = (dateStr) => {
    localStorage.setItem(STORAGE_KEY, dateStr);
};
