import React from 'react';
import { Modal } from 'react-bootstrap';
import './menuStyle.css';

const projectCreationForm = ({ onCancel, onSubmit }) => {
  return (
    //TODO fix label tags to cover the form fields
    //TODO style the form
    <Modal.Dialog dialogClassName="add-project__modal" keyboard={true}>
      <Modal.Header>
        <Modal.Title>New Project</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="add-project__modal-form">
          <label className="form-label" htmlFor="name">
            Name*
            <input className="form-input" name="name" />
          </label>
          <label className="form-label" htmlFor="id">
            ID*
            <input className="form-input" name="id" />
            <p className="form-exp">
              One word only, no special characters, '_' is OK
            </p>
          </label>
          <label className="form-label" htmlFor="description">
            Description
            <textarea className="form-input" name="description" />
          </label>
          <label className="form-label" htmlFor="type">
            Type
            <select name="type">
              <option value="Private">Private</option>
              <option value="Public">Public</option>
            </select>
          </label>
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
