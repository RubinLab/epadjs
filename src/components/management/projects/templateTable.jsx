import React from 'react';
import { Modal } from 'react-bootstrap';
import Table from 'react-table';

const templateTable = ({
  templateList,
  onSubmit,
  onCancel,
  onSelect,
  defaultTemplate,
  error,
  projectName,
  selectedTemp,
}) => {
  console.log(selectedTemp);
  console.log(defaultTemplate);
  const columns = [
    {
      Header: 'Project',
      width: 120,
      Cell: ({ original }) => {
        return <div>{original.Template[0].templateName}</div>;
      },
    },
    {
      Header: 'Enable',
      width: 70,
      Cell: ({ original }) => {
        const { templateCodeValue } = original.Template[0];
        const selected = selectedTemp !== null;
        console.log('selected', selected)
        const saved = defaultTemplate === templateCodeValue;
        console.log('saved', saved)
        const checked = selected ? selectedTemp === templateCodeValue : saved;
        console.log('checked', checked)

        return (
          <input
            className="templateTable-row__check"
            type="checkbox"
            name="enable"
            id={original.Template[0].templateUID}
            onClick={(e) => onSelect(e, original.Template[0].templateCodeValue)}
            defaultChecked={checked}
          />
        );
      },
    },
  ];

  return (
    <Modal.Dialog dialogClassName="templateTable-modal">
      <Modal.Header>
        <Modal.Title className="templateTable-modal__header">
          Add default template to {projectName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body id="proModal-content">
        <Table
          className="pro-edit_table"
          data={templateList}
          columns={columns}
          defaultPageSize={templateList.length}
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

export default templateTable;
