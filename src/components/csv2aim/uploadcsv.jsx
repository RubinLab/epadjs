import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Modal, Button } from 'react-bootstrap';
import { uploadCsv }from '../../services/annotationServices';
import { getTemplates } from '../annotationsList/action';

let mode;

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

  // componentDidMount = async () => {
  //   try {
  //     const { pid } = this.props;
  //     if (mode !== 'lite') {
  //       let { data: projects } = await getProjects();
  //       for (let i = 0; i < projects.length; i++) {
  //         if (projects[i].id === 'all') {
  //           projects.splice(i, 1);
  //           i = i - 1;
  //           continue;
  //         }
  //         if (projects[i].id === 'nonassigned') {
  //           projects.splice(i, 1);
  //           i = i - 1;
  //           continue;
  //         }
  //       }

  //       const nonSelectablePid = pid === 'nonassigned' || pid === 'all';
  //       const projectID =
  //         nonSelectablePid && projects.length > 0
  //           ? projects[0].id
  //           : !nonSelectablePid
  //             ? pid
  //             : '';
  //       this.setState({ projects, projectID });
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  onSelectFile = e => {
    this.setState({ files: Array.from(e.target.files) });
  };

  onUpload = () => {
    let {
      selectedPatients,
      selectedStudies,
      selectedSeries,
      clearTreeData,
      onResolve,
      onCancel,
      onSubmit,
      clearTreeExpand
    } = this.props;
    selectedPatients = Object.values(selectedPatients);
    selectedStudies = Object.values(selectedStudies);
    selectedSeries = Object.values(selectedSeries);

    const promises = [];
    // const projectID = this.props.projectID
    //   ? this.props.projectID
    //   : this.state.projectID;
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
          // clearTreeData();
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
  selectedPatients: PropTypes.object,
  selectedSeries: PropTypes.object,
  selectedStudies: PropTypes.object,
  clearTreeExpand: PropTypes.func

};

const mapStateToProps = state => {
  return {
    selectedPatients: state.annotationsListReducer.selectedPatients,
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedSeries: state.annotationsListReducer.selectedSeries
  };
};

export default connect(mapStateToProps)(UploadCSV);
