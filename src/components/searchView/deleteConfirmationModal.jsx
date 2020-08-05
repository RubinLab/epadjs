import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";

const alertDeletionModal = ({ title, message, onCancel, onDelete, error }) => {
  return (
    // <Modal.Dialog dialogClassName="alert-delete__modal">
    <Modal.Dialog id="modal-fix">
      <Modal.Body>
        <div className="-maxView__header">
          <div
            className="-maxView__header__text"
            style={{ color: "orangered" }}
          >
            {title}
          </div>
          <h4 className="-maxView__message--exp">{message}</h4>
        </div>
        {error && <div className="err-message">{error}</div>}
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        {!error && (
          <button variant="primary" onClick={onDelete}>
            Delete
          </button>
        )}
        <button variant="secondary" onClick={onCancel}>
          Cancel
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

alertDeletionModal.propTypes = {
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  error: PropTypes.string,
};

export default alertDeletionModal;
