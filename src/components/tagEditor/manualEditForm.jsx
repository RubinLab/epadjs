import React from "react";
import _ from "lodash";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { makeDeIdentifiedValue } from "../../Utils/aid";

class ManualEditForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fields: [],
    };
  }

  componentDidMount = () => {
    this.renderFields();
  };

  componentDidUpdate = prevProps => {
    const { tagValues, treeData, seriesIndex } = this.props;
    const treeDataChanged = !_.isEqual(treeData, prevProps.treeData);
    const tagValuesChanged = !_.isEqual(tagValues, prevProps.tagValues);
    const seriesChanged = seriesIndex !== prevProps.seriesIndex;
    if (tagValuesChanged || treeDataChanged || seriesChanged) {
      this.renderFields();
    }
  };

  renderFields = () => {
    try {
      const {
        requirements,
        treeData,
        seriesIndex,
        onTagInput,
        tagValues,
        disabled,
      } = this.props;

      if (treeData[seriesIndex]) {
        const { SeriesInstanceUID, missingTags, data } = treeData[seriesIndex];
        const fields = [];
        requirements.forEach((el, i) => {
          const tag = el.substring(0, el.length - 2);
          const vr = el.substring(el.length - 2);
          const missing = missingTags.includes(tag);
          const tagKeys = Object.keys(tagValues);
          const value = tagKeys.includes(tag)
            ? tagValues[tag]
            : treeData[seriesIndex][tag]
            ? treeData[seriesIndex][tag]
            : makeDeIdentifiedValue(null, vr);
          if (missing && !tagValues[tag]) onTagInput(null, tag, value);
          fields.push(
            <div key={`${SeriesInstanceUID}-${i}`} className="tagEditForm__el">
              <div className="--exp">{`${tag}:`}</div>
              <input
                onMouseDown={e => e.stopPropagation()}
                type="text"
                className={
                  missing || tagValues[tag] ? "--textFilled" : "--text"
                }
                value={value}
                name={tag}
                onChange={e => onTagInput(e)}
                // disabled={disabled}
              />
              {missing ? (
                <FaExclamationTriangle className="--warnning" />
              ) : (
                <FaCheck className="--check" />
              )}
            </div>
          );
        });
        this.setState({ fields });
      }
    } catch (err) {
      console.log(err);
    }
  };
  render = () => {
    const { handleCheckbox, tagValues } = this.props;
    const patientUpdated = tagValues.PatientID || tagValues.PatientName;
    const studyUpdated =
      tagValues.StudyInstanceUID || tagValues.StudyDescription;
    return (
      <div className="tagEditForm-wrapper">
        <div>
          <div className="tagEditForm">{this.state.fields}</div>
          <div>
            {patientUpdated && (
              <div className="tagEditForm__el--confirmation" align="left">
                <input
                  type="checkbox"
                  name="applyPatient"
                  onChange={handleCheckbox}
                />
                <span
                  style={{ marginLeft: "0.3rem" }}
                >{`Apply patient info to its all series`}</span>
              </div>
            )}
            {studyUpdated && (
              <div className="tagEditForm__el--confirmation" align="left">
                <input
                  type="checkbox"
                  name="applyStudy"
                  onChange={handleCheckbox}
                />
                <span
                  style={{ marginLeft: "0.3rem" }}
                >{`Apply study info to its all series`}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
    // } catch (err) {
    //   console.log(err);
    //   return (
    //     <div style={{ fontSize: "1.4rem", color: "#5bc0de", textAlign: "left" }}>
    //       Select requirements and series to edit tags
    //     </div>
    //   );
    // }
  };
}

export default ManualEditForm;
