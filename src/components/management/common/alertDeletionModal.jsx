import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import { BarLoader } from 'react-spinners';
import '../../infoMenu/infoMenu.css';

const alertDeletionModal = ({ message, onCancel, onDelete, error, show = true, isDeleting = false }) => {
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
        {isDeleting && !error &&<BarLoader loading={true} height={8} width={200} /> }
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        {!error && (
          <Button variant="secondary" onClick={onDelete} id='modal-delete-button' disabled={isDeleting}>
            Delete
          </Button>
        )}
        <Button variant="secondary" onClick={onCancel} disabled={isDeleting && !error}>
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
