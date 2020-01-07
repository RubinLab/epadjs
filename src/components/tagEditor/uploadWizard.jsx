import React from "react";
import { connect } from "react-redux";
import * as dcmjs from "dcmjs";
import { FaTimes } from "react-icons/fa";
import TagRequirements from "./tagRequirementList";
import TagEditTree from "./tagEditTree";
import "../searchView/searchView.css";
import TagEditor from "./tagEditor";
import { isEmpty, extractTreeData } from "../../Utils/aid";
import Modal from "../management/common/customModal";
import {
  getImageIds,
  getImageArrayBuffer
} from "../../services/seriesServices";

const style = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "solid 1px #ddd",
  //   width: "fit-content",
  height: "fit-content"
};

class UploadWizard extends React.Component {
  constructor() {
    super();
    this.state = {
      x: 100,
      y: 100,
      path: null,
      showRequirements: false,
      requirements: {},
      treeData: null,
      rawData: null,
      showTagEditor: false
    };
  }

  componentDidMount = () => {
    let {
      selectedPatients,
      selectedProjects,
      selectedStudies,
      selectedSeries
    } = this.props;
    selectedPatients = Object.values(selectedPatients);
    selectedProjects = Object.values(selectedProjects);
    selectedStudies = Object.values(selectedStudies);
    selectedSeries = Object.values(selectedSeries);
    if (selectedSeries.length) {
      this.getFirstImgOfSeries(selectedSeries);
    }
  };

  handleRequirements = () => {
    this.setState(state => ({ showRequirements: !state.showRequirements }));
  };

  handleTagEditorSelect = (patientID, studyUID, seriesUID) => {
    this.setState(state => ({ showTagEditor: !state.showTagEditor }));
    this.setState({ pathToSeries: { patientID, studyUID, seriesUID } });
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
          SeriesDescriptionLO: true
        }
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
    // console.log(requirements);
    const treeData = extractTreeData(
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

  render = () => {
    const { treeData, requirements } = this.state;
    const requirementKeys = Object.keys(requirements);
    return (
      <Modal>
        <div className="uploadWizard">
          <div className="uploadWizard-header">
            <div className="uploadWizard-header__title">ePAD Upload Wizard</div>
            <div className="menu-clickable" onClick={this.props.onClose}>
              <FaTimes />
            </div>
          </div>
          <input
            className="uploadWizard-define"
            onClick={this.handleRequirements}
            value="Define Requirements"
            type="button"
          />
          {/* Define Requirements
          </button> */}
          {this.state.showRequirements && (
            <TagRequirements
              handleInput={this.handleReqSelect}
              onClose={this.handleRequirements}
              requirements={Object.keys(this.state.requirements)}
            />
          )}
          {!isEmpty(treeData) && (
            <TagEditTree
              dataset={treeData}
              onEditClick={this.handleTagEditorSelect}
            />
          )}
          {this.state.showTagEditor && (
            <TagEditor
              requirements={requirementKeys}
              treeData={treeData}
              path={this.state.pathToSeries}
            />
          )}
        </div>
      </Modal>
    );
  };
}

const mapStateToProps = state => {
  return {
    selectedProjects: state.annotationsListReducer.selectedProjects,
    selectedPatients: state.annotationsListReducer.selectedPatients,
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedSeries: state.annotationsListReducer.selectedSeries
  };
};
export default connect(mapStateToProps)(UploadWizard);
