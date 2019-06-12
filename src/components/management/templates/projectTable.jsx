import React from "react";
import { Modal, Table } from "react-bootstrap";

const projectTable = ({ projectList, onSubmit, onCancel, error }) => {
  //get project list
  //get project tamplates
  // if templates length 1 and its id all
  // set enable all  selected = item.enable and default selected = item.default;
  // else if item.project
  console.log("intable", projectList);
  const tableRows = [];
  for (let project in projectList) {
    let row = (
      <tr key={project} className="projectTable-row">
        <td className="projectTable-row__name">{projectList[project]}</td>
        <td>
          <input
            className="projectTable-row__check"
            type="checkbox"
            name="enable"
            data-id={project}
          />
        </td>
        <td>
          <input
            className="projectTable-row__check"
            type="checkbox"
            name="default"
            data-id={project}
          />
        </td>
      </tr>
    );
    tableRows.push(row);
  }

  const renderHeaderCell = label => {
    const name = `${label}All`;
    return (
      <div className="projectTable-header__cont">
        <input
          className="projectTable-header__check"
          type="checkbox"
          name={name}
        />
        <div>{label}</div>
      </div>
    );
  };

  return (
    <Modal.Dialog dialogClassName="projectTable-modal">
      {/* <Modal> */}
      <Modal.Body id="proModal-content">
        <Table className="projectTable" responsive="sm">
          <thead className="projectTable-header">
            <tr>
              <th>Project</th>
              <th>{renderHeaderCell("Enable")}</th>
              <th>{renderHeaderCell("Default")}</th>
            </tr>
          </thead>
          <tbody striped="true">{tableRows}</tbody>
        </Table>
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
      {/* </Modal> */}
    </Modal.Dialog>
  );
};

export default projectTable;
