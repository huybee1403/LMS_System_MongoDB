import { useEffect } from "react";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import * as Yup from "yup";
import { getTodayVN, getTomorrowVN } from "../../utils/dateUtils";
import { buildPayload } from "../../utils/courseHelpers";

const validationSchema = (mode) =>
    Yup.object({
        name: Yup.string().trim().required("Tên lớp không được để trống"),
        description: Yup.string(),
        duration: Yup.number().required("Số tuần học không được để trống").positive("Phải là số dương").integer("Phải là số nguyên").min(4, "Ít nhất 4 tuần").max(12, "Nhiều nhất 12 tuần"),
        teacher_id: Yup.string().required("Phải chọn giáo viên"),
        start_date: Yup.date()
            .required("Chọn ngày bắt đầu")
            .min(mode === "create" ? getTomorrowVN() : getTodayVN(), mode === "create" ? "Ngày bắt đầu phải sau ngày hôm nay" : "Ngày bắt đầu phải từ ngày hôm nay trở đi"),
        end_date: Yup.date().required("Chọn ngày kết thúc").min(Yup.ref("start_date"), "Ngày kết thúc phải sau ngày bắt đầu"),
        number_of_sessions_per_week: Yup.number().required("Bắt buộc").min(2, "Ít nhất 2 buổi/tuần").max(7, "Nhiều nhất 7 buổi/tuần"),
        days_preset: Yup.string().required("Bắt buộc"),
        start_time: Yup.string()
            .required("Chọn giờ bắt đầu")
            .test("start-time-range", "Giờ bắt đầu phải từ 07:30 đến 19:30 (kết thúc trước 22:30)", (value) => {
                if (!value) return false;
                const [h, m] = value.split(":").map(Number);
                const startMinutes = h * 60 + m;
                const minStart = 7 * 60 + 30; // 07:30
                const maxStart = 19 * 60 + 30; // 19:30 → +3h = 22:30
                return startMinutes >= minStart && startMinutes <= maxStart;
            }),
        end_time: Yup.string()
            .required("Chọn giờ kết thúc")
            .test("end-time-range", "Giờ kết thúc phải trước 22:30", (value) => {
                if (!value) return false;
                const [h, m] = value.split(":").map(Number);
                const totalMinutes = h * 60 + m;
                const minMinutes = 7 * 60 + 30; // 07:30 = 450 phút
                const maxMinutes = 22 * 60 + 30; // 22:30 = 1350 phút
                return totalMinutes >= minMinutes && totalMinutes <= maxMinutes;
            }),
    });

const SyncEndDate = () => {
    const { values, setFieldValue } = useFormikContext();

    useEffect(() => {
        const { start_date, duration } = values;
        if (!start_date || duration === "" || duration == null) return;
        const start = new Date(start_date);
        if (Number.isNaN(start.getTime())) return;
        const end = new Date(start);
        end.setDate(end.getDate() + Number(duration) * 7);
        const next = end.toISOString().slice(0, 10);
        setFieldValue("end_date", next);
    }, [values, setFieldValue]);

    return null;
};

const SyncEndTime = () => {
    const { values, setFieldValue } = useFormikContext();

    useEffect(() => {
        const { start_time } = values;

        if (!start_time) return;

        const [h, m] = start_time.split(":").map(Number);
        let totalMinutes = h * 60 + m + 180; // +3 tiếng

        const maxMinutes = 22 * 60 + 30; // 22:30

        // nếu vượt quá thì clamp về 22:30
        if (totalMinutes > maxMinutes) {
            totalMinutes = maxMinutes;
        }

        const endH = Math.floor(totalMinutes / 60)
            .toString()
            .padStart(2, "0");
        const endM = (totalMinutes % 60).toString().padStart(2, "0");

        const endTime = `${endH}:${endM}`;

        setFieldValue("end_time", endTime);
    }, [values.start_time, setFieldValue]);

    return null;
};

