import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

// 🔥 Validation
const validationSchema = Yup.object({
    email: Yup.string().email("Email không hợp lệ").required("Bắt buộc"),
    password: Yup.string().min(6, "Ít nhất 6 ký tự").required("Bắt buộc"),
    repassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Không khớp")
        .required("Bắt buộc"),
});

const CreateUserModal = ({
    isOpen,
    onClose,
    modalRef,
    onCreate, // callback handleRegister
}) => {
    if (!isOpen) return null;

    return (
        <div className={`modal ${isOpen ? "active" : ""}`} ref={modalRef}>
            {isOpen && (
                <div className="modal_box">
                    {/* Close */}
                    <div className="modal-close" onClick={onClose}>
                        <i className="fa-solid fa-xmark" />
                    </div>

                    <Formik
                        initialValues={{
                            email: "",
                            password: "",
                            repassword: "",
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, { resetForm }) => {
                            onCreate(values, {
                                onSuccess: () => {
                                    resetForm();
                                    onClose();
                                },
                            });
                        }}
                    >
                        <Form>
                            <div>
                                <label>Email</label>
                                <Field type="email" name="email" />
                                <ErrorMessage name="email" component="div" className="err" />
                            </div>

                            <div>
                                <label>Password</label>
                                <Field type="password" name="password" />
                                <ErrorMessage name="password" component="div" className="err" />
                            </div>

                            <div>
                                <label>Re-Password</label>
                                <Field type="password" name="repassword" />
                                <ErrorMessage name="repassword" component="div" className="err" />
                            </div>

                            <button type="submit">Create Account</button>
                        </Form>
                    </Formik>
                </div>
            )}
        </div>
    );
};

export default CreateUserModal;
