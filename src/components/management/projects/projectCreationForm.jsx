import React from 'react';
import { Modal } from 'react-bootstrap';
import '../menuStyle.css';

const projectCreationForm = ({ onCancel, onSubmit, onType, error }) => {
  return (
    <Modal.Dialog dialogClassName="add-project__modal">
      <Modal.Header>
        <Modal.Title>New Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="add-project__modal--form">
          <h5 className="add-project__modal--label">Name*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-project__modal--input"
            name="name"
            type="text"
            onChange={onType}
            id="form-first-element"
          />
          <h5 className="add-project__modal--label">ID*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-project__modal--input"
            name="id"
            type="text"
            onChange={onType}
          />
          <h6 className="form-exp">
            One word only, no special characters, '_' is OK
          </h6>
          <h5 className="add-project__modal--label">Description</h5>
          <textarea
            onMouseDown={e => e.stopPropagation()}
            className="add-project__modal--input"
            name="description"
            onChange={onType}
          />
          <h5 className="add-project__modal--label">Type</h5>
          <select
            name="type"
            className="add-project__modal--select"
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
      <Modal.Footer>
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

export default projectCreationForm;
