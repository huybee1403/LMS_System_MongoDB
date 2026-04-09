import { useState, useRef, useCallback } from "react";
import useClickOutSide from "./useClickOutSide";

const useUserUI = () => {
    const [activeEditModalId, setActiveEditModalId] = useState(null);
    const [activeDeleteModalId, setActiveDeleteModalId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // refs
    const dropdownRef = useRef(null);
    const editModalRef = useRef(null);
    const deleteModalRef = useRef(null);
    const createModalRef = useRef(null);

    // 🔥 close handlers
    const closeDropdown = useCallback(() => setActiveDropdown(null), []);
    const closeEditModal = useCallback(() => setActiveEditModalId(null), []);
    const closeDeleteModal = useCallback(() => setActiveDeleteModalId(null), []);
    const closeCreateModal = useCallback(() => setIsCreateModalOpen(false), []);

    // 🔥 click outside
    useClickOutSide([dropdownRef], closeDropdown);
    useClickOutSide([editModalRef], closeEditModal);
    useClickOutSide([deleteModalRef], closeDeleteModal);
    useClickOutSide([createModalRef], closeCreateModal);

    return {
        // state
        activeEditModalId,
        activeDeleteModalId,
        isCreateModalOpen,
        activeDropdown,

        // handlers
        closeDropdown,
        closeEditModal,
        closeDeleteModal,
        closeCreateModal,

        // setters
        setActiveEditModalId,
        setActiveDeleteModalId,
        setIsCreateModalOpen,
        setActiveDropdown,

        // refs
        dropdownRef,
        editModalRef,
        deleteModalRef,
        createModalRef,
    };
};

export default useUserUI;
