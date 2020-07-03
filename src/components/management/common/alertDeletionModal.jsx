import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";

const alertDeletionModal = ({ message, onCancel, onDelete, error }) => {
  return (
    // <Modal.Dialog dialogClassName="alert-delete__modal">
    <Modal.Dialog id="modal-fix">
      <Modal.Body>
        <p className="alert-delete__message">{message}</p>
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
  message: PropTypes.string,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  error: PropTypes.string
};

export default alertDeletionModal;
