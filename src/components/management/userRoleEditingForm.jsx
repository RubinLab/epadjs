import React from 'react';
import { Modal } from 'react-bootstrap';
import './menuStyle.css';
import UserTable from './userTable';

const userRoleEditingForm = ({ onCancel, onSubmit, onType, error, users }) => {
  return (
    <Modal.Dialog dialogClassName="edit-userRole__modal">
      <Modal.Header>
        <Modal.Title>Modify User Roles</Modal.Title>
      </Modal.Header>
      <Modal.Body className="edit-userRole">
        <UserTable onSelect={onType} users={users} />
      </Modal.Body>
      <Modal.Footer>
        {error && (
          <div className="err-message project-edit__error">{error}</div>
        )}
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

export default userRoleEditingForm;
