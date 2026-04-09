import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./ResetPass.css";
import logo from "../../../images/image1.png";
import thumb from "../../../images/form.png";
import { useAuth } from "../../../contexts/authentication/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

const validationSchema = Yup.object({
    new_password: Yup.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự").required("Vui lòng nhập mật khẩu mới"),

    confirm_password: Yup.string()
        .oneOf([Yup.ref("new_password")], "Mật khẩu xác nhận không khớp")
        .required("Vui lòng xác nhận mật khẩu"),
});

const ResetPass = () => {
    const { token } = useParams(); // token từ link reset
    const navigate = useNavigate();
    const { handleResetPassword } = useAuth();

    const handleSubmit = async (values) => {
        handleResetPassword(
            {
                token,
                new_password: values.new_password,
            },
            {
                onSuccess: () => navigate("/login"),
                onError: (err) => console.error(err),
            },
        );
    };

    return (
        <div className="form_resetpass">
            <div className="form_resetpass-left">
                <img src={thumb} alt="Hình minh họa" />
            </div>

            <div className="form_resetpass-right">
                <div className="right_logo">
                    <img src={logo} alt="Logo" />
                </div>

                <div className="right_form">
                    <h6 className="right_form-title">Đặt lại mật khẩu</h6>

                    <Formik
                        initialValues={{
                            new_password: "",
                            confirm_password: "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        <Form>
                            <div className="form-group">
                                <label htmlFor="new_password">Mật khẩu mới</label>
                                <Field type="password" name="new_password" id="new_password" />
                                <ErrorMessage name="new_password" component="div" className="err" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirm_password">Xác nhận mật khẩu</label>
                                <Field type="password" name="confirm_password" id="confirm_password" />
                                <ErrorMessage name="confirm_password" component="div" className="err" />
                            </div>

                            <button type="submit">Đặt lại mật khẩu</button>
                        </Form>
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default ResetPass;
