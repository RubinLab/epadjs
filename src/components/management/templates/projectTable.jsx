import React from "react";
import { Modal } from "react-bootstrap";

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
        <td>{projectList[project]}</td>
        <td>
          <input type="checkbox" name="enable" data-id={project} />
        </td>
        <td>
          <input type="checkbox" name="default" data-id={project} />
        </td>
      </tr>
    );
    tableRows.push(row);
  }

  return (
    <Modal.Dialog dialogClassName="projectTable__modal">
      <Modal.Body>
        <table>
          <tbody>{tableRows}</tbody>
        </table>
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
