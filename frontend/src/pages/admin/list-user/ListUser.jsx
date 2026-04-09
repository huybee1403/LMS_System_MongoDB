import { useUser } from "../../../contexts/users/UserContext";
import { useAuth } from "../../../contexts/authentication/AuthContext";

import useUserFilter from "../../../hooks/useUserFilter";
import useUserUI from "../../../hooks/useUserUI";
import usePagination from "../../../hooks/usePagination";

import FilterBar from "../../../components/users/FilterBar";
import UserTable from "../../../components/users/UserTable";
import EditUserModal from "../../../components/users/EditUserModal";
import DeleteUserModal from "../../../components/users/DeleteUserModal";
import CreateUserModal from "../../../components/users/CreateUserModal";

import "./ListUser.css";
import { useEffect } from "react";

const ListUser = () => {
    const { users, fetchUsers, handleUpdateAccount, handleDeleteAccount } = useUser();
    const { handleRegister } = useAuth();

    useEffect(() => {
        fetchUsers();
    }, []);

    const filter = useUserFilter(users);
    const ui = useUserUI();

    const pagination = usePagination(users, filter.filteredUsers);

    return (
        <>
            <div className="layout-top">
                <h1 className="headline-1">Quản lý tài khoản</h1>
                <button className="c-button-1" onClick={() => ui.setIsCreateModalOpen(true)}>
                    <i className="fa-regular fa-square-plus" /> Thêm tài khoản
                </button>
            </div>
            <div className="layout-box">
                <FilterBar
                    searchEmail={filter.searchEmail}
                    setSearchEmail={filter.setSearchEmail}
                    filterRole={filter.filterRole}
                    setFilterRole={filter.setFilterRole}
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    handlePageChange={pagination.handlePageChange}
                />
            </div>
            <div className="layout-box">
                <div className="table-container">
                    <UserTable
                        users={pagination.currentItems}
                        currentPage={pagination.currentPage}
                        itemsPerPage={pagination.itemsPerPage}
                        onEdit={ui.setActiveEditModalId}
                        onDelete={ui.setActiveDeleteModalId}
                        onDropdown={ui.setActiveDropdown}
                        activeDropdownId={ui.activeDropdown}
                        dropdownRef={ui.dropdownRef}
                    />
                </div>
            </div>
            <EditUserModal
                user={users.find((u) => u._id === ui.activeEditModalId)}
                activeId={ui.activeEditModalId}
                onClose={ui.closeEditModal}
                modalRef={ui.editModalRef}
                onSubmit={(data) =>
                    handleUpdateAccount(data, () => {
                        fetchUsers();
                        ui.closeEditModal();
                    })
                }
            />
            <DeleteUserModal
                user={users.find((u) => u._id === ui.activeDeleteModalId)}
                activeId={ui.activeDeleteModalId}
                onClose={ui.closeDeleteModal}
                modalRef={ui.deleteModalRef}
                onDelete={() =>
                    handleDeleteAccount(ui.activeDeleteModalId, () => {
                        fetchUsers();
                        ui.closeDeleteModal();
                    })
                }
            />
            <CreateUserModal
                isOpen={ui.isCreateModalOpen}
                onClose={ui.closeCreateModal}
                modalRef={ui.createModalRef}
                onCreate={(data, cb) =>
                    handleRegister(data, {
                        ...cb,
                        onSuccess: () => {
                            fetchUsers();
                            ui.closeCreateModal();
                        },
                    })
                }
            />
        </>
    );
};

export default ListUser;
