import React from 'react';
import { Modal } from 'react-bootstrap';

const alertDeletionModal = ({ message, onCancel, onDelete, error }) => {
  return (
    <Modal.Dialog dialogClassName="alert-delete__modal">
      <Modal.Body>
        <p className="alert-delete__message">{message}</p>
        {error && <div className="err-message">{error}</div>}
      </Modal.Body>
      <Modal.Footer>
        <button variant="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button variant="primary" onClick={onDelete}>
          Delete
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

export default alertDeletionModal;
