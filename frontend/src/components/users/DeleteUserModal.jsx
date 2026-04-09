const DeleteUserModal = ({ user, userId, onClose, onDelete, modalRef, activeId }) => {
    if (!user || !activeId) return null;

    return (
        <div className="modal active">
            <div className="modal_box" ref={modalRef}>
                <div className="confirm_infor">
                    <i className="fa fa-trash" />
                    <h3>Bạn chắc chắn muốn xóa người dùng này?</h3>
                </div>
                <div className="confirm_button">
                    <button className="out-button" onClick={onClose}>
                        Thoát
                    </button>
                    <button className="delete-button" onClick={() => onDelete(userId)}>
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteUserModal;
