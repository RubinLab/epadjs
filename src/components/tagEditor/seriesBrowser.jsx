import React from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { getSubjects } from "../../services/subjectServices";
import { getStudies } from "../../services/studyServices";
import { getSeries } from "../../services/seriesServices";
import { getProjects } from "../../services/projectServices";

class SeriesBrowser extends React.Component {
  state = {
    projects: [],
    subjects: [],
    studies: [],
    series: [],
    project: null,
    study: null,
    subject: null
  };

  componentDidMount = async () => {
    try {
      const { data: projects } = await getProjects();
      if (projects.length) {
        this.setState({
          projects,
          project: projects[0].id
        });
        this.getSubjects();
        this.props.onChange("project", projects[0].id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  clearCarets = string => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace("^", " ");
      }
      return string;
    }
  };
  renderProjects = () => {
    const options = [];
    for (let project of this.state.projects) {
      let name = this.clearCarets(project.name);
      options.push(
        <option value={project.id} key={project.id}>
          {name}
        </option>
      );
    }
    return options;
  };

  renderPatients = () => {
    const options = [];
    for (let patient of this.state.subjects) {
      // console.log(patient);
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
      // console.log(study);
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

  renderSeries = () => {
    const options = [];
    this.state.series.forEach((series, index) => {
      // console.log(series);
      let desc = series.seriesDescription
        ? series.seriesDescription
        : "Unnamed series";
      options.push(
        <option value={series.seriesUID} key={`${series.seriesUID}-${index}`}>
          {this.clearCarets(desc)}
        </option>
      );
    });
    return options;
  };

  handleInput = e => {
    const { name, value } = e.target;
    if (name !== "series") this.setState({ [name]: value });
    if (name === "project") {
      this.getSubjects(value);
    } else if (name === "subject") {
      this.getStudies(value);
    } else if (name === "study") {
      this.getSeries(value);
    }
    this.props.onChange(name, value);
  };

  getSubjects = async selectedProjectID => {
    const projectID = selectedProjectID || this.state.project;
    try {
      const { data: subjects } = await getSubjects(projectID);
      const subject = subjects.length ? subjects[0].subjectID : null;
      if (subjects.length) this.props.onChange("subject", subject);
      await this.setState({ subjects, subject });
      if (subject) {
        this.getStudies();
      } else {
        this.setState({
          studies: [],
          study: null,
          series: [],
          seriesUID: null
        });
      }
    } catch (error) {
      let { message } = error.response.data;
      message = message ? message : error;
      toast.error(message, { autoClose: false });
    }
  };

  getStudies = async selectedSubjectID => {
    const subjectID = selectedSubjectID || this.state.subjects[0].subjectID;
    try {
      const { data: studies } = await getStudies(this.state.project, subjectID);
      const study = studies.length ? studies[0].studyUID : null;
      if (studies.length) this.props.onChange("study", study);
      await this.setState({ studies, study });
      if (study) {
        this.getSeries();
      } else {
        this.setState({ series: [], seriesUID: null });
      }
    } catch (error) {
      let { message } = error.response.data;
      message = message ? message : error;
      toast.error(message, { autoClose: false });
    }
  };

  getSeries = async selectedStudy => {
    const { project, patienID } = this.state;
    const studyUID = selectedStudy || this.state.studies[0].studyUID;
    try {
      const { data: series } = await getSeries(project, patienID, studyUID);
      const seriesUID = series.length ? series[0].seriesUID : null;
      if (series.length) this.props.onChange("series", seriesUID);
      //   if (seriesUID) {
      this.setState({ series, seriesUID });
      //   } else {
      //   }
    } catch (error) {
      let { message } = error.response.data;
      message = message ? message : error;
      toast.error(message, { autoClose: false });
    }
  };

  render = () => {
    const { error } = this.props;
    return (
      // <Modal.Dialog dialogClassName="tagRequirements_modal">
      //   <Modal.Header>
      //     <Modal.Title>Browse Series</Modal.Title>
      //   </Modal.Header>
      //   <Modal.Body>
      <div className="seriesBrowser-wrapper">
        <h5 style={{ textAlign: "left" }}>Browse series </h5>
        <div className="seriesBrowser">
          <div className="seriesBrowser--group">
            <div className="seriesBrowser--label">Project:</div>
            <select
              name="project"
              className="seriesBrowser--select"
              onChange={this.handleInput}
            >
              {this.renderProjects()}
            </select>
          </div>
          <div className="seriesBrowser--group">
            <div className="seriesBrowser--label">Patient:</div>
            <select
              name="subject"
              className="seriesBrowser--select"
              onChange={this.handleInput}
            >
              {this.renderPatients()}
            </select>
          </div>
          <div className="seriesBrowser--group">
            <div className="seriesBrowser--label">Study:</div>
            <select
              name="study"
              className="seriesBrowser--select"
              onChange={this.handleInput}
            >
              {this.renderStudies()}
            </select>
          </div>
          <div className="seriesBrowser--group">
            <div className="seriesBrowser--label">Series:</div>
            <select
              name="series"
              className="seriesBrowser--select"
              onChange={this.handleInput}
            >
              {this.renderSeries()}
            </select>
          </div>
          <input
            className="seriesBrowser-getTags"
            onClick={this.props.onGetTags}
            value="Get tags"
            type="button"
          />
          {error ? <div className="err-message">{error}</div> : null}
        </div>
      </div>
      //   </Modal.Body>
      //   <Modal.Footer className="modal-footer__buttons">
      //     <button variant="secondary" onClick={this.props.onClose}>
      //       OK
      //     </button>
      //   </Modal.Footer>
      // </Modal.Dialog>
    );
  };
}

export default SeriesBrowser;
