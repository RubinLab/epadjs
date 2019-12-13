import React from "react";
import { FaTimes } from "react-icons/fa";

const tagRequirements = ({ onClose, requirements, handleInput }) => {
  return (
    <div className="tagRequirements">
      <div className="__header">
        <div className="__title">Define Requirements</div>
        <div className="menu-clickable" onClick={onClose}>
          <FaTimes />
        </div>
      </div>
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
  );
};

export default tagRequirements;
