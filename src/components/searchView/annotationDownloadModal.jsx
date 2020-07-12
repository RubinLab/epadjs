import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { downloadAnnotations } from "../../services/annotationServices";
import { ToastContainer, toast } from "react-toastify";
import { clearSelection } from "../annotationsList/action";
const support = false;

class AnnnotationDownloadModal extends React.Component {
  state = { summary: false, aim: false, seg: false };

  onSelect = e => {
    const { name, checked } = e.target;
    this.setState({ [name]: checked });
  };

  onDownload = () => {
    const optionObj = this.state;
    const { pid } = this.props;
    const annsToDownload =
      Object.keys(this.props.selectedAnnotations).length > 0
        ? this.props.selectedAnnotations
        : this.props.selected; 
    const aimList = Object.keys(annsToDownload);
    this.props.updateStatus();
    downloadAnnotations(optionObj, aimList, pid)
      .then(result => {
        let blob = new Blob([result.data], { type: "application/zip" });
        this.triggerBrowserDownload(blob, "Annotations");
        this.props.updateStatus();
        this.props.onSubmit();
      })
      .catch(err => {
        console.log(err);
        if (err.response && err.response.status === 503) {
          toast.error("Select a download format!", { autoClose: false });
        }
      });
    this.props.dispatch(clearSelection());
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
    return (
      // <Modal.Dialog dialogClassName={className}>
      <Modal.Dialog id="modal-fix" className="modal-minwidth">
        <Modal.Header>
          <Modal.Title className="annDownload__header">
            Select Download Format
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="annDownload-container">
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
            <button onClick={this.onDownload} disabled>
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

AnnnotationDownloadModal.propTypes = {};

const mapStateToProps = state => {
  return {
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
  };
};

export default connect(mapStateToProps)(AnnnotationDownloadModal);
