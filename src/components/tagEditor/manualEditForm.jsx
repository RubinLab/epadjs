import React from "react";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { makeDeIdentifiedValue } from "../../Utils/aid";

const manualUpdateForm = ({
  requirements,
  treeData,
  seriesIndex,
  onTagInput
}) => {
  console.log(treeData, seriesIndex);
  const { seriesUID, missingTags, data } = treeData[seriesIndex];
  const fields = [];
  // const series = treeData[patientID].studies[studyUID].series[seriesUID];

  requirements.forEach((el, i) => {
    const tag = el.substring(0, el.length - 2);
    const vr = el.substring(el.length - 2);
    const missing = missingTags.includes(tag);
    const value = missing ? makeDeIdentifiedValue(null, vr) : data[tag];
    // if (missing) onTagInput(null, tag, value);
    fields.push(
      <div key={`${seriesUID}-${i}`} className="tagEditForm__el">
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
          <input
            onMouseDown={e => e.stopPropagation()}
            type="text"
            defaultValue={value}
            onChange={onTagInput}
            className="--text"
          />
        )}
        {missing ? (
          <FaExclamationTriangle className="--warnning" />
        ) : (
          <FaCheck className="--check" />
        )}
      </div>
    );
  });
  return <div className="tagEditForm">{fields}</div>;
};

export default manualUpdateForm;
