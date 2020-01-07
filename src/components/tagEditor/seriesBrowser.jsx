import React from "react";
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
      let description = this.clearCarets(project.description);
      options.push(
        <option value={project.id} key={project.id}>
          {description}
        </option>
      );
    }
    return options;
  };

  renderPatients = () => {
    const options = [];
    for (let patient of this.state.subjects) {
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

  renderSeries = () => {
    const options = [];
    for (let series of this.state.series) {
      let desc = series.seriesDescription
        ? series.seriesDescription
        : "Unnamed series";
      options.push(
        <option value={series.seriesUID} key={series.seriesUID}>
          {this.clearCarets(desc)}
        </option>
      );
    }
    return options;
  };

  handleInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
    if (name === "project") {
      this.getSubjects(value);
    } else if (name === "subject") {
      this.getStudies(value);
    } else if (name === "study") {
      this.getSeries(value);
    }
  };

  getSubjects = async selectedProjectID => {
    const projectID = selectedProjectID || this.state.project;
    try {
      const { data: subjects } = await getSubjects(projectID);
      const subject = subjects.length ? subjects[0].subjectID : null;
      await this.setState({ subjects, subject });
      if (subject) this.getStudies();
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
      await this.setState({ studies, study });
      if (study) this.getSeries();
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
      this.setState({ series, seriesUID });
    } catch (error) {
      let { message } = error.response.data;
      message = message ? message : error;
      toast.error(message, { autoClose: false });
    }
  };

  render = () => {
    return (
      <div className="seriesBrowser">
        <div className="seriesBrowser--group">
          <h5 className="seriesBrowser--label">Project:</h5>
          <select
            name="project"
            className="seriesBrowser--select"
            onChange={this.handleInput}
          >
            {this.renderProjects()}
          </select>
        </div>
        <div className="seriesBrowser--group">
          <h5 className="seriesBrowser--label">Patient:</h5>
          <select
            name="subject"
            className="seriesBrowser--select"
            onChange={this.handleInput}
          >
            {this.renderPatients()}
          </select>
        </div>
        <div className="seriesBrowser--group">
          <h5 className="seriesBrowser--label">Study:</h5>
          <select
            name="study"
            className="seriesBrowser--select"
            onChange={this.handleInput}
          >
            {this.renderStudies()}
          </select>
        </div>
        <div className="seriesBrowser--group">
          <h5 className="seriesBrowser--label">Series:</h5>
          <select
            name="seriesUID"
            className="seriesBrowser--select"
            onChange={this.handleInput}
          >
            {this.renderSeries()}
          </select>
        </div>
      </div>
    );
  };
}

export default SeriesBrowser;
