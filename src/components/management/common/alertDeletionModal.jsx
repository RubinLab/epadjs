import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";

const alertDeletionModal = ({ message, onCancel, onDelete, error, show }) => {
  return (
    <Modal size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Confirm Deletion
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="alert-delete__message">{message}</p>
        {error && <div className="err-message">{error}</div>}
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        {!error && (
          <button variant="primary" onClick={onDelete} id='modal-delete-button'>
            Delete
          </button>
        )}
        <button variant="secondary" onClick={onCancel}>
          Cancel
        </button>
      </Modal.Footer>
    </Modal>
  );
};

alertDeletionModal.propTypes = {
  message: PropTypes.string,
  onCancel: PropTypes.func,
  onDelete: PropTypes.func,
  error: PropTypes.string
};

export default alertDeletionModal;
