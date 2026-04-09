import { ErrorMessage, Field, Form, Formik } from "formik";

const EditUserModal = ({ user, onClose, onSubmit, modalRef, activeId }) => {
    // ❌ không có user thì không render
    if (!user || !activeId) return null;

    return (
        <div className="modal active">
            {/* 🔥 GẮN REF ĐÚNG CHỖ */}
            <div className="modal_box" ref={modalRef}>
                {/* Close */}
                <div className="modal-close" onClick={onClose}>
                    <i className="fa-solid fa-xmark" />
                </div>

                <Formik
                    enableReinitialize // 🔥 QUAN TRỌNG: đổi user vẫn update form
                    initialValues={{
                        email: user.email || "",
                        new_password: "",
                        role: user.user_type || "",
                    }}
                    onSubmit={onSubmit}
                >
                    <Form>
                        <div>
                            <label>Email</label>
                            <Field type="text" name="email" readOnly />
                        </div>

                        <div>
                            <label>Password</label>
                            <Field type="password" name="new_password" />
                            <ErrorMessage name="new_password" component="div" className="err" />
                        </div>

                        <div>
                            <label>Role</label>
                            <Field as="select" name="role">
                                <option value="">Select</option>
                                <option value="admin">Admin</option>
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </Field>
                            <ErrorMessage name="role" component="div" className="err" />
                        </div>

                        <button type="submit">
                            <i className="fa-solid fa-floppy-disk" /> Lưu thay đổi
                        </button>
                    </Form>
                </Formik>
            </div>
        </div>
    );
};

export default EditUserModal;
