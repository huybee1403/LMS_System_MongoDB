export const getCurrentMonthYear = () => {
    const now = new Date();

    // chuyển sang giờ VN
    const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    return {
        currentMonth: vnTime.getUTCMonth() + 1, // dùng getUTC… tránh lệch múi giờ
        currentYear: vnTime.getUTCFullYear(),
    };
};

// Kiểm tra disable nút tiến (next)
export const isNextDisabled = (month, year) => {
    const { currentMonth, currentYear } = getCurrentMonthYear();

    return year > currentYear || (year === currentYear && month === currentMonth);
};

// Luôn cho đi lùi → disablePrev = false
export const isPrevDisabled = () => false;

// Tính month/year khi bấm mũi tên trái
export const getPrevMonthYear = (month, year) => {
    if (month === 1) {
        return { month: 12, year: year - 1 };
    }
    return { month: month - 1, year };
};

// Tính month/year khi bấm mũi tên phải
export const getNextMonthYear = (month, year) => {
    if (month === 12) {
        return { month: 1, year: year + 1 };
    }
    return { month: month + 1, year };
};

// Tên tháng để hiển thị
export const monthNames = ["", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
