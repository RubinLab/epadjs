import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import "../menuStyle.css";

const projectCreationForm = ({
  onCancel,
  onSubmit,
  onType,
  error,
  templates,
}) => {
  const firstOption = (
    <option value={null} key="selectOpt">
      --Select template--
    </option>
  );
  const options = [firstOption];
  templates.forEach((el, i) => {
    const { templateCodeValue, templateUID } = el.Template[0];
    options.push(
      <option value={templateCodeValue} key={templateUID}>
        {templateCodeValue}
      </option>
    );
  });
  return (
    // <Modal.Dialog dialogClassName="add-project__modal">
    <Modal.Dialog id="modal-fix" className="in-modal">
      <Modal.Header>
        <Modal.Title>New Project</Modal.Title>
      </Modal.Header>
      <Modal.Body className="add-project__mbody">
        <form className="add-project__modal--form">
          <h5 className="add-project__modal--label">Name*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-project__modal--input"
            name="name"
            type="text"
            onChange={onType}
            id="form-first-element"
          />
          <h5 className="add-project__modal--label">ID*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-project__modal--input"
            name="id"
            type="text"
            onChange={onType}
          />
          <h6 className="form-exp">
            One word only, no special characters, "_" is OK
          </h6>
          <h5 className="add-project__modal--label">Description</h5>
          <textarea
            onMouseDown={e => e.stopPropagation()}
            className="add-project__modal--input"
            name="description"
            onChange={onType}
          />
          <h5 className="add-project__modal--label">Default Template</h5>
          <select
            name="defaulttemplate"
            className="add-project__modal--select"
            onChange={onType}
          >
            {options}
          </select>
          <h5 className="add-project__modal--label">Type</h5>
          <select
            name="type"
            className="add-project__modal--select"
            onChange={onType}
            defaultValue="Private"
          >
            <option value="Private">Private</option>
            <option value="Public">Public</option>
          </select>
          <h5 className="form-exp required">*Required</h5>
          {error && <div className="err-message">{error}</div>}
        </form>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <button variant="primary" onClick={onSubmit}>
          Submit
        </button>
        <button variant="secondary" onClick={onCancel}>
          Cancel
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

projectCreationForm.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onType: PropTypes.func,
  error: PropTypes.string,
};

export default projectCreationForm;
