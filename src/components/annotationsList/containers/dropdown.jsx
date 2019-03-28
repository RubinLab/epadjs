import React from "react";
import "../annotationsList.css";

const dropDownMenu = props => {
  console.log("dropdown props", props);
  const optionsArr = [];
  props.display.studies.forEach(study => {
    let value = study.studyDescription.trim().replace(/\^/g, " ");
    value = value.length === 0 ? "Unnamed study" : value;
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
        <select className="annList-dropdown">{optionsArr}</select>
      </label>
    </div>
  );
};

export default dropDownMenu;
