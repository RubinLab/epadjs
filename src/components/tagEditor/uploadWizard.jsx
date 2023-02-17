import React from "react";
import { connect } from "react-redux";
import * as dcmjs from "dcmjs";
import { FaTimes } from "react-icons/fa";
import TagRequirements from "./tagRequirementList";
import TagEditTree from "./tagEditTable";
import TagEditor from "./tagEditor";
import { isEmpty, extractTableData } from "../../Utils/aid";
import Modal from "../management/common/customModal";
import {
  getImageIds,
  getImageArrayBuffer,
  updateTagsOfSeries,
} from "../../services/seriesServices";
import "../searchView/searchView.css";
// import "react-tabs/style/react-tabs.css";
import "./tagEditor.css";
import { clearSelection } from "../annotationsList/action";

class UploadWizard extends React.Component {
  constructor() {
    super();
    this.state = {
      x: 100,
      y: 100,
      path: null,
      showRequirements: false,
      requirements: {
        PatientIDLO: true,
        PatientNamePN: true,
        StudyInstanceUIDUI: true,
        StudyDescriptionLO: true,
        SeriesInstanceUIDUI: true,
        SeriesDescriptionLO: true,
      },
      treeData: [],
      rawData: [],
      tabIndex: 2,
      seriesIndex: 0,
      tagValues: {},
      error: "",
      applyPatient: false,
      applyStudy: false,
    };
  }

  populateErrorMessage = (name) => {
    // const patientRelated = name.startsWith("patient");
    return `In order to edit the ${name} you need to apply the change to the study as well or change the study UID`;
  };

  handleTagInput = (e, tagName, tagValue) => {
    let name, value;
    if (e) {
      name = e.target.name;
      value = e.target.value;
      if (name || value) {
        if (!value) {
          this.setState({ error: `Please fill the ${name}` });
          this.storeTagValuePair(name, value);
        } else {
          this.setState({ error: "" });
          this.storeTagValuePair(name, value);
        }
      }
    } else if (tagName && tagValue) {
      this.storeTagValuePair(tagName, tagValue);
    }
  };

  handleApplyCheckbox = e => {
    const { name, checked } = e.target;
    this.setState({ [name]: checked });
  };

  storeTagValuePair = (tagName, tagValue) => {
    const tags = { ...this.state.tagValues };
    tags[tagName] = tagValue;
    this.setState({ tagValues: tags });
  };

  handleButtonClick = async e => {
    try {
      let confirm;
      const { name } = e.target;
      let seriesIndex = this.state.seriesIndex;
      const seriesArr = Object.keys(this.props.selectedSeries);
      const newTag = this.checkNewTag();
      const { applyPatient, applyStudy, tagValues } = this.state;
      const { pid } = this.props;
      if (name === "back" && seriesIndex > 0) {
        if (newTag) {
          confirm = window.confirm("You are going to lose unsaved changes!");
          if (confirm) {
            seriesIndex -= 1;
            this.setState({ seriesIndex, tagValues: {}, error: "" });
          } else {
            return;
          }
        } else {
          seriesIndex -= 1;
          this.setState({ seriesIndex, tagValues: {} });
        }
      } else if (name === "next" && seriesIndex < seriesArr.length - 1) {
        if (newTag) {
          confirm = window.confirm("You are going to lose unsaved changes!");
          if (confirm) {
            seriesIndex += 1;
            this.setState({ seriesIndex, tagValues: {}, error: "" });
          } else {
            return;
          }
        } else {
          seriesIndex += 1;
          this.setState({ seriesIndex, tagValues: {} });
        }
      } else if (name === "save") {
        if (this.validateApplyAll()) {
          let { treeData, seriesIndex } = this.state;
          const { PatientID, SeriesInstanceUID, StudyInstanceUID } = treeData[
            seriesIndex
          ];
          await updateTagsOfSeries(
            pid,
            PatientID,
            StudyInstanceUID,
            SeriesInstanceUID,
            applyPatient,
            applyStudy,
            tagValues
          );

          this.props.onSave();
          if (seriesIndex === seriesArr.length - 1) {
            this.props.onClose();
            this.props.dispatch(clearSelection());
          } else {
            seriesIndex += 1;
            this.setState({ seriesIndex, tagValues: {}, error: "" });
          }
          this.props.updateTreeView();
        }
      } else {
        return;
      }
    } catch (err) {
      console.log(err);
    }
  };

