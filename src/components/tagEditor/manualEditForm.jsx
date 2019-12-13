import React from "react";
import { FaCheck } from "react-icons/fa";
import { makeDeIdentifiedValue } from "../../Utils/aid";

const manualUpdateForm = ({ requirements, treeData, path, onTagInput }) => {
  const { patientID, studyUID, seriesUID } = path;
  const fields = [];
  const series = treeData[patientID].studies[studyUID].series[seriesUID];
  const { tagRequired, data } = series;
  requirements.forEach((el, i) => {
    const tag = el.substring(0, el.length - 2);
    const vr = el.substring(el.length - 2);
    const missing = tagRequired.includes(tag);
    const value = missing ? makeDeIdentifiedValue(null, vr) : data[tag];
    if (missing) onTagInput(null, tag, value);
    fields.push(
      <div key={`${series.seriesUID}-${i}`} className="tagEditForm__el">
        <div className="--exp">{`${tag}:`}</div>
        {missing ? (
          <input
            onMouseDown={e => e.stopPropagation()}
            type="text"
            className="--textFilled"
            defaultValue={value}
            name={tag}
            onChange={onTagInput}
          />
        ) : (
          <input type="text" value={value} disabled className="--text" />
        )}
        {missing ? null : <FaCheck className="--check" />}
      </div>
    );
  });
  return <div className="tagEditForm">{fields}</div>;
};

export default manualUpdateForm;
