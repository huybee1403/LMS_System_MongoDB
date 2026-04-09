const moment = require("moment-timezone");
const Session = require("../models/session.model");
const { toMinutes, addMinutesToTime, isOverlapping, getFreeTimeSlots, CLASS_DURATION_MINUTES: CLASS_DURATION, MAX_END_TIME_MINUTES } = require("./timeUtils");
const { parseVNDateStartOfDay, VN_TZ } = require("./dateUtilsForSession");
const { DATE_FORMAT } = require("../constants/constants");

const normalizeDaysOfWeek = (days) => {
    if (!days) return [];
    const items = Array.isArray(days) ? days : String(days).split(",");
    return items
        .map((item) => {
            const value = String(item).trim().toLowerCase();
            if (!value) return null;
            const short = value.slice(0, 3);
            switch (short) {
                case "mon":
                    return "monday";
                case "tue":
                    return "tuesday";
                case "wed":
                    return "wednesday";
                case "thu":
                    return "thursday";
                case "fri":
                    return "friday";
                case "sat":
                    return "saturday";
                case "sun":
                    return "sunday";
                default:
                    if (["1", "2", "3", "4", "5", "6", "7"].includes(value)) {
                        const weekdayMap = {
                            1: "monday",
                            2: "tuesday",
                            3: "wednesday",
                            4: "thursday",
                            5: "friday",
                            6: "saturday",
                            7: "sunday",
                        };
                        return weekdayMap[value];
                    }
                    return null;
            }
        })
        .filter(Boolean);
};

const generatePlannedSessions = (startDate, duration, daysOfWeek) => {
    const normalizedDays = normalizeDaysOfWeek(daysOfWeek);
    if (!normalizedDays.length || !startDate || !duration) return [];

    const totalDays = Number(duration) * 7;
    let current = moment.tz(startDate, VN_TZ).startOf("day");

    while (!normalizedDays.includes(current.format("dddd").toLowerCase())) {
        current.add(1, "day");
    }

    const planned = [];
    let scannedDays = 0;

    while (scannedDays < totalDays) {
        if (normalizedDays.includes(current.format("dddd").toLowerCase())) {
            planned.push(moment(current));
        }
        current.add(1, "day");
        scannedDays += 1;
    }

    return planned;
};

const checkTeacherConflict = async (teacherId, sessionDate, start_time, end_time) => {
    const dateObj = parseVNDateStartOfDay(sessionDate);
    const sessions = await Session.find({ session_date: dateObj }).populate("class_id", "teacher_id");

    return sessions.some((session) => {
        const mainTeacherId = session.class_id?.teacher_id?.toString();
        const substituteTeacherId = session.substitute_teacher_id?.toString();
        const teacherIdString = teacherId.toString();

        if (mainTeacherId !== teacherIdString && substituteTeacherId !== teacherIdString) {
            return false;
        }

        return isOverlapping(session.start_time, session.end_time, start_time, end_time);
    });
};

