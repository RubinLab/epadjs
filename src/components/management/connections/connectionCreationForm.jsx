import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import "../menuStyle.css";

const connectionCreationForm = ({ onCancel, onSubmit, onType, error }) => {
  return (
    // <Modal.Dialog dialogClassName="add-connection__modal">
    <Modal.Dialog id="modal-fix">
      <Modal.Header>
        <Modal.Title>New Project</Modal.Title>
      </Modal.Header>
      <Modal.Body className="add-connection__mbody">
        <form className="add-connection__modal--form">
          <h5 className="add-connection__modal--label">Name*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-connection__modal--input"
            name="aeTitle"
            type="text"
            onChange={onType}
            placeholder="aeTitle"
          />
          <h5 className="add-connection__modal--label">Abbreviation*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-connection__modal--input"
            name="abbreviation"
            type="text"
            onChange={onType}
            placeholder="abbreviation"
          />
          <h6 className="form-exp">
            One word only, no special characters, '_' is OK
          </h6>
          <h5 className="add-connection__modal--label">Host*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-connection__modal--input"
            name="hostName"
            onChange={onType}
            type="text"
            placeholder="host name"
          />
          <h5 className="add-connection__modal--label">Port*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            name="port"
            className="add-connection__modal--input"
            onChange={onType}
            type="text"
            placeholder="port"
          />

          <h5 className="form-exp required">*Required</h5>
          {error && <div className="err-message">{error}</div>}
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

export default connectionCreationForm;
