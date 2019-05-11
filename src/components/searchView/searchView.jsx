import React, { Component } from "react";
import { connect } from "react-redux";
import Subjects from "./subjects";
import Toolbar from "./toolbar";
import { downloadProjects } from "../../services/projectServices";
import { downloadSubjects } from "../../services/subjectServices";
import { downloadStudies } from "../../services/studyServices";
import { downloadSeries } from "../../services/seriesServices";
import DownloadSelection from "./annotationDownloadModal";

import "./searchView.css";

class SearchView extends Component {
  state = { showAnnotationModal: false };

  downloadSelection = async () => {
    const selectedProjects = Object.values(this.props.selectedProjects);
    const selectedPatients = Object.values(this.props.selectedPatients);
    const selectedStudies = Object.values(this.props.selectedStudies);
    const selectedSeries = Object.values(this.props.selectedSeries);
    const selectedAnnotations = Object.values(this.props.selectedAnnotations);
    let fileName;
    if (selectedProjects.length > 0) {
      selectedProjects.forEach(project => {
        fileName = `Project - ${project.projectID}`;
        this.downLoadHelper(downloadProjects, project, fileName);
      });
    } else if (selectedPatients.length > 0) {
      selectedPatients.forEach(patient => {
        fileName = `Patients - ${patient.subjectID}`;
        this.downLoadHelper(downloadSubjects, patient, fileName);
      });
    } else if (selectedStudies.length > 0) {
      selectedStudies.forEach(study => {
        fileName = `Studies - ${study.studyUID}`;
        this.downLoadHelper(downloadStudies, study, fileName);
      });
    } else if (selectedSeries.length > 0) {
      selectedSeries.forEach(serie => {
        fileName = `Series - ${serie.seriesUID}`;
        this.downLoadHelper(downloadSeries, serie, fileName);
      });
    } else if (selectedAnnotations.length > 0) {
      this.setState({ showAnnotationModal: true });
    }
  };

  downLoadHelper = (downLoadfunction, arg, fileName) => {
    downLoadfunction(arg).then(result => {
      let blob = new Blob([result.data], { type: "application/zip" });
      this.triggerBrowserDownload(blob, fileName);
    });
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

  handleDownloadCancel = () => {
    this.setState({ showAnnotationModal: false });
  };

  render() {
    return (
      <>
        <Toolbar onDownload={this.downloadSelection} />
        <Subjects
          key={this.props.match.params.pid}
          pid={this.props.match.params.pid}
        />
        {this.state.showAnnotationModal && (
          <DownloadSelection onCancel={this.handleDownloadCancel} />
        )}
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    selectedProjects: state.annotationsListReducer.selectedProjects,
    selectedPatients: state.annotationsListReducer.selectedPatients,
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedSeries: state.annotationsListReducer.selectedSeries,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations
  };
};
export default connect(mapStateToProps)(SearchView);
