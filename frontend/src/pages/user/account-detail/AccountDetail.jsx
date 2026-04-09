import { useEffect, useRef, useState } from "react";
import "./AccountDetail.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useUser } from "../../../contexts/users/UserContext";
import { useAuth } from "../../../contexts/authentication/AuthContext";
import DEFAULT_AVATAR from "../../../images/form.png";
import { convertToVietnamDate } from "../../../utils/dateUtils";

const AccountDetail = () => {
    const fileInputRef = useRef(null);
    const [initialValues, setInitialValues] = useState(null);
    const { user } = useAuth();
    const { handleUpdateAccountDetail } = useUser();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = user;

                setInitialValues({
                    id: userData?.id || "",
                    avatar: null,
                    avatarUrl: userData?.avatar
                        ? `http://localhost:8080/uploads/${userData.avatar}${userData?.avatar_updated_at ? `?t=${userData.avatar_updated_at}` : ""}`
                        : "",
                    email: userData?.email || "",
                    phone_number: userData?.phone_number || "",
                    date_of_birth: convertToVietnamDate(userData?.date_of_birth),
                    new_password: "",
                    repassword: "",
                });
            } catch (err) {
                toast.error("Không thể tải thông tin người dùng.");
            }
        };
        fetchData();
    }, [user]);

    if (!initialValues) return null;

    return (
        <div className="layout-box-2">
            <h1 className="headline-2">Thông tin cá nhân</h1>
            <Formik
                initialValues={initialValues}
                enableReinitialize
                validationSchema={Yup.object({
                    phone_number: Yup.string()
                        .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
                        .required("Vui lòng nhập số điện thoại"),
                    date_of_birth: Yup.date().required("Vui lòng chọn ngày sinh"),
                    new_password: Yup.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").notRequired(),

                    repassword: Yup.string().when("new_password", {
                        is: (val) => val && val.length > 0,
                        then: (schema) => schema.oneOf([Yup.ref("new_password")], "Mật khẩu không khớp").required("Vui lòng nhập lại mật khẩu"),
                        otherwise: (schema) => schema.notRequired(),
                    }),
                })}
                onSubmit={(values, formikHelpers) => {
                    const { avatarUrl, ...dataToSend } = values;
                    handleUpdateAccountDetail(dataToSend, formikHelpers);
                }}
            >
                {({ setFieldValue, values }) => {
                    const previewUrl = values.avatar ? URL.createObjectURL(values.avatar) : values.avatarUrl || "";

                    return (
                        <Form>
                            <div className="c-upload c-upload-image">
                                <input
                                    ref={fileInputRef}
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={(e) => {
                                        const file = e.currentTarget.files[0];
                                        e.target.value = "";
                                        if (file) {
                                            setFieldValue("avatar", file);
                                            setFieldValue("avatarUrl", "");
                                        }
                                    }}
                                />

                                <div className="c_thumb">
                                    {!previewUrl && (
                                        <div className="c_thumb-default">
                                            <img
                                                src={
                                                    user?.avatar
                                                        ? `http://localhost:8080/uploads/${user.avatar}${user?.avatar_updated_at ? `?t=${user.avatar_updated_at}` : ""}`
                                                        : DEFAULT_AVATAR
                                                }
                                                alt="Default Avatar"
                                            />
                                        </div>
                                    )}

                                    {previewUrl && (
                                        <div className="c_thumb-preview">
                                            <img src={previewUrl} alt="Avatar preview" />
                                        </div>
                                    )}
                                </div>

                                <div className="c_btn">
                                    {!previewUrl && (
                                        <label htmlFor="avatar-upload" className="c-button-2">
                                            Chọn hình
                                        </label>
                                    )}

                                    {previewUrl && (
                                        <>
                                            <button type="button" className="c-button-1" onClick={() => fileInputRef.current?.click()}>
                                                Thay đổi
                                            </button>
                                            <button
                                                type="button"
                                                className="c-button-2"
                                                onClick={() => {
                                                    setFieldValue("avatar", null);
                                                    setFieldValue("avatarUrl", "");
                                                    fileInputRef.current.value = "";
                                                }}
                                            >
                                                Xóa
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label>Email</label>
                                <Field type="text" name="email" readOnly />
                            </div>

                            <div>
                                <label>Số điện thoại</label>
                                <Field type="text" name="phone_number" />
                                <ErrorMessage name="phone_number" component="div" className="err" />
                            </div>

                            <div>
                                <label>Ngày sinh</label>
                                <Field type="date" name="date_of_birth" />
                                <ErrorMessage name="date_of_birth" component="div" className="err" />
                            </div>

                            <div>
                                <label>Mật khẩu mới</label>
                                <Field type="password" name="new_password" />
                                <ErrorMessage name="new_password" component="div" className="err" />
                            </div>

                            <div>
                                <label>Nhập lại mật khẩu</label>
                                <Field type="password" name="repassword" />
                                <ErrorMessage name="repassword" component="div" className="err" />
                            </div>

                            <button type="submit">
                                <i className="fa-solid fa-floppy-disk" /> Lưu thay đổi
                            </button>
                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
};

export default AccountDetail;
