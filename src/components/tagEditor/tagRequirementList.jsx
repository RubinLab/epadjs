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
            name="PatientID"
            onChange={handleInput}
            checked={requirements.includes("PatientID")}
          />
          Patient ID
        </div>
        <div>
          <input
            type="checkbox"
            className="__select"
            name="PatientName"
            onChange={handleInput}
            checked={requirements.includes("PatientName")}
          />
          Patient Name
        </div>
        <div>
          <input
            type="checkbox"
            className="__select"
            name="StudyInstanceUID"
            onChange={handleInput}
            checked={requirements.includes("StudyInstanceUID")}
          />
          Study UID
        </div>
        <div>
          <input
            type="checkbox"
            className="__select"
            name="StudyDescription"
            onChange={handleInput}
            checked={requirements.includes("StudyDescription")}
          />
          Study Description
        </div>
        <div>
          <input
            type="checkbox"
            className="__select"
            name="SeriesInstanceUID"
            onChange={handleInput}
            checked={requirements.includes("SeriesInstanceUID")}
          />
          Series UID
        </div>
        <div>
          <input
            type="checkbox"
            className="__select"
            name="SeriesDescription"
            onChange={handleInput}
            checked={requirements.includes("SeriesDescription")}
          />
          Series Description
        </div>
      </ul>
    </div>
  );
};

export default tagRequirements;
