import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import logo from "../../../images/image1.png";
import thumb from "../../../images/form.png";
import "./Register.css";
import { useAuth } from "../../../contexts/authentication/AuthContext";
import { useNavigate } from "react-router-dom";

// Validation schema với Yup
const validationSchema = Yup.object({
    email: Yup.string().email("Địa chỉ email không hợp lệ").required("Email là bắt buộc"),
    password: Yup.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").required("Mật khẩu là bắt buộc"),
    repassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Mật khẩu không khớp")
        .required("Xác nhận mật khẩu là bắt buộc"),
});

const RegisterForm = () => {
    const { handleRegister } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (values) => {
        handleRegister(values, {
            onSuccess: () => {
                navigate("/complete-profile"); // Hoặc "/login" nếu bạn muốn chuyển về trang login
            },
            onError: (err) => {
                console.error("Registration failed:", err);
                // Có thể toast lỗi ở đây nếu cần
            },
        });
    };

    return (
        <div className="form_register">
            <div className="form_register-left">
                <img src={thumb} alt="Left Image" />
            </div>
            <div className="form_register-right">
                <div className="right_logo">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="right_form">
                    <h6 className="right_form-title">Create Your Account</h6>
                    <Formik
                        initialValues={{
                            email: "",
                            password: "",
                            repassword: "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        <Form>
                            <div>
                                <label htmlFor="email">Email</label>
                                <Field type="email" name="email" id="email" />
                                <ErrorMessage name="email" component="div" className="err" />
                            </div>

                            <div>
                                <label htmlFor="password">Password</label>
                                <Field type="password" name="password" id="password" />
                                <ErrorMessage name="password" component="div" className="err" />
                            </div>

                            <div>
                                <label htmlFor="repassword">Re-Password</label>
                                <Field type="password" name="repassword" id="repassword" />
                                <ErrorMessage name="repassword" component="div" className="err" />
                            </div>

                            <div>
                                <button type="submit">Sign Up</button>
                            </div>
                        </Form>
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
