const moment = require("moment-timezone");
const Class = require("../models/class.model");
const { parseVNDateStartOfDay, VN_TZ } = require("../utils/dateUtilsForSession");
const { CLASS_STATUS } = require("../constants/constants");

const updateClassStatusOnStartup = async () => {
    try {
        const today = moment().tz(VN_TZ).startOf("day").toDate();

        const completed = await Class.updateMany({ end_date: { $lt: today }, status: { $ne: CLASS_STATUS.COMPLETED } }, { status: CLASS_STATUS.COMPLETED });

        const ongoing = await Class.updateMany(
            {
                start_date: { $lte: today },
                end_date: { $gte: today },
                status: { $ne: CLASS_STATUS.ONGOING },
            },
            { status: CLASS_STATUS.ONGOING },
        );

        if ((completed.modifiedCount || 0) + (ongoing.modifiedCount || 0) > 0) {
            console.log(`✅ Cập nhật trạng thái lớp: completed=${completed.modifiedCount || 0}, ongoing=${ongoing.modifiedCount || 0}`);
        } else {
            console.log("📘 Không có lớp nào cần cập nhật trạng thái.");
        }
    } catch (err) {
        console.error("❌ Lỗi updateClassStatusOnStartup:", err.message || err);
    }
};

module.exports = updateClassStatusOnStartup;
