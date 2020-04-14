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
    const { seriesUID, missingTags, data } = treeData[seriesIndex];
    console.log(missingTags);
    const fields = [];
    // const series = treeData[patientID].studies[studyUID].series[seriesUID];
    const patientUpdated = tagValues.PatientID || tagValues.PatientName;
    const studyUpdated =
      tagValues.StudyInstanceUID || tagValues.StudyDescription;

    requirements.forEach((el, i) => {
      const tag = el.substring(0, el.length - 2);
      const vr = el.substring(el.length - 2);
      const missing = missingTags.includes(tag);
      const value = data[tag]
        ? data[tag]
        : tagValues[tag]
        ? tagValues[tag]
        : makeDeIdentifiedValue(null, vr);
      //missing ? makeDeIdentifiedValue(null, vr) : data[tag];
      if (missing && !tagValues[tag]) onTagInput(null, tag, value);
      fields.push(
        <div key={`${seriesUID}-${i}`} className="tagEditForm__el">
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
        <div align="right"  className="tagEditForm-btnGroup">
        {/* <input
          className="tagEditForm-next"
          onClick={onSave}
          value="Next series"
          type="button"
        />  */}
        <input
          className="tagEditForm-save"
          onClick={onSave}
          value="Save tags"
          type="button"
        /> </div>
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
