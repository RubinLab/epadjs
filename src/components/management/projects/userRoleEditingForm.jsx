import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import "../menuStyle.css";
import UserTable from "./userTable";

const userRoleEditingForm = ({ onCancel, onSubmit, onType, error, users }) => {
  // users = users || projects;
  return (
    <Modal.Dialog dialogClassName="edit-userRole__modal">
      <Modal.Header>
        <Modal.Title>Modify User Roles</Modal.Title>
      </Modal.Header>
      <Modal.Body className="edit-userRole">
        <UserTable onSelect={onType} users={users} />
      </Modal.Body>
      <Modal.Footer className="edit-userRole__modal--footer">
        {error && (
          <div className="err-message userRole-edit__error">{error}</div>
        )}
        <div className="edit-userRole__modal--buttons">
          <button
            className="edit-userRole__modal--button"
            variant="primary"
            onClick={onSubmit}
          >
            Submit
          </button>
          <button
            className="edit-userRole__modal--button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

userRoleEditingForm.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onType: PropTypes.func,
  error: PropTypes.string,
  users: PropTypes.string
};

export default userRoleEditingForm;
