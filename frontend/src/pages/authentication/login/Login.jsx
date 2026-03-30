import logo from "../../../images/image1.png";
import thumb from "../../../images/form.png";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authentication/AuthContext";
import "./Login.css";
import { jwtDecode } from "jwt-decode";

// Validation schema
const validationSchema = Yup.object({
    email: Yup.string().email("Địa chỉ email không hợp lệ").required("Email là bắt buộc"),
    password: Yup.string().required("Mật khẩu là bắt buộc").min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

const Login = () => {
    const { handleLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (values, e) => {
        handleLogin(values, {
            onSuccess: (res) => {
                if (res.token) {
                    const decoded = jwtDecode(res.token);
                    if (!decoded.isProfileComplete) {
                        navigate("/complete-profile");
                        return;
                    }
                    switch (decoded.type) {
                        case "admin":
                            navigate("/list-user");
                            break;
                        case "teacher":
                            navigate("/list-courses");
                            break;
                        case "student":
                            navigate("/list-calender");
                            break;
                        default:
                            navigate("/404");
                    }
                }
            },
            onError: (err) => {
                console.error("Login failed:", err);
            },
        });
    };

    return (
        <div className="form_login">
            <div className="form_login-left">
                <img src={thumb} alt="Left" />
            </div>
            <div className="form_login-right">
                <div className="right_logo">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="right_form">
                    <h6 className="right_form-title">Nice to see you again</h6>

                    <Formik initialValues={{ email: "", password: "", rememberMe: false }} validationSchema={validationSchema} onSubmit={handleSubmit}>
                        {({ setFieldValue }) => (
                            <Form>
                                <label htmlFor="email">Email</label>
                                <Field type="email" name="email" id="email" />
                                <ErrorMessage name="email" component="p" className="err" />

                                <label htmlFor="password">Password</label>
                                <div className="password">
                                    <Field type="password" name="password" id="password" />
                                </div>
                                <ErrorMessage name="password" component="p" className="err" />

                                <div className="btn">
                                    <div className="btn_remember">
                                        <label className="switch">
                                            <Field type="checkbox" name="rememberMe" id="rememberMe" onClick={() => setFieldValue("rememberMe", (prev) => !prev)} />
                                            <span className="slider"></span>
                                        </label>
                                        <p>Remember me</p>
                                    </div>
                                    <div className="btn_forgot">
                                        <Link to="/request-reset">Forgot password?</Link>
                                    </div>
                                </div>

                                <button type="submit">Sign In</button>

                                <Link to="/register">You Don't Have An Account?</Link>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default Login;
