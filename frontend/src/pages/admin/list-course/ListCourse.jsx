import { useEffect, useMemo, useState } from "react";

import FilterBar from "../../../components/courses/FilterBar";
import CourseTable from "../../../components/courses/CourseTable";
import CourseFormModal from "../../../components/courses/CourseFormModal";
import DeleteModal from "../../../components/courses/DeleteModal";

import useCourseFilter from "../../../hooks/useCourseFilter";
import useCourseUI from "../../../hooks/useCourseUI";

import { useAuth } from "../../../contexts/authentication/AuthContext";
import { useCourses } from "../../../contexts/courses/CourseContext";
import { getAllUserByRole } from "../../../services/apis/api";
import { courseToFormValues } from "../../../utils/courseHelpers";

import "./ListCourse.css";

const emptyCreateValues = {
    name: "",
    description: "",
    duration: "",
    teacher_id: "",
    start_date: "",
    end_date: "",
    number_of_sessions_per_week: 3,
    days_preset: "mon_wed_fri",
    start_time: "",
    end_time: "",
};

const ListCourses = () => {
    const { user } = useAuth();
    const { courses, handleCreateCourse, handleUpdateCourse, handleDeleteCourse, fetchCourses, loading } = useCourses();

    const ui = useCourseUI();
    const [teachers, setTeachers] = useState([]);

    const isAdmin = user?.type === "admin";

    useEffect(() => {
        const userId = user?._id || user?.id;
        const userRole = user?.type || user?.user_type;

        if (userRole === "teacher" && userId) {
            fetchCourses({ teacherId: userId, includeSubstitute: true });
            return;
        }

        fetchCourses();
    }, [fetchCourses, user]);

    useEffect(() => {
        if (!isAdmin) return; // 👈 chỉ admin mới cần load teacher

        let cancelled = false;
        (async () => {
            try {
                const data = await getAllUserByRole("teacher");
                if (!cancelled && Array.isArray(data)) setTeachers(data);
            } catch {
                if (!cancelled) setTeachers([]);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [isAdmin]);

    // 🔥 dùng filter theo role
    const filter = useCourseFilter(courses, user);

    const editFormValues = useMemo(() => (ui.editCourse ? courseToFormValues(ui.editCourse) : null), [ui.editCourse]);

    return (
        <>
            <div className="layout-top">
                <h1 className="headline-1">Danh sách lớp học</h1>

                {isAdmin && (
                    <button type="button" className="c-button-1" onClick={() => ui.setActiveModal("create")}>
                        <i className="fa-regular fa-square-plus" /> Thêm lớp học
                    </button>
                )}
            </div>

            {loading && courses.length === 0 && (
                <div className="layout-box">
                    <p style={{ textAlign: "center", color: "var(--Light-Quaternary-50)", fontSize: "var(--fs-16)" }}>Đang tải danh sách...</p>
                </div>
            )}

            <FilterBar
                searchTerm={filter.searchTerm}
                setSearchTerm={filter.setSearchTerm}
                teachers={isAdmin ? teachers : []} // 👈 teacher không có filter
                selectedTeacherId={filter.selectedTeacherId}
                setSelectedTeacherId={filter.setSelectedTeacherId}
                status={filter.status}
                setStatus={filter.setStatus}
                currentPage={filter.currentPage}
                totalPages={filter.totalPages}
                handlePageChange={filter.handlePageChange}
                showTeacherFilter={isAdmin}
            />

            <CourseTable
                currentItems={filter.currentItems}
                currentPage={filter.currentPage}
                user={user}
                onEdit={(course) => {
                    ui.setEditCourse(course);
                    ui.setActiveModal("edit");
                }}
                onDelete={(course) => {
                    ui.setEditCourse(course);
                    ui.setActiveModal("delete");
                }}
            />

            {ui.activeModal === "create" && isAdmin && (
                <CourseFormModal
                    mode="create"
                    initialValues={emptyCreateValues}
                    teachers={teachers}
                    onClose={ui.closeModal}
                    modalRef={ui.formModalRef}
                    onCreate={(payload, onSuccess, onFinally) => handleCreateCourse(payload, onSuccess, onFinally)}
                />
            )}

            {ui.activeModal === "edit" && ui.editCourse && isAdmin && (
                <CourseFormModal
                    mode="edit"
                    initialValues={editFormValues}
                    teachers={teachers}
                    onClose={ui.closeModal}
                    modalRef={ui.formModalRef}
                    onUpdate={(payload, onSuccess, onFinally) => handleUpdateCourse(payload, onSuccess, onFinally)}
                />
            )}

            {ui.activeModal === "delete" && ui.editCourse && isAdmin && (
                <DeleteModal
                    courseName={ui.editCourse.name}
                    onClose={ui.closeModal}
                    modalRef={ui.deleteModalRef}
                    onDelete={() => {
                        const id = ui.editCourse._id ?? ui.editCourse.id;
                        handleDeleteCourse(
                            id,
                            () => ui.closeModal(),
                            () => {},
                        );
                    }}
                />
            )}
        </>
    );
};

export default ListCourses;
