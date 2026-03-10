import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";

const AssigneeDeletionWarning = ({
  show = true,
  onCancel,
  onSubmit,
  warningList = [],
  allSelected,
}) => {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      keyboard
      backdrop
      className="assigneeWarning"                 // root modal element
      dialogClassName="mini-modal"               // your size/style class
      backdropClassName="assigneeWarning__bd"    // custom backdrop class
      enforceFocus
      restoreFocus={false}
    >
      <Modal.Body style={{"background": "#444"}}>
        <div>
          <p>{`Worklist is going to be removed from ${
            allSelected ? "all of the assigned users!" : "the following assignee(s)!"
          }`}</p>
          <p>This cannot be undone!</p>
          <div>{Array.isArray(warningList) ? warningList.join(", ") : ""}</div>
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons" style={{"background": "#343A40"}}>
        <div className="updateAssignee__modal--buttons">
          <button className="updateAssignee__modal--button" type="button" onClick={onSubmit}>
            Submit
          </button>
          <button className="edit-permission__modal--button" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

AssigneeDeletionWarning.propTypes = {
  show: PropTypes.bool,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  warningList: PropTypes.array,
  allSelected: PropTypes.bool,
};

export default AssigneeDeletionWarning;
