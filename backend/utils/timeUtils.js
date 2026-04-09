const { TIME_CONFIG } = require("../constants/constants");

const CLASS_DURATION_MINUTES = TIME_CONFIG.CLASS_DURATION_MINUTES;
const MAX_END_TIME_MINUTES = TIME_CONFIG.MAX_END_TIME_MINUTES;
const MIN_START_TIME_MINUTES = TIME_CONFIG.MIN_START_TIME_MINUTES;

const toMinutes = (time) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
};

const minutesToHHMM = (minutes) => {
    const hh = Math.floor(minutes / 60);
    const mm = minutes % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const addMinutesToTime = (time, minutesToAdd) => {
    const total = toMinutes(time) + minutesToAdd;
    return minutesToHHMM(total);
};

const isOverlapping = (startA, endA, startB, endB) => {
    const aStart = toMinutes(startA);
    const aEnd = toMinutes(endA);
    const bStart = toMinutes(startB);
    const bEnd = toMinutes(endB);
    return aStart < bEnd && bStart < aEnd;
};

const getFreeTimeSlots = (sessions) => {
    if (!Array.isArray(sessions) || sessions.length === 0) {
        return [{ start: TIME_CONFIG.MIN_START_TIME, end: TIME_CONFIG.MAX_END_TIME }];
    }

    const sorted = sessions
        .map((item) => ({
            start: toMinutes(item.start_time),
            end: toMinutes(item.end_time),
        }))
        .sort((a, b) => a.start - b.start);

    const freeSlots = [];
    let current = MIN_START_TIME_MINUTES;

    for (const session of sorted) {
        if (session.start - current >= CLASS_DURATION_MINUTES) {
            freeSlots.push({
                start: minutesToHHMM(current),
                end: minutesToHHMM(session.start),
            });
        }
        current = Math.max(current, session.end);
    }

    if (MAX_END_TIME_MINUTES - current >= CLASS_DURATION_MINUTES) {
        freeSlots.push({
            start: minutesToHHMM(current),
            end: minutesToHHMM(MAX_END_TIME_MINUTES),
        });
    }

    return freeSlots;
};

module.exports = {
    CLASS_DURATION_MINUTES,
    MAX_END_TIME_MINUTES,
    MIN_START_TIME_MINUTES,
    toMinutes,
    minutesToHHMM,
    addMinutesToTime,
    isOverlapping,
    getFreeTimeSlots,
};
