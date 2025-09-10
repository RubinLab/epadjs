import React from "react";
import PropTypes from "prop-types";
import "../menuStyle.css";
import AnchoredPortalModal from "../common/AnchoredPortalModal";
import ProjectTable from "./projectTable";

const userRoleEdit = ({
  onCancel,
  onSubmit,
  error,
  onSelect,
  projectToRole,
  anchorEl
}) => {
  const renderFooter = () => {
    return (
      <>
        {error && (
          <div className="err-message userRole-edit__error">{error}</div>
        )}
        <div className="edit-userRole__modal--buttons">
          <button
            className="edit-userRole__modal--button submit"
            variant="primary"
            onClick={onSubmit}
          >
            Submit
          </button>
          <button
            className="edit-userRole__modal--button cancel"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </>
    );
  }
  
  return (
    // <Modal.Dialog dialogClassName="edit-userRole__modal project_user">
    <AnchoredPortalModal
      open={true}
      onClose={onCancel}
      anchorEl={anchorEl}
      placement="bottom-start"
      title="Modify User Roles"
      minWidth={260}
      backdrop={false}            // set true if you want dim behind
      showCloseButton={true}
      minusLeft={200}
      footer={renderFooter()}
      bodyClassName="user-project-table"
      >
      <ProjectTable
        onSelect={onSelect}
        projectToRole={projectToRole}
      />
    </AnchoredPortalModal>
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
