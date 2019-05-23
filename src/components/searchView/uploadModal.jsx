import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { isLite } from "./../../config.json";
import { ToastContainer, toast } from "react-toastify";
import { getProjects } from "../../services/projectServices";

class UploadModal extends React.Component {
  state = { tiff: false, osirix: false, projects: [] };

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
      console.log(projects);
    }
  };

  render = () => {
    let disabled = !this.state.summary && !this.state.aim;
    const options = [];
    for (let pr of this.state.projects) {
      options.push(
        <option key={pr.id} data-id={pr.id}>
          {pr.name}
        </option>
      );
    }

    return (
      <Modal.Dialog dialogClassName="alert-upload">
        <Modal.Header>
          <Modal.Title className="upload__header">Upload</Modal.Title>
        </Modal.Header>
        <Modal.Body className="upload-container">
          {!isLite && (
            <div className="upload-select__container">
              <label>
                Projects:
                <select className="upload-select">{options}</select>
              </label>
            </div>
          )}
          <div className="upload-file">
            <span>Select file: </span>
            <input
              type="file"
              className="upload-display"
              // name="tiff"
              //   onClick={this.onSelect}
            />
          </div>
          <div className="upload-option">
            <input
              type="checkbox"
              className="upload-select"
              name="tiff"
              onClick={this.onSelect}
            />
            <span className="upload-text">Import Tiff files</span>
          </div>
          <div className="upload-option">
            <input
              type="checkbox"
              className="upload-select"
              name="osirix"
              onClick={this.onSelect}
            />
            <span className="upload-text">Import from Osirix</span>
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          {disabled ? (
            <button onClick={this.onUpload} disabled>
              Submit
            </button>
          ) : (
            <button onClick={this.onDownload}>Submit</button>
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
