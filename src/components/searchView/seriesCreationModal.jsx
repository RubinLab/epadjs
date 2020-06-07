import React from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { getStudies } from "../../services/studyServices";
import { saveSeries } from "../../services/seriesServices";

class SeriesCreationForm extends React.Component {
  state = {
    description: "",
    abbreviation: "",
    error: "",
    subjects: [],
    studies: [],
  };

  componentDidMount = async () => {
    const { selectedPatients, selectedStudies } = this.props;
    if (selectedPatients.length) {
      this.setState({ subjectID: selectedPatients[0].patientID });
      this.getStudies(selectedPatients[0].patientID);
    } else if (selectedStudies.length) {
      this.setState({
        subjectID: selectedStudies[0].patientID,
        study: selectedStudies[0].studyUID,
      });
      this.getStudies(
        selectedStudies[0].patientID,
        selectedStudies[0].studyUID
      );
    } else {
      this.setState({ subjectID: this.props.subjects[0].subjectID });
    }
  };

  handleSubmit = () => {
    const { description, abbreviation, subjectID, study } = this.state;
    if (!description || !abbreviation || !subjectID || !study) {
      this.setState({ error: "Please fill the required fields!" });
    } else {
      saveSeries(
        this.props.project,
        subjectID,
        study,
        abbreviation,
        description
      )
        .then(() => {
          const obj = {
            projectID: this.props.project,
            patientID: subjectID,
            studyUID: study,
            seriesUID: abbreviation,
          };
          this.props.onSubmit();
          this.props.onCancel();
          this.props.onResolve();
          this.props.updateTreeDataOnSave(obj, "series");
          toast.success("Series successfully saved!");
        })
        .catch(error => {
          toast.error(error.response.data.message, { autoClose: false });
          this.props.onResolve();
          this.props.onSubmit();
        });
    }
  };

  getStudies = async (selectedSubjectID, stuid) => {
    let studies = [];
    const subjectID = selectedSubjectID || this.props.subjects[0].subjectID;
    try {
      const { data: studies } = await getStudies(this.props.project, subjectID);
      // studies = result.data.ResultSet.Result;
      const study = stuid
        ? stuid
        : studies.length > 0
        ? studies[0].studyUID
        : null;
      this.setState({ studies, study });
    } catch (error) {
      let { message } = error.response.data;
      message = message ? message : error;
      toast.error(message, { autoClose: false });
    }
  };

  handleInput = e => {
    this.setState({ [e.target.name]: e.target.value });
    if (e.target.name === "subjectID") {
      this.getStudies(e.target.value);
    }
  };

  handleCancel = () => {
    this.setState({
      description: "",
      patient: "",
      abbreviation: "",
      study: "",
      error: "",
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
      let patientName = this.clearCarets(patient.subjectName);
      patientName = patientName || "Unnamed Patient";
      options.push(
        <option value={patient.subjectID} key={patient.subjectID}>
          {patientName}
        </option>
      );
    }
    return options;
  };

  renderStudies = () => {
    const options = [];
    for (let study of this.state.studies) {
      let desc = study.studyDescription
        ? study.studyDescription
        : "Unnamed Study";
      options.push(
        <option value={study.studyUID} key={study.studyUID}>
          {this.clearCarets(desc)}
        </option>
      );
    }
    return options;
  };

  render = () => {
    return (
      <Modal.Dialog dialogClassName="add-series__modal">
        <Modal.Header>
          <Modal.Title>Create a New Series</Modal.Title>
        </Modal.Header>
        <Modal.Body className="add-series__mbody">
          <form className="add-series__modal--form">
            <h5 className="add-series__modal--label">
              SeriesUID / Abbreviation*
            </h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="add-series__modal--input"
              name="abbreviation"
              type="text"
              onChange={this.handleInput}
              id="form-first-element"
            />
            <h6 className="form-exp">
              One word only, no special characters, "_" is OK
            </h6>
            <h5 className="add-series__modal--label">Description*</h5>
            <textarea
              onMouseDown={e => e.stopPropagation()}
              className="add-series__modal--input"
              name="description"
              type="text"
              onChange={this.handleInput}
            />
            <h5 className="add-series__modal--label">Patient</h5>
            <select
              name="subjectID"
              className="add-series__modal--select"
              value={this.state.subjectID}
              onChange={this.handleInput}
            >
              {this.renderPatients()}
            </select>
            <h5 className="add-series__modal--label">Study</h5>
            <select
              name="study"
              className="add-series__modal--select"
              value={this.state.study}
              onChange={this.handleInput}
            >
              {this.renderStudies()}
            </select>
            <h5 className="form-exp required">*Required</h5>
            {this.state.error && (
              <div className="err-message">{this.state.error}</div>
            )}
          </form>
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          {this.state.studies.length > 0 ? (
            <button variant="primary" onClick={this.handleSubmit}>
              Submit
            </button>
          ) : (
            <button variant="primary" onClick={this.handleSubmit} disabled>
              Submit
            </button>
          )}
          <button variant="secondary" onClick={this.handleCancel}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}
export default SeriesCreationForm;
