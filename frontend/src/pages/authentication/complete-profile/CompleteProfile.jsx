import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import logo from "../../../images/image1.png";
import "./CompleteProfile.css";
import { useAuth } from "../../../contexts/authentication/AuthContext";
import { useNavigate } from "react-router-dom";

// Validation schema với Yup (Tiếng Việt)
const validationSchema = Yup.object({
    first_name: Yup.string().required("Vui lòng nhập tên"),

    last_name: Yup.string().required("Vui lòng nhập họ"),

    phone_number: Yup.string()
        .matches(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam đúng định dạng.")
        .required("Vui lòng nhập số điện thoại"),

    address: Yup.string().required("Vui lòng nhập địa chỉ"),

    date_of_birth: Yup.date().nullable().required("Vui lòng chọn ngày sinh"),
});

const CompleteProfile = () => {
    const { handleCompleteProfile } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (values) => {
        handleCompleteProfile(values, {
            onSuccess: (res) => {
                const user = res.data.user;

                if (user.is_complete_profile) {
                    switch (user.type) {
                        case "admin":
                            navigate("/list-user");
                            break;
                        case "teacher":
                            navigate("/list-courses");
                            break;
                        case "student":
                            navigate("/my-attendance");
                            break;
                        default:
                            navigate("/404");
                    }
                }
            },
            onError: (err) => {
                console.error("Profile update failed:", err);
            },
        });
    };

    return (
        <div className="form_complete-profile">
            <div className="form_complete-profile-right">
                <div className="right_logo">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="right_form">
                    <h6 className="right_form-title">Your Profile</h6>
                    <Formik
                        initialValues={{
                            first_name: "",
                            last_name: "",
                            phone_number: "",
                            address: "",
                            date_of_birth: "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        <Form>
                            <label htmlFor="first_name">First Name</label>
                            <Field type="text" name="first_name" id="first_name" />
                            <ErrorMessage name="first_name" component="div" className="err" />

                            <label htmlFor="last_name">Last Name</label>
                            <Field type="text" name="last_name" id="last_name" />
                            <ErrorMessage name="last_name" component="div" className="err" />

                            <label htmlFor="phone_number">Phone Number</label>
                            <Field type="text" name="phone_number" id="phone_number" />
                            <ErrorMessage name="phone_number" component="div" className="err" />

                            <label htmlFor="address">Address</label>
                            <Field type="text" name="address" id="address" />
                            <ErrorMessage name="address" component="div" className="err" />

                            <label htmlFor="date_of_birth">Date of Birth</label>
                            <Field type="date" name="date_of_birth" id="date_of_birth" />
                            <ErrorMessage name="date_of_birth" component="div" className="err" />

                            <button type="submit">Update Profile</button>
                        </Form>
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default CompleteProfile;