  validateApplyAll = () => {
    const { tagValues, applyPatient, applyStudy } = this.state;
    const patientUpdated = tagValues.PatientName || tagValues.PatientID;
    const studyUIDUpdated = tagValues.StudyInstanceUID;
    const studyCompleted = studyUIDUpdated || applyStudy;
    if (patientUpdated && !studyCompleted) {
      this.setState({
        error: this.populateErrorMessage("patient info", "patient ID"),
      });
      return false;
    } else if (
      tagValues.StudyDescription &&
      !tagValues.StudyInstanceUID &&
      !applyStudy
    ) {
      this.setState({
        error: this.populateErrorMessage("study description", "studyUID"),
      });
      return false;
    } else {
      this.setState({
        error: "",
      });
      return true;
    }
  };

  checkNewTag = () => {
    let result = false;
    const { tagValues, treeData, seriesIndex } = this.state;
    for (let tag in tagValues) {
      if (treeData[seriesIndex][tag] !== tagValues[tag]) {
        result = true;
        break;
      }
    }
    return result;
  };

  componentDidMount = () => {
    let { selectedSeries } = this.props;

    selectedSeries = Object.values(selectedSeries);
    if (selectedSeries.length) {
      this.getFirstImgOfSeries(selectedSeries);
    }
  };

  handleRequirements = () => {
    this.setState(state => ({ showRequirements: !state.showRequirements }));
  };

  handleTagEditorSelect = seriesIndex => {
    this.setState({
      seriesIndex,
      tabIndex: 2,
      tagValues: {},
      applyStudy: false,
      applyPatient: false,
    });
  };

  handleReqSelect = async e => {
    const { name, checked } = e.target;
    // const { rawData, requirements } = this.state;
    if (name === "RequireAll" && checked) {
      await this.setState({
        requirements: {
          PatientIDLO: true,
          PatientNamePN: true,
          StudyInstanceUIDUI: true,
          StudyDescriptionLO: true,
          SeriesInstanceUIDUI: true,
          SeriesDescriptionLO: true,
        },
      });
    } else if (name === "RequireAll" && !checked) {
      await this.setState({ requirements: {} });
    } else {
      const newRequirements = { ...this.state.requirements };
      newRequirements[name] && !checked
        ? delete newRequirements[name]
        : (newRequirements[name] = true);
      await this.setState({ requirements: newRequirements });
    }
    const treeData = extractTableData(
      this.state.rawData,
      this.state.requirements
    );
    this.setState({ treeData });
  };

  // getDatasetsOf first images for list of series
  getFirstImgOfSeries = seriesList => {
    const promises = [];
    let rawData = [];
    for (let i = 0; i < seriesList.length; i += 1) {
      const projectUID = seriesList[i].projectID;
      const subjectUID = seriesList[i].subjectID;
      const { studyUID, seriesUID } = seriesList[i];
      promises.push(
        getImageIds({ projectUID, subjectUID, studyUID, seriesUID })
      );
    }
    Promise.all(promises)
      .then(res => {
        const imgIDPromises = [];
        res.forEach(item => {
          imgIDPromises.push(getImageArrayBuffer(item.data[0].lossyImage));
        });
        Promise.all(imgIDPromises)
          .then(buffers => {
            rawData = buffers.map(buffer => {
              return this.getDataset(buffer.data);
            });
            this.setState({ rawData });
            const treeData = extractTableData(
              this.state.rawData,
              this.state.requirements
            );
            this.setState({ treeData });
          })
          .catch();
      })
      .catch(err => {
        console.log(err);
      });
  };

