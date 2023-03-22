import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";

const alertDeletionModal = ({ title, message, onCancel, onDelete, error }) => {
  return (
    // <Modal.Dialog dialogClassName="alert-delete__modal">
    <Modal.Dialog id="modal-fix">
      <Modal.Body>
        <div className="-maxView__header" style={{ background: '#444' }}>
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
          <Button variant="secondary" onClick={() => { 
            onDelete(); 
            // window.dispatchEvent("refreshProjects") 
            }}>
            Delete
          </Button>
        )}
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
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
