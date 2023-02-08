import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import '../../infoMenu/infoMenu.css';

const alertDeletionModal = ({ message, onCancel, onDelete, error, show = true }) => {
  return (
    <Modal id="modal-fix" size="lg"
      show={show} onHide={onCancel}>
      <Modal.Header className="modal-header">
        <Modal.Title className="modal-title">
          Confirm Deletion
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="notification-modal">
        <p className="alert-delete__message">{message}</p>
        {error && <div className="err-message">{error}</div>}
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        {!error && (
          <Button variant="secondary" onClick={onDelete} id='modal-delete-button'>
            Delete
          </Button>
        )}
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
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
