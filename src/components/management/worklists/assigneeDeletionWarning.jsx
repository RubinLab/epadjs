import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";

const assigneeDeletionWarning = props => {
  return (
    // <Modal.Dialog dialogClassName="updateAssignee__modal">
    <Modal.Dialog id="modal-fix" className="in-modal mini-modal assigneeDeletionWarning"> 
      <Modal.Body>
        <div>
          <p>Worklist is going to removed from the following assignee(s)!</p>
          <p>This can not be undone!</p>
          <div>{props.allSelected ? "All of the assigned users" : props.warningList.join(",")}</div>
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <div className="updateAssignee__modal--buttons">
          <button
            className="updateAssignee__modal--button"
            variant="secondary"
            onClick={props.onSubmit}
          >
            Submit
          </button>
          <button
            className="edit-permission__modal--button"
            variant="secondary"
            onClick={props.onCancel}
          >
            Cancel
          </button>
        </div>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

export default assigneeDeletionWarning;
