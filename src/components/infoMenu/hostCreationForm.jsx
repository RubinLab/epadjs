import React from "react";
import { Modal } from "react-bootstrap";

const hostCreationForm = ({ onCancel, onSubmit, onType, error }) => {
  console.log(error);
  return (
    <Modal.Dialog dialogClassName="add-host__modal">
      <Modal.Header>
        <Modal.Title>Create a New Host</Modal.Title>
      </Modal.Header>
      <Modal.Body className="add-host__mbody">
        <form className="add-host__modal--form">
          <h5 className="add-host__modal--label">Name*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-host__modal--input"
            name="name"
            type="text"
            onChange={onType}
            placeholder="host name"
          />
          <h5 className="add-host__modal--label">Abbreviation*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-host__modal--input"
            name="abbreviation"
            type="text"
            onChange={onType}
            placeholder="abbreviation"
          />
          <h6 className="form-exp">
            One word only, no special characters, '_' is OK
          </h6>
          <h5 className="add-host__modal--label">Port*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            name="port"
            className="add-host__modal--input"
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

export default hostCreationForm;
