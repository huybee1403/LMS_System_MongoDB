const timeStrToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
};

const getCurrentMinutesVN = () => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const vnTime = new Date(utc + 7 * 3600000);
    return vnTime.getHours() * 60 + vnTime.getMinutes();
};

module.exports = {
    timeStrToMinutes,
    getCurrentMinutesVN,
};
