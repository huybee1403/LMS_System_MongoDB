const moment = require("moment-timezone");
const { TIMEZONE, DATE_FORMAT } = require("../constants/constants");

const VN_TZ = TIMEZONE.VN;

// ================= DATE PARSING =================
const getTodayVNStr = () => {
    return moment().tz(VN_TZ).format(DATE_FORMAT.ISO);
};

const parseSessionDate = (dateStr) => {
    return moment.tz(dateStr, DATE_FORMAT.ISO, VN_TZ).startOf("day").toDate();
};

const parseVNDateStartOfDay = (dateStr) => {
    if (!dateStr) return null;
    return moment.tz(dateStr, DATE_FORMAT.ISO, VN_TZ).startOf("day").toDate();
};

const parseVNDateEndOfDay = (dateStr) => {
    if (!dateStr) return null;
    return moment.tz(dateStr, DATE_FORMAT.ISO, VN_TZ).endOf("day").toDate();
};

// ================= MONTH RANGE =================
const buildMonthRange = (month, year) => {
    const start = moment.tz(`${year}-${String(month).padStart(2, "0")}-01`, VN_TZ).startOf("month");
    const end = start.clone().endOf("month");
    return { start: start.toDate(), end: end.toDate() };
};

// ================= FORMATTING =================
const formatDateToDisplay = (dateStr) => {
    if (!dateStr) return "";
    const [yyyy, mm, dd] = dateStr.split("-");
    return `${dd}-${mm}-${yyyy}`;
};

const isSameDayYYYY = (a, b) => {
    if (!a || !b) return false;
    return a.toString() === b.toString();
};

const formatDateToISO = (date) => {
    if (!date) return null;
    return moment(date).tz(VN_TZ).format(DATE_FORMAT.ISO);
};

module.exports = {
    VN_TZ,
    getTodayVNStr,
    parseSessionDate,
    parseVNDateStartOfDay,
    parseVNDateEndOfDay,
    buildMonthRange,
    isSameDayYYYY,
    formatDateToDisplay,
    formatDateToISO,
};
