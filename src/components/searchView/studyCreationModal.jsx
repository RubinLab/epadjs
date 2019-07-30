import React from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { getSubjects } from "../../services/subjectServices";

class StudyCreationForm extends React.Component {
  state = {
    description: "",
    abbreviation: "",
    error: "",
    study: "",
    subjects: []
  };

  handleSubmit = () => {
    const { description, abbreviation, patient } = this.state;
    if (!description || !abbreviation || !patient) {
      this.setState({ error: "Please fill the required fields!" });
    } else {
    }
  };

  handleInput = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleCancel = () => {
    this.setState({
      description: "",
      patient: "",
      abbreviation: "",
      error: ""
    });
    this.props.onCancel();
  };

  clearCarets = string => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace("^", " ");
      }
      return string;
    }
  };

  renderPatients = () => {
    const options = [];
    for (let patient of this.props.subjects) {
      options.push(
        <option value={patient.subjectID} key={patient.subjectID}>
          {this.clearCarets(patient.subjectName)}
        </option>
      );
    }
    return options;
  };

  render = () => {
    return (
      <Modal.Dialog dialogClassName="add-study__modal">
        <Modal.Header>
          <Modal.Title>Create a New Study</Modal.Title>
        </Modal.Header>
        <Modal.Body className="add-study__mbody">
          <form className="add-study__modal--form">
            <h5 className="add-study__modal--label">Abbreviation*</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="add-study__modal--input"
              name="abbreviation"
              type="text"
              onChange={this.handleInput}
              id="form-first-element"
            />
            <h6 className="form-exp">
              One word only, no special characters, '_' is OK
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
              name="patient"
              className="add-study__modal--select"
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
          <button variant="secondary" onClick={this.handleCancel}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

export default StudyCreationForm;
