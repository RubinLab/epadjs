import React from "react";
import { Modal, Table } from "react-bootstrap";
import CustomTable from "./CustomTable";

const projectTable = ({ projectList, onSubmit, onCancel, error }) => {
  //get project list
  //get project tamplates
  // if templates length 1 and its id all
  // set enable all  selected = item.enable and default selected = item.default;
  // else if item.project

  const tableRows = [];
  for (let project of projectList) {
    let row = (
      <tr key={project} className="projectTable-row">
        <td className="projectTable-row__name">{project.name}</td>
        <td>
          <input
            className="projectTable-row__check"
            type="checkbox"
            name="enable"
            data-id={project.id}
          />
        </td>
        <td>
          <input
            className="projectTable-row__check"
            type="checkbox"
            name="default"
            data-id={project.id}
          />
        </td>
      </tr>
    );
    tableRows.push(row);
  }

  const renderHeaderCell = label => {
    const name = `${label}All`;
    return <div className="projectTable-header__cont">{label}</div>;
  };

  return (
    <Modal.Dialog dialogClassName="projectTable-modal">
      <Modal>
        <Modal.Body id="proModal-content">
          <CustomTable data={projectList} />
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
      </Modal>
    </Modal.Dialog>
  );
};

export default projectTable;
