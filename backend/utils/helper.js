// ================= HELPER =================
const VN_TZ = "Asia/Ho_Chi_Minh";
const moment = require("moment-timezone");

// ================= HELPER =================
exports.toMinutes = (time) => {
    if (!time || typeof time !== "string") {
        throw new Error(`Invalid time format: ${time}`);
    }

    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

exports.isTimeOverlap = (startA, endA, startB, endB) => {
    return startA < endB && endA > startB;
};

exports.formatToVN = (date) => {
    return moment(date).tz(VN_TZ).format("YYYY-MM-DD");
};

exports.getDateRange = (start, end) => {
    let current = moment.tz(start, VN_TZ).startOf("day");
    const endDate = moment.tz(end, VN_TZ).endOf("day");

    const dates = [];

    while (current.isSameOrBefore(endDate)) {
        dates.push(moment(current));
        current.add(1, "day");
    }

    return dates;
};
