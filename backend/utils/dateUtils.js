const VN_TZ = "Asia/Ho_Chi_Minh";

const parseVNDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-").map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    return new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
};

const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

const getTodayStr = () => {
    const now = new Date();
    const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
    const vnNow = new Date(utcNow + 7 * 3600000);
    return formatDate(vnNow);
};

const formatDateToDisplay = (dateStr) => {
    if (!dateStr) return "";
    const [yyyy, mm, dd] = dateStr.split("-");
    return `${dd}-${mm}-${yyyy}`;
};

const getVNDate = (date) => {
    return new Date(new Date(date).toLocaleString("en-US", { timeZone: VN_TZ }));
};

module.exports = {
    parseVNDate,
    addDays,
    formatDate,
    getTodayStr,
    formatDateToDisplay,
    getVNDate,
};
