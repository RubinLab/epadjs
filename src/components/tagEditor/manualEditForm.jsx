import React from "react";
import { FaCheck } from "react-icons/fa";

// all requirements passed
// missing requirements passed
// data passed

const manualUpdateForm = ({ requirements, treeData, path }) => {
  console.log(requirements, treeData, path);
  // iterate over the required fields
  // check if el in missing tags if no fill
  // the input with value and put check parl next to it
  // if missing
  const { patientID, studyUID, seriesUID } = path;
  const fields = [];
  const series = treeData[patientID].studies[studyUID].series[seriesUID];
  const { tagRequired, data } = series;
  requirements.forEach(el => {
    const missing = tagRequired.includes(el);
    fields.push(
      <div>
        <div>{`${el}:`}</div>
        {missing ? (
          <input type="text" />
        ) : (
          <input type="text" value={data.el} disabled />
        )}
        {missing ? <button /> : <FaCheck />}
      </div>
    );
  });
  return <div className="tagEdit-manual">{fields}</div>;
};

export default manualUpdateForm;
