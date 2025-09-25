import React from "react";
import AnchoredPortalModal from "../common/AnchoredPortalModal";
import Table from "react-table-v6";

const projectTable = ({
  projectList,
  onSubmit,
  onCancel,
  onSelect,
  error,
  templateProjects = [],
  selected = {},
  templateName,
  anchorEl
}) => {
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
            style={{marginLeft: "2rem"}}
          />
        );
      },
    },
  ];

  const renderFooter = () => {
    return (
      <>
         {!error && (
          <button variant="primary" onClick={onSubmit}>
            Submit
          </button>
        )}
        <button variant="secondary" onClick={onCancel}>
          Cancel
        </button>
      </>
    );
  }

  return (
    // <Modal.Dialog dialogClassName="projectTable-modal">
    <AnchoredPortalModal
      open={true}
      onClose={onCancel}
      anchorEl={anchorEl}
      placement="bottom-start"
      title={`Add ${templateName} to a project`}
      minWidth={260}
      backdrop={false}            // set true if you want dim behind
      showCloseButton={true}
      minusLeft={120}
      footer={renderFooter()}
    >
      <Table
        className="pro-edit_table"
        data={projectList}
        columns={columns}
        defaultPageSize={projectList.length}
        showPagination={false}
      />
      {error && <div>{error}</div>}
    </AnchoredPortalModal>
  );
};

export default projectTable;
