const DeleteModal = ({ courseName, onClose, onDelete, modalRef }) => {
    return (
        <div className="modal active">
            <div className="modal_box" ref={modalRef}>
                <div className="confirm_infor">
                    <i className="fa fa-trash" />
                    <h3>Bạn chắc chắn muốn xoá lớp học{courseName ? ` "${courseName}"` : ""}?</h3>
                </div>
                <div className="confirm_button">
                    <button type="button" className="out-button" onClick={onClose}>
                        Thoát
                    </button>
                    <button type="button" className="delete-button" onClick={onDelete}>
                        Xoá
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;
