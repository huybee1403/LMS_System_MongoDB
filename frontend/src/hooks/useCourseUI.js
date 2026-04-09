import { useState, useRef, useCallback } from "react";
import useClickOutSide from "./useClickOutSide";

const useCourseUI = () => {
    const [activeModal, setActiveModal] = useState(null);
    const [editCourse, setEditCourse] = useState(null);

    const formModalRef = useRef(null);
    const deleteModalRef = useRef(null);

    const closeModal = useCallback(() => {
        setActiveModal(null);
        setEditCourse(null);
    }, []);

    useClickOutSide([formModalRef], closeModal);
    useClickOutSide([deleteModalRef], closeModal);

    return {
        activeModal,
        setActiveModal,
        editCourse,
        setEditCourse,
        closeModal,
        formModalRef,
        deleteModalRef,
    };
};

export default useCourseUI;
