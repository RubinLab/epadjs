import React from "react";
import "../annotationsList.css";

const dropDownMenu = ({ display, changeStudy }) => {
  const optionsArr = [];
  let selectedStudy = "";
  display.studies.forEach(study => {
    let value = study.studyDescription.trim().replace(/\^/g, " ");
    value = value.length === 0 ? "Unnamed study" : value;
    if (study.studyUID === display.studyUID) {
      selectedStudy = study.studyUID;
    }
    console.log("selected", selectedStudy);
    optionsArr.push(
      <option key={study.studyUID} value={study.studyUID}>
        {value}
      </option>
    );
  });
  return (
    <div className="annList-dropdown__container">
      <label>
        {optionsArr.length === 1 ? "Study: " : "Studies: "}
        <select
          className="annList-dropdown"
          defaultValue={selectedStudy}
          onChange={changeStudy}
        >
          {optionsArr}
        </select>
      </label>
    </div>
  );
};

export default dropDownMenu;
