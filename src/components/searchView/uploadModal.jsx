import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { isLite } from "./../../config.json";
import { ToastContainer, toast } from "react-toastify";
import { getProjects, uploadFile } from "../../services/projectServices";
import { getCurrentUser } from "../../services/authService";

class UploadModal extends React.Component {
  state = {
    tiff: false,
    osirix: false,
    projects: [],
    files: []
  };

  onSelect = e => {
    const { name, checked } = e.target;
    this.setState({ [name]: checked });
  };

  componentDidMount = async () => {
    if (!isLite) {
      const {
        data: {
          ResultSet: { Result: projects }
        }
      } = await getProjects();
      this.setState({ projects });
    }
  };

  onSelectFile = e => {
    this.setState({ files: Array.from(e.target.files) });
  };

  onUpload = () => {
    const projectID = this.props.projectID;
    const userName = getCurrentUser();
    const formData = new FormData();

    this.state.files.forEach(file => {
      formData.append("file", file);
    });
    const config = {
      headers: {
        "content-type": "multipart/form-data"
      }
    };

    this.props.onSubmit();
    uploadFile(formData, config, projectID, userName)
      .then(() => {
        this.props.onSubmit();
      })
      .catch(err => {
        const fileName = this.state.file.name.substring(0, 50);
        toast.error(
          `Error occured while uploading ${fileName}${
            this.state.file.name.length > 50 ? "..." : "!"
          }`,
          {
            autoClose: false
          }
        );
        this.props.onSubmit();
      });
    this.props.onCancel();
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
  render = () => {
    console.log(this.state);
    console.log(Array.isArray(this.state.files));
    let disabled = this.state.files.length === 0;
    let className = "alert-upload";
    className = this.props.className
      ? `${className} ${this.props.className}`
      : className;
    const options = [];
    for (let pr of this.state.projects) {
      options.push(
        <option key={pr.id} data-id={pr.id}>
          {pr.name}
        </option>
      );
    }
    return (
      <Modal.Dialog dialogClassName={className}>
        <Modal.Header>
          <Modal.Title className="upload__header">Upload</Modal.Title>
        </Modal.Header>
        <Modal.Body className="upload-container">
          {!isLite && (
            <div className="upload-select__container">
              <span>Projects: </span>
              <select className="upload-select">{options}</select>
            </div>
          )}
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
          {!isLite && (
            <div className="uploadDetails-container">
              <h6 className="upload-note">
                *Please note that if you upload a project that you downloaded
                from ePad, the project will not be recreated.
              </h6>
              <div className="upload-options">
                <div className="upload-option">
                  <input
                    type="checkbox"
                    className="upload-select"
                    name="tiff"
                    onClick={this.onSelect}
                  />
                  <span className="upload-text">Import Tiff files</span>
                </div>
                {this.state.tiff && this.renderTiffForm()}
                <div className="upload-option">
                  <input
                    type="checkbox"
                    className="upload-select"
                    name="osirix"
                    onClick={this.onSelect}
                  />
                  <span className="upload-text">Import from Osirix</span>
                </div>
              </div>
            </div>
          )}
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
  onCancel: PropTypes.func
};

const mapStateToProps = state => {
  return {
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations
  };
};

export default connect(mapStateToProps)(UploadModal);
