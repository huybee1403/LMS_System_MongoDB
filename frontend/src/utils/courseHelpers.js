export const courseToFormValues = (course) => {
    const detectPreset = (days) => {
        if (!days?.length) return "mon_wed_fri";
        const set = new Set(days.map((d) => String(d).toLowerCase()));
        const a = new Set(["monday", "wednesday", "friday"]);
        const b = new Set(["tuesday", "thursday", "saturday"]);
        if (set.size === a.size && [...set].every((d) => a.has(d))) return "mon_wed_fri";
        if (set.size === b.size && [...set].every((d) => b.has(d))) return "tue_thu_sat";
        return "mon_wed_fri";
    };

    const toDateInput = (v) => {
        if (!v) return "";
        if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
        try {
            const d = new Date(v);
            if (Number.isNaN(d.getTime())) return "";
            return d.toISOString().slice(0, 10);
        } catch {
            return "";
        }
    };

    const tid = course.teacher_id;
    const teacherIdStr = tid && typeof tid === "object" && tid._id != null ? String(tid._id) : tid != null ? String(tid) : "";

    return {
        id: course._id,
        name: course.name || "",
        description: course.description || "",
        duration: course.duration ?? "",
        teacher_id: teacherIdStr,
        start_date: toDateInput(course.start_date),
        end_date: toDateInput(course.end_date),
        number_of_sessions_per_week: course.number_of_sessions_per_week ?? 3,
        days_preset: detectPreset(course.days_of_week),
        start_time: course.start_time || "",
        end_time: course.end_time || "",
    };
};

const WEEK_PRESETS = {
    mon_wed_fri: ["monday", "wednesday", "friday"],
    tue_thu_sat: ["tuesday", "thursday", "saturday"],
};

export const buildPayload = (values) => ({
    name: values.name.trim(),
    description: (values.description || "").trim(),
    duration: Number(values.duration),
    teacher_id: values.teacher_id,
    start_date: values.start_date,
    end_date: values.end_date,
    number_of_sessions_per_week: Number(values.number_of_sessions_per_week),
    days_of_week: WEEK_PRESETS[values.days_preset] || WEEK_PRESETS.mon_wed_fri,
    start_time: values.start_time,
    end_time: values.end_time,
});
