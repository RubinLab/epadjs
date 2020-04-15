import React from "react";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { makeDeIdentifiedValue } from "../../Utils/aid";

const manualUpdateForm = ({
  requirements,
  treeData,
  seriesIndex,
  onTagInput,
  onSave,
  tagValues,
}) => {
  try {
    const { SeriesInstanceUID, missingTags, data } = treeData[seriesIndex];
    const fields = [];
    // const series = treeData[patientID].studies[studyUID].series[seriesUID];
    const patientUpdated = tagValues.PatientID || tagValues.PatientName;
    const studyUpdated =
      tagValues.StudyInstanceUID || tagValues.StudyDescription;

    requirements.forEach((el, i) => {
      const tag = el.substring(0, el.length - 2);
      const vr = el.substring(el.length - 2);
      const missing = missingTags.includes(tag);
      const value = treeData[seriesIndex][tag]
        ? treeData[seriesIndex][tag]
        : tagValues[tag]
        ? tagValues[tag]
        : makeDeIdentifiedValue(null, vr);
        console.log(value);
      //missing ? makeDeIdentifiedValue(null, vr) : data[tag];
      if (missing && !tagValues[tag]) onTagInput(null, tag, value);
      fields.push(
        <div key={`${SeriesInstanceUID}-${i}`} className="tagEditForm__el">
          <div className="--exp">{`${tag}:`}</div>
          <input
            onMouseDown={e => e.stopPropagation()}
            type="text"
            className={missing ? "--textFilled" : "--text"}
            defaultValue={value}
            name={tag}
            onChange={onTagInput}
          />
          {missing ? (
            <FaExclamationTriangle className="--warnning" />
          ) : (
            <FaCheck className="--check" />
          )}
        </div>
      );
    });
    return (
      <div className="tagEditForm-wrapper">
        <div>
          <div className="tagEditForm">{fields}</div>
          <div>
            {patientUpdated && (
              <div className="tagEditForm__el--confirmation" align="left">
                <input type="checkbox" name="applyPatient" />
                <span
                  style={{ marginLeft: "0.3rem" }}
                >{`Apply patient info to its all series`}</span>
              </div>
            )}
            {studyUpdated && (
              <div className="tagEditForm__el--confirmation" align="left">
                <input type="checkbox" name="applyStudy" />
                <span
                  style={{ marginLeft: "0.3rem" }}
                >{`Apply study info to its all series`}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.log(err);
    return (
      <div style={{ fontSize: "1.4rem", color: "#5bc0de", textAlign: "left" }}>
        Select requirements and series to edit tags
      </div>
    );
  }
};

export default manualUpdateForm;
