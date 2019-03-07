import React from 'react';
import { Modal } from 'react-bootstrap';

const alertNoSelectionModal = ({ message, onOK }) => {
  return (
    <Modal.Dialog centered="true">
      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <button variant="primary" onClick={onOK}>
          OK
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

export default alertNoSelectionModal;
