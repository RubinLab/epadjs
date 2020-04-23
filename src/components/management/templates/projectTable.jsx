import React from "react";
import { Modal, Table } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";
import CustomTable from "./CustomTable";

const projectTable = ({ projectList, onSubmit, onCancel, error }) => {
  //get project list
  //get project tamplates
  // if templates length 1 and its id all
  // set enable all  selected = item.enable and default selected = item.default;
  // else if item.project

  return (
    <Modal.Dialog dialogClassName="projectTable-modal">
      <Modal.Header>
        <Modal.Title className="projectTable-modal__header">
          Add template to a project
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="proModal-content">
        <CustomTable data={projectList} />
        {error && <div>{error}</div>}
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        {!error && (
          <button variant="primary" onClick={onSubmit}>
            Submit
          </button>
        )}
        <button variant="secondary" onClick={onCancel}>
          Cancel
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

export default projectTable;
