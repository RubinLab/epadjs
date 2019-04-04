import React from "react";
import "../annotationsList.css";

const dropDownMenu = ({ display, selectedStudy, changeStudy }) => {
  const optionsArr = [];
  const studiesArr = Object.values(display);
  studiesArr.forEach(study => {
    let desc = study.studyDescription.trim().replace(/\^/g, " ");
    desc = desc.length === 0 ? "Unnamed study" : desc;
    console.log(selectedStudy, study.studyUID, desc);
    optionsArr.push(
      <option key={study.studyUID} value={study.studyUID}>
        {desc}
      </option>
    );
  });

  return (
    <div className="annList-dropdown__container">
      <label>
        {optionsArr.length === 1 ? "Study: " : "Studies: "}
        <select
          className="annList-dropdown"
          value={selectedStudy}
          onChange={changeStudy}
        >
          {optionsArr}
        </select>
      </label>
    </div>
  );
};

export default dropDownMenu;
