import React from "react";
import { Modal } from "react-bootstrap";

const annotationCreationForm = ({ onCancel, onSubmit, onType, error }) => {
  return (
    <Modal.Dialog dialogClassName="add-annotation__modal">
      <Modal.Header>
        <Modal.Title>New annotation</Modal.Title>
      </Modal.Header>
      <Modal.Body className="add-annotation__mbody">
        <form className="add-annotation__modal--form">
          <h5 className="add-annotation__modal--label">Name*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-annotation__modal--input"
            name="name"
            type="text"
            onChange={onType}
            id="form-first-element"
          />
          <h5 className="add-annotation__modal--label">ID*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-annotation__modal--input"
            name="id"
            type="text"
            onChange={onType}
          />
          <h6 className="form-exp">
            One word only, no special characters, '_' is OK
          </h6>
          <h5 className="add-annotation__modal--label">Description</h5>
          <textarea
            onMouseDown={e => e.stopPropagation()}
            className="add-annotation__modal--input"
            name="description"
            onChange={onType}
          />
          <h5 className="add-annotation__modal--label">Type</h5>
          <select
            name="type"
            className="add-annotation__modal--select"
            onChange={onType}
            defaultValue="Private"
          >
            <option value="Private">Private</option>
            <option value="Public">Public</option>
          </select>
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

export default annotationCreationForm;
