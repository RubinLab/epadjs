import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { downloadAnnotations } from "../../services/annotationServices";
import { ToastContainer, toast } from "react-toastify";
import { clearSelection } from "../annotationsList/action";
class AnnnotationDownloadModal extends React.Component {
  state = { summary: false, aim: false };

  onSelect = e => {
    const { name, checked } = e.target;
    this.setState({ [name]: checked });
  };

  onDownload = () => {
    const optionObj = this.state;
    const aimList = Object.keys(this.props.selectedAnnotations);
    downloadAnnotations(optionObj, aimList)
      .then(result => {
        let blob = new Blob([result.data], { type: "application/zip" });
        this.triggerBrowserDownload(blob, "Annotations");
      })
      .catch(err => {
        if (err.response.status === 503) {
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
    let disabled = !this.state.summary && !this.state.aim;
    return (
      <Modal.Dialog dialogClassName="alert-annDownload">
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

AnnnotationDownloadModal.propTypes = {
  onOK: PropTypes.func
};

const mapStateToProps = state => {
  return {
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations
  };
};

export default connect(mapStateToProps)(AnnnotationDownloadModal);
