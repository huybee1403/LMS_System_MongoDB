// src/utils/timeUtils.js
export const timeToMinutes = (t) => {
    if (!t) return 0;
    const [h, m] = t.trim().split(":").map(Number);
    return h * 60 + m;
};
