import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import "../menuStyle.css";

const connectionEditingForm = ({
  onCancel,
  onSubmit,
  onType,
  error,
  connectionToEdit
}) => {
  return (
    <Modal.Dialog dialogClassName="edit-connection__modal">
      <Modal.Header>
        <Modal.Title>Edit Connection</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="edit-connection__modal--form">
          <h5 className="edit-connection__modal--label">Name</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="edit-connection__modal--input"
            name="aeTitle"
            onChange={onType}
            id="form-first-element"
            defaultValue={connectionToEdit.name}
          />
          <h5 className="edit-connection__modal--label">Host</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="edit-connection__modal--input"
            name="host"
            onChange={onType}
            defaultValue={connectionToEdit.host}
          />
          <h5 className="edit-connection__modal--label">Port</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="edit-connection__modal--input"
            name="port"
            onChange={onType}
            defaultValue={connectionToEdit.port}
          />
          {error && (
            <div className="err-message project-edit__error">{error}</div>
          )}
        </form>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <button variant="primary" onClick={onSubmit}>
          Submit
        </button>
        <button variant="secondary" onClick={onCancel}>
          Cancel
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

export default connectionEditingForm;