const findMakeupSlot = async (teacherId, fromDate, start_time, end_time, endDate) => {
    if (!teacherId || !fromDate) return null;

    const startMinutes = toMinutes(start_time || "07:30");
    const defaultStart = start_time || "07:30";
    const defaultEnd = addMinutesToTime(defaultStart, CLASS_DURATION);

    const startDay = moment.tz(fromDate, DATE_FORMAT.ISO, VN_TZ).startOf("day");
    const searchEnd = endDate ? moment.tz(endDate, DATE_FORMAT.ISO, VN_TZ).endOf("day") : startDay.clone().add(28, "days");

    let current = startDay.clone();

    // 🔥 Ưu tiên tìm slot cùng ngày trước
    const sameDaySlots = await findSlotsForDate(teacherId, startDay, defaultStart, defaultEnd);
    if (sameDaySlots.length > 0) {
        // Chọn slot gần nhất với thời gian gốc
        const bestSlot = sameDaySlots.reduce((best, slot) => {
            const slotMinutes = toMinutes(slot.start);
            const bestMinutes = best ? toMinutes(best.start) : Infinity;
            const currentDiff = Math.abs(slotMinutes - startMinutes);
            const bestDiff = Math.abs(bestMinutes - startMinutes);
            return currentDiff < bestDiff ? slot : best;
        });
        return bestSlot;
    }

    // Nếu không có slot cùng ngày, tìm trong tuần hiện tại
    const currentWeekEnd = startDay.clone().endOf("week");
    current = startDay.clone().add(1, "day"); // Bắt đầu từ ngày mai

    while (current.isSameOrBefore(currentWeekEnd) && current.isSameOrBefore(searchEnd)) {
        const slots = await findSlotsForDate(teacherId, current, defaultStart, defaultEnd);
        if (slots.length > 0) {
            // Chọn slot gần nhất với thời gian gốc
            const bestSlot = slots.reduce((best, slot) => {
                const slotMinutes = toMinutes(slot.start);
                const bestMinutes = best ? toMinutes(best.start) : Infinity;
                const currentDiff = Math.abs(slotMinutes - startMinutes);
                const bestDiff = Math.abs(bestMinutes - startMinutes);
                return currentDiff < bestDiff ? slot : best;
            });
            return bestSlot;
        }
        current.add(1, "day");
    }

    // Nếu không có trong tuần hiện tại, tìm tuần tiếp theo
    const nextWeekStart = startDay.clone().add(1, "week").startOf("week");
    const nextWeekEnd = nextWeekStart.clone().endOf("week");

    current = nextWeekStart.clone();
    while (current.isSameOrBefore(nextWeekEnd) && current.isSameOrBefore(searchEnd)) {
        const slots = await findSlotsForDate(teacherId, current, defaultStart, defaultEnd);
        if (slots.length > 0) {
            const bestSlot = slots.reduce((best, slot) => {
                const slotMinutes = toMinutes(slot.start);
                const bestMinutes = best ? toMinutes(best.start) : Infinity;
                const currentDiff = Math.abs(slotMinutes - startMinutes);
                const bestDiff = Math.abs(bestMinutes - startMinutes);
                return currentDiff < bestDiff ? slot : best;
            });
            return bestSlot;
        }
        current.add(1, "day");
    }

    // Cuối cùng, tìm trong toàn bộ khoảng thời gian còn lại
    current = nextWeekEnd.clone().add(1, "day");
    while (current.isSameOrBefore(searchEnd)) {
        const slots = await findSlotsForDate(teacherId, current, defaultStart, defaultEnd);
        if (slots.length > 0) {
            return slots[0]; // Lấy slot đầu tiên tìm được
        }
        current.add(1, "day");
    }

    return null;
};

// 🔥 Helper function để tìm slots cho một ngày cụ thể
const findSlotsForDate = async (teacherId, date, preferredStart, preferredEnd) => {
    const dateObj = date.toDate();
    const sessions = await Session.find({ session_date: dateObj }).populate("class_id", "teacher_id");

    const teacherSessions = sessions.filter((session) => {
        const mainTeacherId = session.class_id?.teacher_id?.toString();
        const substituteTeacherId = session.substitute_teacher_id?.toString();
        const teacherIdString = teacherId.toString();
        return mainTeacherId === teacherIdString || substituteTeacherId === teacherIdString;
    });

    if (teacherSessions.length === 0) {
        // Ngày trống, trả về slot ưu tiên
        if (toMinutes(preferredEnd) <= MAX_END_TIME_MINUTES) {
            return [{ date: date.format(DATE_FORMAT.ISO), start_time: preferredStart, end_time: preferredEnd }];
        }
        return [];
    }

    // Tìm slots rảnh trong ngày
    const freeSlots = getFreeTimeSlots(teacherSessions);
    const validSlots = [];

    for (const slot of freeSlots) {
        const slotEnd = addMinutesToTime(slot.start, CLASS_DURATION);
        const conflict = teacherSessions.some((session) => isOverlapping(slot.start, slotEnd, session.start_time, session.end_time));
        if (!conflict && toMinutes(slotEnd) <= MAX_END_TIME_MINUTES) {
            validSlots.push({ date: date.format(DATE_FORMAT.ISO), start_time: slot.start, end_time: slotEnd });
        }
    }

    return validSlots;
};

module.exports = {
    generatePlannedSessions,
    checkTeacherConflict,
    findMakeupSlot,
    normalizeDaysOfWeek,
    findSlotsForDate,
};
