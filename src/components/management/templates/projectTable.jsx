import React from "react";
import { Modal } from "react-bootstrap";
import Table from "react-table";
import { FaTimes } from "react-icons/fa";

const projectTable = ({
  projectList,
  onSubmit,
  onCancel,
  onSelect,
  error,
  templateProjects = [],
  selected = {},
  templateName,
}) => {
  console.log(selected);
  const columns = [
    {
      Header: "Project",
      accessor: "name",
    },
    {
      Header: "Enable",
      width: 70,
      Cell: ({ row }) => {
        const { id } = row._original;
        const checkedIDs = Object.keys(selected);
        const checked = checkedIDs.includes(id)
          ? selected[id]
          : templateProjects.includes(id);
        return (
          <input
            className="projectTable-row__check"
            type="checkbox"
            name="enable"
            id={id}
            onClick={onSelect}
            defaultChecked={checked}
          />
        );
      },
    },
  ];

  return (
    // <Modal.Dialog dialogClassName="projectTable-modal">
    <Modal.Dialog id="modal-fix" className="in-modal">
      <Modal.Header>
        <Modal.Title className="projectTable-modal__header">
          Add {templateName} to a project
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="proModal-content">
        <Table
          className="pro-edit_table"
          data={projectList}
          columns={columns}
          defaultPageSize={projectList.length}
          showPagination={false}
        />
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
