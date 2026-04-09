import { useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import usePagination from "../hooks/usePagination";

const getUserId = (user) => user?._id || user?.id || null;
const getUserRole = (user) => user?.type || user?.user_type || null;
const getTeacherId = (teacher) => teacher?._id || teacher?.id || teacher || null;
const getSubstituteTeacherId = (session) => session?.substitute_teacher_id?._id || session?.substitute_teacher_id?.id || session?.substitute_teacher_id || null;

const useCourseFilter = (courses, user) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [status, setStatus] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // debounce search
    useEffect(() => {
        const handler = debounce(() => {
            setDebouncedSearch(searchTerm);
        }, 300);

        handler();
        return () => handler.cancel();
    }, [searchTerm]);

    // filter
    const filteredCourses = useMemo(() => {
        const userId = getUserId(user);
        const userRole = getUserRole(user);

        return (courses || [])
            .map((c) => {
                const teacherId = getTeacherId(c.teacher_id);
                const assignedSubstituteTeacherIds = Array.isArray(c.assigned_substitute_teacher_ids) ? c.assigned_substitute_teacher_ids.map((id) => String(id)) : [];
                const assignedMakeupSessions = Array.isArray(c.sessions)
                    ? c.sessions.filter((session) => {
                          const substituteTeacherId = getSubstituteTeacherId(session);
                          return String(substituteTeacherId) === String(userId);
                      })
                    : [];
                const hasAssignedSubstituteTeacher = assignedSubstituteTeacherIds.includes(String(userId));

                return {
                    ...c,
                    __assignedMakeupSessions: assignedMakeupSessions,
                    __isSubstituteOnlyClass: userRole === "teacher" && String(teacherId) !== String(userId) && (assignedMakeupSessions.length > 0 || hasAssignedSubstituteTeacher),
                };
            })
            .filter((c) => {
            const bySearch = c.name?.toLowerCase().includes(debouncedSearch.toLowerCase());

            const teacherId = getTeacherId(c.teacher_id);
            const hasAssignedMakeupSession = c.__assignedMakeupSessions.length > 0 || (Array.isArray(c.assigned_substitute_teacher_ids) ? c.assigned_substitute_teacher_ids.map((id) => String(id)).includes(String(userId)) : false);

            let byTeacher = true;

            if (userRole === "teacher") {
                byTeacher = String(teacherId) === String(userId) || hasAssignedMakeupSession;
            } else {
                byTeacher = selectedTeacherId ? String(teacherId) === String(selectedTeacherId) : true;
            }

            const byStatus = status ? c.status === status : true;

            return bySearch && byTeacher && byStatus;
            });
    }, [courses, debouncedSearch, selectedTeacherId, status, user]);

    // pagination
    const { currentPage, totalPages, currentItems, handlePageChange } = usePagination(filteredCourses);

    return {
        searchTerm,
        setSearchTerm,
        selectedTeacherId,
        setSelectedTeacherId,
        status,
        setStatus,
        filteredCourses,

        currentPage,
        totalPages,
        currentItems,
        handlePageChange,
    };
};

export default useCourseFilter;
