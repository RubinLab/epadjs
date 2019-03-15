import React from 'react';
import { Modal } from 'react-bootstrap';
import '../menuStyle.css';

// const style = {
//   maxWidth: '40%',
//   position: 'relative',
//   margin: 'auto'
// };

const projectEditingForm = ({
  onCancel,
  onSubmit,
  onType,
  error,
  name,
  desc
}) => {
  return (
    <Modal.Dialog dialogClassName="edit-project__modal">
      <Modal.Header>
        <Modal.Title>Edit Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="edit-project__modal--form">
          <h5 className="edit-project__modal--label">Name</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="edit-project__modal--input"
            name="name"
            type="text"
            onChange={onType}
            id="form-first-element"
            placeholder={name}
          />
          <h5 className="edit-project__modal--label">Description</h5>
          <textarea
            onMouseDown={e => e.stopPropagation()}
            className="edit-project__modal--input"
            name="description"
            onChange={onType}
            placeholder={desc}
          />
          <h5 className="edit-project__modal--label">Type</h5>
          <select
            name="type"
            className="edit-project__modal--select"
            onChange={onType}
            defaultValue="Private"
          >
            <option value="Private">Private</option>
            <option value="Public">Public</option>
          </select>
          {error && (
            <div className="err-message project-edit__error">{error}</div>
          )}
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

export default projectEditingForm;
