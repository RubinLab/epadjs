import React from "react";
import PropTypes from "prop-types";
import AnchoredPortalModal from "../common/AnchoredPortalModal";
import "../menuStyle.css";
import PermissionTable from "./permissionTable.jsx";

const userPermissionEdit = ({
  onCancel,
  onSubmit,
  error,
  onSelect,
  userPermission,
  anchorEl
}) => {
  // users = users || projects;
  const renderFooter = () => {
    return (
      <div className="edit-permission__modal--buttons">
        <button
          className="edit-permission__modal--button"
          variant="primary"
          onClick={onSubmit}
          id="user-permission-submit"
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
      </div>);
  }

  return (
    // <Modal.Dialog dialogClassName="edit-permission__modal">
    <AnchoredPortalModal
      open={true}
      onClose={onCancel}
      anchorEl={anchorEl}
      placement="bottom-start"
      title="Modify User Permission"
      minWidth={260}
      backdrop={false}            // set true if you want dim behind
      showCloseButton={true}
      minusLeft={200}
      footer={renderFooter()}
    >
      {error && (
          <div className="err-message userRole-edit__error">{error}</div>
      )}
      <PermissionTable onSelect={onSelect} userPermission={userPermission} />

    </AnchoredPortalModal>
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
