import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { uploadCsv }from '../../services/annotationServices';
import { getTemplates } from '../annotationsList/action';

class UploadCSV extends React.Component {
  mode = sessionStorage.getItem('mode');
  state = {
    tiff: false,
    osirix: false,
    projects: [],
    files: [],
    projectID: ''
  };

  onSelect = e => {
    const { name, checked } = e.target;
    this.setState({ [name]: checked });
  };

  onSelectFile = e => {
    this.setState({ files: Array.from(e.target.files) });
  };

  onUpload = () => {
    let {
      clearTreeData,
      onResolve,
      onCancel,
      onSubmit,
      clearTreeExpand
    } = this.props;

    const promises = [];
    const formData = new FormData();
    this.state.files.forEach((file, index) => {
      formData.append(`file${index + 1}`, file);
    });
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    };

    if (onSubmit) onSubmit();
    promises.push(uploadCsv(formData, config))

    Promise.all(promises)
      .then(() => {
        if (clearTreeData) {
          localStorage.setItem('treeData', JSON.stringify({}));
          clearTreeExpand();
        }
        this.props.dispatch(getTemplates());
        if (onResolve) onResolve();
      })
      .catch(err => {
        console.error(err);
        if (onResolve) onResolve();
      });
    onCancel();
    this.setState({ projectID: '' });
  };

  selectProject = e => {
    this.setState({ projectID: e.target.value });
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

  render = () => {
    let disabled = this.state.files.length === 0;
    let className = 'alert-upload';
    className = this.props.className
      ? `${className} ${this.props.className}`
      : className;
    const { projects } = this.state;
    return (
      <Modal.Dialog id="modal-fix">
        <Modal.Header className="modal-header">
          <Modal.Title>Upload CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body className="notification-modal">
          {this.renderUploadFileButton()}
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <Button variant="secondary" onClick={this.onUpload} disabled={disabled}>
            Submit
          </Button>
          <Button variant="secondary" onClick={this.props.onCancel}>Cancel</Button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

UploadCSV.propTypes = {
  onCancel: PropTypes.func.isRequired,
  clearTreeData: PropTypes.func,
  onResolve: PropTypes.func,
  onSubmit: PropTypes.func,
  pid: PropTypes.string,
  clearTreeExpand: PropTypes.func

};

export default UploadCSV;
