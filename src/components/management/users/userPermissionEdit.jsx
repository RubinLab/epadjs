import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import "../menuStyle.css";
import PermissionTable from "./permissionTable.jsx";

const userPermissionEdit = ({
  onCancel,
  onSubmit,
  error,
  onSelect,
  userPermission
}) => {
  // users = users || projects;
  return (
    // <Modal.Dialog dialogClassName="edit-permission__modal">
    <Modal.Dialog id="modal-fix">
      <Modal.Header>
        <Modal.Title>Modify User Permissions</Modal.Title>
      </Modal.Header>
      <Modal.Body className="edit-userRole project_user">
        <PermissionTable onSelect={onSelect} userPermission={userPermission} />
      </Modal.Body>
      <Modal.Footer className="edit-permission__modal--footer">
        {error && (
          <div className="err-message userRole-edit__error">{error}</div>
        )}
        <div className="edit-permission__modal--buttons">
          <button
            className="edit-permission__modal--button"
            variant="primary"
            onClick={onSubmit}
          >
            Submit
          </button>
          <button
            className="edit-permission__modal--button"
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

userPermissionEdit.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  error: PropTypes.string,
  onSelect: PropTypes.func,
  userPermission: PropTypes.array
};

export default userPermissionEdit;
