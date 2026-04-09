import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { updateSalaryConfig } from "../../../services/apis/api";
import { toast } from "react-toastify";

const SettingSchema = Yup.object().shape({
    substitute_coefficient: Yup.number().min(0, "Không được nhỏ hơn 0"),
    makeup_coefficient: Yup.number().min(0, "Không được nhỏ hơn 0"),
    rate_per_session: Yup.number().min(0, "Không được nhỏ hơn 0"),
});

const SettingPage = () => {
    const initialValues = {
        substitute_coefficient: "",
        makeup_coefficient: "",
        rate_per_session: "",
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            // Convert "" -> null để COALESCE hoạt động
            const config = {
                substitute_coefficient: values.substitute_coefficient === "" ? null : Number(values.substitute_coefficient),

                makeup_coefficient: values.makeup_coefficient === "" ? null : Number(values.makeup_coefficient),

                rate_per_session: values.rate_per_session === "" ? null : Number(values.rate_per_session),
            };

            const mess = await updateSalaryConfig(config);
            toast.success(mess.message);
            resetForm();
        } catch (err) {
            toast.error(err.message || "Lưu cấu hình thất bại!");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="layout-box-2">
            <h1 className="headline-2">Cài đặt thông báo và thông tin khác</h1>

            <Formik initialValues={initialValues} validationSchema={SettingSchema} onSubmit={handleSubmit}>
                {({ isSubmitting }) => (
                    <Form id="form_setting" noValidate>
                        <div className="row row-flex profile-row">
                            <div className="col-12">
                                <div className="form-box">
                                    <label>Hệ số buổi dạy thay (%)</label>
                                    <div className="form-group c-form-border">
                                        <Field type="number" name="substitute_coefficient" className="c_input" min="0" />
                                    </div>
                                    <ErrorMessage name="substitute_coefficient" component="div" className="err" />
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="form-box">
                                    <label>Hệ số buổi dạy bù (%)</label>
                                    <div className="form-group c-form-border">
                                        <Field type="number" name="makeup_coefficient" className="c_input" min="0" />
                                    </div>
                                    <ErrorMessage name="makeup_coefficient" component="div" className="err" />
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="form-box">
                                    <label>Tiền dạy trên 1 buổi (VND)</label>
                                    <div className="form-group c-form-border">
                                        <Field type="number" name="rate_per_session" className="c_input" min="0" />
                                    </div>
                                    <ErrorMessage name="rate_per_session" component="div" className="err" />
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <button className="c-button-1" type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default SettingPage;
