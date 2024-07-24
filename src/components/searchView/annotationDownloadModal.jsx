import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import {
  downloadAnnotations,
  downloadAllAnnotations
} from "../../services/annotationServices";
import { ToastContainer, toast } from "react-toastify";
import { clearSelection, storeAimSelectionAll } from "../annotationsList/action";
import { findSelectedCheckboxes, resetSelectAllCheckbox } from '../../Utils/aid.js';
import "../infoMenu/infoMenu.css";

const support = false;

class AnnnotationDownloadModal extends React.Component {
  state = { summary: false, aim: false, seg: false };

  onSelect = e => {
    const { name, checked } = e.target;
    this.setState({ [name]: checked });
  };

  onDownload = () => {
    const optionObj = this.state;
    const { pid, projectID } = this.props;
    let annsToDownload = [];
    if (Object.keys(this.props.multipageAimSelection).length > 0) {
      for (let page in this.props.multipageAimSelection) {
        const aimIDs = Object.keys(this.props.multipageAimSelection[page]);
        annsToDownload = annsToDownload.concat(aimIDs);
      }
    } else if (Object.keys(this.props.selectedAnnotations).length > 0) {
      annsToDownload = Object.keys(this.props.selectedAnnotations);
    }

    const aimList = Array.isArray(annsToDownload) ? annsToDownload : Object.keys(annsToDownload);
    // this.props.updateStatus();
    const promise =
      projectID || pid
        ? downloadAnnotations(optionObj, aimList, projectID || pid)
        : downloadAllAnnotations(optionObj, aimList);
    Promise.all([promise])
      .then(result => {
        let blob = new Blob([result[0].data], { type: "application/zip" });
        this.triggerBrowserDownload(blob, "Annotations");
        // this.props.updateStatus();
        this.props.dispatch(storeAimSelectionAll(null, null, null, true));
        this.props.dispatch(clearSelection());
        this.props.onSubmit();
      })
      .catch(err => {
        console.error(err);
        this.props.dispatch(storeAimSelectionAll(null, null, null, true));
        this.props.dispatch(clearSelection());
        if (err.response && err.response.status === 503) {
          toast.error("Select a download format!", { autoClose: false });
        }
      });
    this.props.onCancel();
  };

  triggerBrowserDownload = (blob, fileName) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    document.body.appendChild(link);
    link.style = "display: none";
    link.href = url;
    link.download = `${fileName}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  render = () => {
    let className = "alert-annDownload";
    const { aim, summary, seg } = this.state;
    className = this.props.className
      ? `${className} ${this.props.className}`
      : className;
    let disabled = !summary && !aim && !seg;
    const { show } = this.props;
    return (
      // <Modal.Dialog dialogClassName={className}>
      <Modal size="sm"
        aria-labelledby="contained-modal-title-vcenter"
        centered show={show}>
        <Modal.Header className={"modal-header"}>
          <Modal.Title id="contained-modal-title-vcenter" className="annDownload__header">
            Select Download Format
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="annDownload-container notification-modal">
          <div className="annDownload-option">
            <input
              type="checkbox"
              className="annDownload-select"
              name="summary"
              onClick={this.onSelect}
            />
            <span className="annDownload-text">Summary</span>
          </div>
          <div className="annDownload-option">
            <input
              type="checkbox"
              className="annDownload-select"
              name="aim"
              onClick={this.onSelect}
            />
            <span className="annDownload-text">AIM Document</span>
          </div>
          <div className="annDownload-option">
            <input
              type="checkbox"
              className="annDownload-select"
              name="seg"
              onClick={this.onSelect}
            />
            <span className="annDownload-text">DICOM segmentation object</span>
          </div>
          {support && (
            <>
              <div className="annDownload-option">
                <input
                  type="checkbox"
                  className="annDownload-select"
                  name="dcm-img"
                  onClick={this.onSelect}
                />
                <span className="annDownload-text">DICOM image</span>
              </div>
              <div className="annDownload-option">
                <input
                  type="checkbox"
                  className="annDownload-select"
                  name="dcmsr"
                  onClick={this.onSelect}
                />
                <span className="annDownload-text">DICOMSR</span>
              </div>
              <div className="annDownload-option">
                <input
                  type="checkbox"
                  className="annDownload-select"
                  name="jpg"
                  onClick={this.onSelect}
                />
                <span className="annDownload-text">JPG image</span>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          {disabled ? (
            <Button variant="secondary" onClick={this.onDownload} disabled>
              Submit
            </Button>
          ) : (
            <Button variant="secondary" onClick={this.onDownload}>Submit</Button>
          )}

          <Button variant="secondary" onClick={this.props.onCancel}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  };
}

AnnnotationDownloadModal.propTypes = {};

const mapStateToProps = state => {
  return {
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
    multipageAimSelection: state.annotationsListReducer.multipageAimSelection
  };
};

export default connect(mapStateToProps)(AnnnotationDownloadModal);

AnnnotationDownloadModal.propTypes = {
  selectedAnnotations: PropTypes.object,
  selected: PropTypes.object,
  // updateStatus: PropTypes.bool,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  className: PropTypes.string
};
