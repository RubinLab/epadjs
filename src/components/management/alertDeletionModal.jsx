import React from 'react';
import { Modal } from 'react-bootstrap';

const alertDeletionModal = ({ message, onCancel, onDelete }) => {
  return (
    <Modal.Dialog centered={true}>
      <Modal.Body>
        <p>{message}</p>
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
