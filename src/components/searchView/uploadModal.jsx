import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import {
  getProjects,
  uploadFileToProject,
} from "../../services/projectServices";
import { uploadFileToSubject } from "../../services/subjectServices";
import { uploadFileToStudy } from "../../services/studyServices";
import { uploadFileToSeries } from "../../services/seriesServices";

const mode = sessionStorage.getItem("mode");

class UploadModal extends React.Component {
  state = {
    tiff: false,
    osirix: false,
    projects: [],
    files: [],
    projectID: "",
  };

  onSelect = e => {
    const { name, checked } = e.target;
    this.setState({ [name]: checked });
  };

  componentDidMount = async () => {
    try {
      const { pid } = this.props;
      if (mode !== "lite") {
        let { data: projects } = await getProjects();
        for (let i = 0; i < projects.length; i++) {
          if (projects[i].id === "all") {
            projects.splice(i, 1);
            i = i - 1;
            continue;
          }
          if (projects[i].id === "nonassigned") {
            projects.splice(i, 1);
            i = i - 1;
            continue;
          }
        }
        projects.length > 0
          ? this.setState({ projects, projectID: pid })
          : this.setState({ projects });
      }
    } catch (err) {
      console.log(err);
    }
  };

  onSelectFile = e => {
    this.setState({ files: Array.from(e.target.files) });
  };

  onUpload = () => {
    let { selectedPatients, selectedStudies, selectedSeries } = this.props;
    selectedPatients = Object.values(selectedPatients);
    selectedStudies = Object.values(selectedStudies);
    selectedSeries = Object.values(selectedSeries);

    const promises = [];
    const projectID = this.props.projectID
      ? this.props.projectID
      : this.state.projectID;
    const formData = new FormData();
    this.state.files.forEach((file, index) => {
      formData.append(`file${index + 1}`, file);
    });
    const config = {
      headers: {
        "content-type": "multipart/form-data",
      },
    };

    this.props.onSubmit();
    if (selectedPatients.length > 0) {
      selectedPatients.forEach(el =>
        promises.push(uploadFileToSubject(formData, config, el))
      );
    } else if (selectedStudies.length > 0) {
      selectedStudies.forEach(el =>
        promises.push(uploadFileToStudy(formData, config, el))
      );
    } else if (selectedSeries.length > 0) {
      selectedSeries.forEach(el =>
        promises.push(uploadFileToSeries(formData, config, el))
      );
    } else {
      promises.push(uploadFileToProject(formData, config, projectID));
    }

    Promise.all(promises)
      .then(() => {
        this.props.onSubmit();
        this.props.clearTreeData();
      })
      .catch(err => {
        console.log(err);
        this.props.onSubmit();
      });
    this.props.onCancel();
    this.setState({ projectID: "" });
  };

  selectProject = e => {
    this.setState({ projectID: e.target.value });
  };

  renderTiffForm = () => {
    return (
      <div>
        <h6 className="upload-note">
          Please upload one series at a time. Tiff files will be placed in the
          series in alphabetical order of the file names. Fill in information to
          use while creating dicoms, all fields are required.
        </h6>
        <div className="tiffForm-item">
          <span className="tiffForm-label">Subject ID*</span>
          <input
            className="tiff-text"
            name="subjectID"
            type="text"
            // onSelectFile={onType}
          />
        </div>
        <div className="tiffForm-item">
          <span className="tiffForm-label">Subject Name* </span>
          <input
            className="tiff-text"
            name="subjectName"
            type="text"
            // onSelectFile={onType}
          />
        </div>
        <div className="tiffForm-item">
          <span className="tiffForm-label">Subject Description* </span>
          <input
            className="tiff-text"
            name="subjectDesc"
            type="text"
            // onSelectFile={onType}
          />
        </div>
        <div className="tiffForm-item">
          <span className="tiffForm-label">Series Description* </span>
          <input
            className="tiff-text"
            name="serieDesc"
            type="text"
            // onSelectFile={onType}
          />
        </div>
        <h6 className="upload-required">*Required</h6>
      </div>
    );
  };

  renderProjectDropdown = () => {
    const options = [];
    const { projects } = this.state;
    const { projectID } = this.state;
    for (let pr of projects) {
      options.push(
        <option key={pr.id} value={pr.id}>
          {pr.name}
        </option>
      );
    }
    return (
      <div className="upload-select__container">
        <span>Projects: </span>
        <select
          className="upload-select"
          onChange={e => this.selectProject(e)}
          value={projectID}
        >
          {options}
        </select>
      </div>
    );
  };

  renderUploadFileButton = () => {
    return (
      <div className="upload-file">
        <span className="tiffForm-label__select">Select file: </span>
        <input
          type="file"
          className="upload-display"
          multiple={true}
          // name="tiff"
          onChange={this.onSelectFile}
        />
      </div>
    );
  };
  renderThickModalFields = () => {
    return this.state.projects.length ? (
      <div className="uploadDetails-container">
        <h6 className="upload-note">
          *Please note that if you upload a project that you downloaded from
          ePad, the project will not be recreated.
        </h6>
      </div>
    ) : (
      <div> Please create a project before uploading! </div>
    );
  };

  render = () => {
    let disabled = this.state.files.length === 0;
    let className = "alert-upload";
    className = this.props.className
      ? `${className} ${this.props.className}`
      : className;
    const { projects } = this.state;
    return (
      // <Modal.Dialog dialogClassName={className}>
      <Modal.Dialog id="modal-fix">
        <Modal.Header>
          <Modal.Title className="upload__header">Upload</Modal.Title>
        </Modal.Header>
        <Modal.Body className="upload-container">
          {mode === "lite" && this.renderUploadFileButton()}
          {mode !== "lite" &&
            (projects.length > 0 ? (
              <>
                {this.renderProjectDropdown()}
                {this.renderUploadFileButton()}
                {this.renderThickModalFields()}
              </>
            ) : (
              <div style={{ color: "orangered", fontSize: "1.4rem" }}>
                Please create a project before uploading!
              </div>
            ))}
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          {disabled ? (
            <button onClick={this.onUpload} disabled>
              Submit
            </button>
          ) : (
            <button onClick={this.onUpload}>Submit</button>
          )}

          <button onClick={this.props.onCancel}>Cancel</button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

UploadModal.propTypes = {
  onCancel: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    selectedPatients: state.annotationsListReducer.selectedPatients,
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedSeries: state.annotationsListReducer.selectedSeries,
  };
};

export default connect(mapStateToProps)(UploadModal);
