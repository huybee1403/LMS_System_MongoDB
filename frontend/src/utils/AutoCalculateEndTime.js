import { useEffect } from "react";
import { useFormikContext } from "formik";

// Hàm tính end_time = start_time + 3 tiếng
const calculateEndTime = (startTimeStr) => {
    if (!startTimeStr) return "";
    let [h, m] = startTimeStr.split(":").map(Number);
    h += 3; // cộng 3 tiếng
    if (h >= 24) h -= 24; // quá 24h thì reset
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    return `${hh}:${mm}`;
};

const AutoCalculateEndTime = () => {
    const { values, setFieldValue, setFieldTouched } = useFormikContext();

    useEffect(() => {
        const { start_time } = values;
        if (start_time) {
            const endTime = calculateEndTime(start_time);

            // Set giá trị
            setFieldValue("end_time", endTime);

            // Để hiện lỗi nếu có
            setFieldTouched("end_time", true, true);
        }
    }, [values.start_time]);

    return null;
};

export default AutoCalculateEndTime;
