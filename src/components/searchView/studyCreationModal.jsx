import React from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { saveStudy } from '../../services/studyServices';

const messages = {
  fillRequredFields: 'Please fill the required fields!'
};
class StudyCreationForm extends React.Component {
  state = {
    description: '',
    abbreviation: '',
    error: '',
    study: '',
    subjects: [],
    subjectID: ''
  };

  componentDidMount = () => {
    const { selectedPatients, project } = this.props;
    const treeData = JSON.parse(localStorage.getItem('treeData'));
    const subjects = Object.values(treeData[project]).map(el => el.data);
    if (selectedPatients.length) {
      this.setState({ subjectID: selectedPatients[0].patientID, subjects });
    } else {
      this.setState({ subjectID: subjects[0].subjectID, subjects });
    }

  };
  handleSubmit = () => {
    const { description, abbreviation, subjectID } = this.state;
    if (!description || !abbreviation || !subjectID) {
      this.setState({ error: messages.fillRequredFields });
    } else {
      saveStudy(this.props.project, subjectID, abbreviation, description)
        .then(() => {
          const obj = {
            projectID: this.props.project,
            patientID: subjectID,
            studyUID: abbreviation
          };
          this.props.onSubmit();
          this.props.onCancel();
          this.props.onResolve();
          // this.props.updateTreeDataOnSave(obj, 'study');
          toast.success('Study successfully saved!');
        })
        .catch(error => {
          toast.error(error.response.data.message, { autoClose: false });
          this.props.onResolve();
          this.props.onCancel();
        });
    }
  };

  checkRequiredFilled = () => {
    const { description, abbreviation, subjectID } = this.state;
    if (description && abbreviation && subjectID) {
      return true;
    } else {
      return false;
    }
  };
  handleInput = async e => {
    await this.setState({ [e.target.name]: e.target.value });
    if (this.state.error === messages.fillRequredFields) {
      const { description, abbreviation, subjectID } = this.state;
      if (description && abbreviation && subjectID) {
        this.setState({ error: '' });
      }
    }
  };

  clearCarets = string => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace('^', ' ');
      }
      return string;
    }
  };

  renderPatients = () => {
    const options = [];
    for (let patient of this.state.subjects) {
      let patientName = this.clearCarets(patient.subjectName);
      patientName = patientName || 'Unnamed Patient';
      options.push(
        <option value={patient.subjectID} key={patient.subjectID}>
          {patientName}
        </option>
      );
    }
    return options;
  };

  render = () => {
    return (
      // <Modal.Dialog dialogClassName="add-study__modal">
      <Modal.Dialog id="modal-fix">
        <Modal.Header>
          <Modal.Title>Create a New Study</Modal.Title>
        </Modal.Header>
        <Modal.Body className="add-study__mbody">
          <form className="add-study__modal--form">
            <h5 className="add-study__modal--label">
              StudyUID / Abbreviation*
            </h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="add-study__modal--input"
              name="abbreviation"
              type="text"
              onChange={this.handleInput}
              id="form-first-element"
            />
            <h6 className="form-exp">
              One word only, no special characters, "_" is OK
            </h6>
            <h5 className="add-study__modal--label">Description*</h5>
            <textarea
              onMouseDown={e => e.stopPropagation()}
              className="add-study__modal--input"
              name="description"
              type="text"
              onChange={this.handleInput}
            />
            <h5 className="add-study__modal--label">Patient</h5>
            <select
              name="subjectID"
              className="add-study__modal--select"
              value={this.state.subjectID}
              onChange={this.handleInput}
            >
              {this.renderPatients()}
            </select>
            <h5 className="form-exp required">*Required</h5>
            {this.state.error && (
              <div className="err-message">{this.state.error}</div>
            )}
          </form>
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <button variant="primary" onClick={this.handleSubmit}>
            Submit
          </button>
          <button variant="secondary" onClick={this.props.onCancel}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

export default StudyCreationForm;