  getDataset = arrayBuffer => {
    try {
      let DicomDict = dcmjs.data.DicomMessage.readFile(arrayBuffer);
      const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
        DicomDict.dict
      );
      return dataset;
    } catch (err) {
      console.log("Error in reading dicom dataset", err);
    }
  };

  updateTab = e => {
    const { name } = e.target;
    const tagUpdates = Object.values(this.state.tagValues);
    if (tagUpdates.length) {
      const confirm = window.confirm("You are going to lose unsaved changes!");
      if (!confirm) {
        return;
      }
    }

    this.setState({ tagValues: {}, applyPatient: false, applyStudy: false });

    switch (name) {
      case "requirements":
        this.setState({
          tabIndex: 0,
        });
        break;
      case "series":
        this.setState({
          tabIndex: 1,
        });
        break;
      case "tagEditor":
        this.setState({
          tabIndex: 2,
        });
        break;
      default:
        this.setState({
          tabIndex: 2,
        });
        break;
    }
  };

  render = () => {
    const {
      treeData,
      requirements,
      seriesIndex,
      tagValues,
      tabIndex,
      error,
    } = this.state;
    const { selectedSeries } = this.props;
    const requirementKeys = Object.keys(requirements);
    return (
      <Modal id="uploadWizard">
        <div className="uploadWizard">
          <div className="uploadWizard-header">
            <div className="uploadWizard-header__title">ePAD Tag Editor</div>
            <div className="menu-clickable" onClick={this.props.onClose}>
              <FaTimes />
            </div>
          </div>

          <div className="tabview">
            <div className="tabview-btnGrp">
              <div className="button-line">
                <button
                  className={
                    tabIndex === 0 ? "tabview-btn __selected" : "tabview-btn"
                  }
                  name="requirements"
                  onClick={this.updateTab}
                >
                  Define Requirements
                </button>
                {tabIndex === 0 && <div className="triangle"></div>}
              </div>
              <div className="button-line">
                <button
                  className={
                    tabIndex === 1 ? "tabview-btn __selected" : "tabview-btn"
                  }
                  name="series"
                  onClick={this.updateTab}
                >
                  Select Series
                </button>
                {tabIndex === 1 && <div className="triangle"></div>}
              </div>
              <div className="button-line">
                <button
                  className={
                    tabIndex === 2 ? "tabview-btn __selected" : "tabview-btn"
                  }
                  name="tagEditor"
                  onClick={this.updateTab}
                >
                  Edit Tags
                </button>
                {tabIndex === 2 && <div className="triangle"></div>}
              </div>
            </div>
            <div className="tabview-content">
              {tabIndex === 0 && (
                <TagRequirements
                  handleInput={this.handleReqSelect}
                  onClose={this.handleRequirements}
                  requirements={Object.keys(this.state.requirements)}
                />
              )}
              {tabIndex === 1 && !isEmpty(treeData) && (
                <TagEditTree
                  dataset={treeData}
                  onEditClick={this.handleTagEditorSelect}
                />
              )}
              {tabIndex === 2 && (
                <TagEditor
                  requirements={requirementKeys}
                  requirementsObj={requirements}
                  treeData={treeData}
                  seriesIndex={seriesIndex}
                  seriesArr={Object.keys(selectedSeries)}
                  buttonClick={this.handleButtonClick}
                  handleTagInput={this.handleTagInput}
                  tagValues={tagValues}
                  handleCheckbox={this.handleApplyCheckbox}
                  error={error}
                />
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  };
}

const mapStateToProps = state => {
  return {
    selectedSeries: state.annotationsListReducer.selectedSeries,
  };
};
export default connect(mapStateToProps)(UploadWizard);
