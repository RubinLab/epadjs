import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import "../menuStyle.css";
import ProjectTable from "./projectTable";

const userRoleEdit = ({
  onCancel,
  onSubmit,
  error,
  onSelect,
  projectToRole,
}) => {
  return (
    <Modal.Dialog dialogClassName="edit-userRole__modal project_user">
      <Modal.Header>
        <Modal.Title>Modify User Roles</Modal.Title>
      </Modal.Header>
      <Modal.Body className="edit-userRole project_user">
        <ProjectTable
          onSelect={onSelect}
          projectToRole={projectToRole}
        />
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

userRoleEdit.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onType: PropTypes.func,
  error: PropTypes.string,
  users: PropTypes.string
};

export default userRoleEdit;