const CourseFormModal = ({ mode, initialValues, teachers, onClose, modalRef, onCreate, onUpdate }) => {
    if (mode === "create" && typeof onCreate !== "function") return null;
    if (mode === "edit" && typeof onUpdate !== "function") return null;
    if (!initialValues) return null;

    return (
        <div className="modal active">
            <div className="modal_box" ref={modalRef}>
                <div className="modal-close" onClick={onClose} role="presentation">
                    <i className="fa-solid fa-xmark" />
                </div>

                <h2 className="headline-1" style={{ marginBottom: "16px" }}>
                    {mode === "create" ? "Thêm lớp học" : "Sửa lớp học"}
                </h2>

                <Formik
                    enableReinitialize
                    initialValues={initialValues}
                    validationSchema={validationSchema(mode)}
                    onSubmit={(values, actions) => {
                        const payload = buildPayload(values);
                        const onFinally = () => actions.setSubmitting(false);
                        if (mode === "edit") {
                            onUpdate({ ...payload, id: values.id }, () => onClose(), onFinally);
                        } else {
                            onCreate(payload, () => onClose(), onFinally);
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <SyncEndDate />
                            <SyncEndTime />
                            <div>
                                <label htmlFor="name">Tên lớp học</label>
                                <Field type="text" name="name" id="name" className="c_input" />
                                <ErrorMessage name="name" component="div" className="err" />
                            </div>

                            <div>
                                <label htmlFor="description">Mô tả</label>
                                <Field as="textarea" name="description" id="description" className="c_input" rows={3} />
                            </div>

                            <div>
                                <label htmlFor="duration">Số tuần học</label>
                                <Field type="number" name="duration" id="duration" min={1} className="c_input" />
                                <ErrorMessage name="duration" component="div" className="err" />
                            </div>

                            <div>
                                <label htmlFor="teacher_id">Giáo viên</label>
                                <Field as="select" name="teacher_id" id="teacher_id" className="c_input">
                                    <option value="">-- Chọn giáo viên --</option>
                                    {teachers.map((t) => (
                                        <option key={t._id} value={String(t._id)}>
                                            {t.first_name} {t.last_name}
                                        </option>
                                    ))}
                                </Field>
                                <ErrorMessage name="teacher_id" component="div" className="err" />
                            </div>

                            <div>
                                <label htmlFor="start_date">Ngày bắt đầu</label>
                                <Field type="date" name="start_date" id="start_date" className="c_input" />
                                <ErrorMessage name="start_date" component="div" className="err" />
                            </div>

                            <div>
                                <label htmlFor="end_date">
                                    Ngày kết thúc <span style={{ fontSize: "var(--fs-14)", color: "var(--Light_mode-Gray_Scale-5)" }}>(dự kiến theo số tuần)</span>
                                </label>
                                <Field type="date" name="end_date" id="end_date" readOnly className="c_input" />
                                <ErrorMessage name="end_date" component="div" className="err" />
                            </div>

                            <div>
                                <label htmlFor="number_of_sessions_per_week">Số buổi/tuần</label>
                                <Field type="number" name="number_of_sessions_per_week" id="number_of_sessions_per_week" min={1} max={7} className="c_input" />
                                <ErrorMessage name="number_of_sessions_per_week" component="div" className="err" />
                            </div>

                            <div>
                                <label htmlFor="days_preset">Ngày học trong tuần</label>
                                <Field as="select" name="days_preset" id="days_preset" className="c_input">
                                    <option value="mon_wed_fri">Thứ 2, 4, 6</option>
                                    <option value="tue_thu_sat">Thứ 3, 5, 7</option>
                                </Field>
                                <ErrorMessage name="days_preset" component="div" className="err" />
                            </div>

                            <div>
                                <label htmlFor="start_time">Giờ bắt đầu</label>
                                <Field type="time" name="start_time" id="start_time" className="c_input" />
                                <ErrorMessage name="start_time" component="div" className="err" />
                            </div>

                            <div>
                                <label htmlFor="end_time">Giờ kết thúc</label>
                                <Field type="time" name="end_time" id="end_time" className="c_input" readOnly />
                                <ErrorMessage name="end_time" component="div" className="err" />
                            </div>

                            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                                <button type="button" className="out-button" onClick={onClose} disabled={isSubmitting}>
                                    Huỷ
                                </button>
                                <button type="submit" className="c-button-1" disabled={isSubmitting}>
                                    {isSubmitting ? "Đang lưu..." : mode === "create" ? "Tạo lớp" : "Cập nhật"}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default CourseFormModal;
