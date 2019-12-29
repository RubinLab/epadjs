import React from "react";
import { Modal } from "react-bootstrap";

const tagRequirements = ({ onClose, requirements, handleInput }) => {
  return (
    <Modal.Dialog dialogClassName="tagRequirements_modal">
      <Modal.Header>
        <Modal.Title>Define Required Fields</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="tagRequirements">
          <ul className="__list">
            <div className="__option">
              <input
                type="checkbox"
                className="__select __all"
                name="RequireAll"
                onChange={handleInput}
                checked={requirements.length === 6}
              />
              Select All
            </div>
            <div>
              <input
                type="checkbox"
                className="__select"
                name="PatientIDLO"
                onChange={handleInput}
                checked={requirements.includes("PatientIDLO")}
              />
              Patient ID
            </div>
            <div>
              <input
                type="checkbox"
                className="__select"
                name="PatientNamePN"
                onChange={handleInput}
                checked={requirements.includes("PatientNamePN")}
              />
              Patient Name
            </div>
            <div>
              <input
                type="checkbox"
                className="__select"
                name="StudyInstanceUIDUI"
                onChange={handleInput}
                checked={requirements.includes("StudyInstanceUIDUI")}
              />
              Study UID
            </div>
            <div>
              <input
                type="checkbox"
                className="__select"
                name="StudyDescriptionLO"
                onChange={handleInput}
                checked={requirements.includes("StudyDescriptionLO")}
              />
              Study Description
            </div>
            <div>
              <input
                type="checkbox"
                className="__select"
                name="SeriesInstanceUIDUI"
                onChange={handleInput}
                checked={requirements.includes("SeriesInstanceUIDUI")}
              />
              Series UID
            </div>
            <div>
              <input
                type="checkbox"
                className="__select"
                name="SeriesDescriptionLO"
                onChange={handleInput}
                checked={requirements.includes("SeriesDescriptionLO")}
              />
              Series Description
            </div>
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <button variant="secondary" onClick={onClose}>
          OK
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

export default tagRequirements;
