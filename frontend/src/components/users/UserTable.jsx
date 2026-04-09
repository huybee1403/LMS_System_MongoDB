import UserRow from "./UserRow";

const UserTable = ({ users, currentPage, itemsPerPage, onEdit, onDelete, onDropdown, activeDropdownId, dropdownRef }) => {
    return (
        <table className="table-1">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Tài khoản</th>
                    <th>Quyền</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {users.map((item, i) => (
                    <UserRow
                        key={item._id}
                        item={item}
                        index={(currentPage - 1) * itemsPerPage + i + 1}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onDropdown={onDropdown}
                        activeDropdownId={activeDropdownId}
                        dropdownRef={dropdownRef}
                    />
                ))}
            </tbody>
        </table>
    );
};

export default UserTable;
