const UserRow = ({ item, index, onEdit, onDelete, onDropdown, activeDropdownId, dropdownRef }) => {
    return (
        <tr>
            <td>{index}</td>
            <td>{item.email}</td>
            <td>{item.user_type}</td>
            <td>
                <div className={`tag-${item.is_online ? "on" : "off"}`}>{item.is_online ? "Online" : "Offline"}</div>
            </td>
            <td>
                <div className={`dropdown_account ${activeDropdownId === item._id ? "active" : ""}`} ref={activeDropdownId === item._id ? dropdownRef : null}>
                    <span onClick={() => onDropdown(activeDropdownId === item._id ? null : item._id)}>
                        <i className="fa fa-ellipsis-h" />
                    </span>

                    <ul>
                        <li onClick={() => onEdit(item._id)}>
                            <i className="fa-regular fa-pen-to-square" /> Chỉnh sửa
                        </li>
                        <li onClick={() => onDelete(item._id)}>
                            <i className="fa fa-trash" /> Xoá
                        </li>
                    </ul>
                </div>
            </td>
        </tr>
    );
};

export default UserRow;
