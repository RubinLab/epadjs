import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import { teachingFileTempCode } from "../../../constants";
import "../menuStyle.css";
import "../../infoMenu/infoMenu.css";

const projectCreationForm = ({
  onCancel,
  onSubmit,
  onType,
  error,
  templates,
}) => {
  const mode = sessionStorage.getItem('mode');
  const firstOption = (
    <option value={null} key="selectOpt">
      --Select template--
    </option>
  );
  const options = [firstOption];
  templates.forEach((el, i) => {
    const { templateCodeValue, templateUID, templateName } = el.Template[0];
    options.push(
      <option value={templateCodeValue} key={templateUID} id={templateUID}>
        {`${templateName}`}
      </option>
    );
  });

  const handleNameChange = (e) => {
    const name = e.target.value;
    const idInput = document.getElementById("projectID");
    const newId = name.replace(/[^a-z0-9_]/gi, '');
    idInput.value = newId;
    onType({ target: { name: 'id', value: newId } });
  }

  return (
    // <Modal.Dialog dialogClassName="add-project__modal">
    <Modal.Dialog id="modal-fix" className="in-modal">
      <Modal.Header className="modal-header">
        <Modal.Title style={{ margin: "0.5rem 0rem 0.5rem 1rem" }} >Create Project</Modal.Title>
      </Modal.Header>
      <Modal.Body className="notification-modal">
        <form className="add-project__modal--form">
          <label className="add-project__modal--label">Name*</label>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-project__modal--input"
            name="name"
            type="text"
            onChange={(e) => { onType(e); handleNameChange(e) }}
            id="projectName"
          />
          <label className="add-project__modal--label">ID*</label>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-project__modal--input"
            name="id"
            type="text"
            onChange={onType}
            id="projectID"
          />
          <span className="form-exp">
            One word only, no special characters, "_" is OK
          </span>
          <label className="add-project__modal--label">Description</label>
          <div style={{ marginLeft: "-1rem" }}>
            <textarea
              onMouseDown={e => e.stopPropagation()}
              className="add-project__modal--input"
              name="description"
              onChange={onType}
              id="projectDescription"

            />
          </div>
          <label className="add-project__modal--label">Default Template</label>
          <select
            name="defaulttemplate"
            className="add-project__modal--select"
            onChange={onType}
            id="projectTemplate"
            defaultValue={mode === 'teaching' ? teachingFileTempCode : null}
          >
            {options}
          </select>

          {mode !== 'teaching' && (
            <>
              <label className="add-project__modal--label">Type</label>
              <select
                name="type"
                className="add-project__modal--select"
                onChange={onType}
                defaultValue="Private"
                id="projectType"
              >
                <option value="Private" id="private">Private</option>
                <option value="Public" id="public">Public</option>
              </select>
            </>)}
          <label className="form-exp required">*Required</label>
          {error && <div className="err-message">{error}</div>}
        </form>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <Button style={{ margin: "0rem 0.2rem 0.7rem 0rem" }} variant="secondary" onClick={onSubmit} id="submit-button">
          Submit
        </Button>
        <Button style={{ margin: "0rem 1rem 0.7rem 0.2rem" }} variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal.Dialog >
  );
};

projectCreationForm.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onType: PropTypes.func,
  error: PropTypes.string,
};

export default projectCreationForm;
