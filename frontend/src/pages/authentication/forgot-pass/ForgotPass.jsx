import React from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../../images/image1.png";
import thumb from "../../../images/form.png";
import "./ForgotPass.css";
import { useAuth } from "../../../contexts/authentication/AuthContext";

const validationSchema = Yup.object({
    email: Yup.string().email("Địa chỉ email không hợp lệ").required("Email là bắt buộc"),
});

const ForgotPass = () => {
    const { handleRequest } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        handleRequest(values, {
            onSuccess: () => {
                navigate("/login");
            },
            onError: (err) => {
                console.error("Send Link Failed:", err);
            },
        });
    };

    return (
        <div className="form_request">
            <div className="form_request-left">
                <img src={thumb} alt="Background" />
            </div>
            <div className="form_request-right">
                <div className="right_logo">
                    <img src={logo} alt="Logo" />
                </div>

                <button onClick={() => navigate("/login")} className="right_back-btn">
                    <i className="fa-solid fa-arrow-left"></i>
                    <p>Back To Login</p>
                </button>

                <h6 className="right_form-title">Forgot your password?</h6>
                <p className="right_form-desc">Don’t worry, happens to all of us. Enter your email below to recover your password.</p>

                <div className="right_form">
                    <Formik initialValues={{ email: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
                        <Form>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <Field type="email" name="email" id="email" className="input-field" />
                                <ErrorMessage name="email" component="div" className="err" />
                            </div>

                            <button type="submit">Send</button>
                        </Form>
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default ForgotPass;
