import React from "react";
import PropTypes from "prop-types";
import "../menuStyle.css";
import AnchoredPortalModal from "../common/AnchoredPortalModal";
import UserTable from "./userTable";

const style = { minWidth: "fit-content", left: "10%" };
const userRoleEditingForm = ({ onCancel, onSubmit, onType, error, users, anchorEl }) => {
  // users = users || projects;
  const renderFooter = () => {
    return (
      <>
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
      </>
    );
  }
  return (
    <AnchoredPortalModal
      open={true}
      onClose={onCancel}
      anchorEl={anchorEl}
      placement="bottom-start"
      title="Modify User Roles"
      minWidth={260}
      backdrop={false}            // set true if you want dim behind
      showCloseButton={true}
      minusLeft={100}
      footer={renderFooter()}
      bodyClassName="user-project-table"
    > 
      <UserTable onSelect={onType} users={users} />
    </AnchoredPortalModal>
  
  );
};

userRoleEditingForm.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onType: PropTypes.func,
  error: PropTypes.string,
  users: PropTypes.string,
};

export default userRoleEditingForm;
