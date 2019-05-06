import React, { Component } from "react";
import { connect } from "react-redux";
import Subjects from "./subjects";
import Toolbar from "./toolbar";
import ProjectModal from "../annotationsList/selectSerieModal";
import { downloadProjects } from "../../services/projectServices";
import { downloadSubjects } from "../../services/subjectServices";
import { downloadStudies } from "../../services/studyServices";
import { downloadSeries, getSeries } from "../../services/seriesServices";
import {
  openProjectSelectionModal,
  startLoading,
  loadCompleted,
  annotationsLoadingError
} from "../annotationsList/action";

import "./searchView.css";

class SearchView extends Component {
  constructor(props) {
    super(props);
    this.state = { seriesList: {}, isSerieSelectionOpen: false };
  }

  viewSelection = async () => {
    const selectedStudies = Object.values(this.props.selectedStudies);
    const selectedSeries = Object.values(this.props.selectedSeries);
    let selectedAnnotations = Object.values(this.props.selectedAnnotations);

    const groupedAnns = this.groupUnderSerie(selectedAnnotations);
    const serieCountOfAnns = Object.values(groupedAnns).length;
    console.log("---------grouped anns-----------");
    console.log(groupedAnns);
    //check if enough room to display selection
    if (selectedStudies.length > 0) {
      let total = 0;
      let studiesObj = {};
      for (let st of selectedStudies) {
        total += st.numberOfSeries;
      }
      //if more than 6 bring serie selection modal
      if (total + this.props.openSeries.length > 6) {
        this.props.dispatch(startLoading());
        for (let st of selectedStudies) {
          studiesObj[st.studyUID] = await this.getSeriesData(st);
        }
        await this.setState({ seriesList: studiesObj });
        this.props.dispatch(loadCompleted());
        // this.props.dispatch(openProjectSelectionModal());
        this.setState({ isSerieSelectionOpen: true });
      } else {
        //her bir studynin altindaki serieler icin single serie cagit
        //eger patient listte yoksa onu da cagir
      }
    } else if (selectedSeries.length > 0) {
      //if more than 6 bring option
      if (selectedSeries.length + this.props.openSeries.length > 6) {
        let groupedObj = this.groupUnderStudy(selectedSeries);
        await this.setState({ seriesList: groupedObj });
        // this.props.dispatch(openProjectSelectionModal());
        this.setState({ isSerieSelectionOpen: true });
      } else {
        //serieler icin single serie cagit
        //eger patient listte yoksa onu da cagir
      }
    } else if (selectedAnnotations.length > 0) {
      if (serieCountOfAnns + this.props.openSeries.length > 6) {
        console.log("passed the limit in annotations");
        console.log(groupedAnns);
        console.log(selectedAnnotations);
        let groupedObj = this.groupUnderStudy(selectedSeries);

        // await this.setState({ seriesList: groupedObj });
        // this.props.dispatch(openProjectSelectionModal());
      } else {
        //serieler icin single serie cagit
        //eger patient listte yoksa onu da cagir
      }
    }
  };

  groupUnderStudy = objArr => {
    let groupedObj = {};
    for (let serie of objArr) {
      if (groupedObj[serie.studyUID]) {
        groupedObj[serie.studyUID].push(serie);
      } else {
        groupedObj[serie.studyUID] = [serie];
      }
    }
    return groupedObj;
  };

  groupUnderSerie = objArr => {
    let groupedObj = {};
    for (let ann of objArr) {
      groupedObj[ann.seriesUID] = ann;
    }
    return groupedObj;
  };

  downloadSelection = async () => {
    const selectedProjects = Object.values(this.props.selectedProjects);
    const selectedPatients = Object.values(this.props.selectedPatients);
    const selectedStudies = Object.values(this.props.selectedStudies);
    const selectedSeries = Object.values(this.props.selectedSeries);
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
    }
  };

  getSeriesData = async selected => {
    const { projectID, patientID, studyUID } = selected;
    try {
      const {
        data: {
          ResultSet: { Result: series }
        }
      } = await getSeries(projectID, patientID, studyUID);
      // console.log("series from func");
      // console.log(series);
      return series;
    } catch (err) {
      this.props.dispatch(annotationsLoadingError(err));
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

  closeSelectionModal = () => {
    this.setState(state => ({
      isSerieSelectionOpen: !state.isSerieSelectionOpen
    }));
  };

  render() {
    return (
      <>
        <Toolbar
          onDownload={this.downloadSelection}
          onView={this.viewSelection}
        />
        {this.state.isSerieSelectionOpen && !this.props.loading && (
          <ProjectModal
            seriesPassed={this.state.seriesList}
            onCancel={this.closeSelectionModal}
          />
        )}
        <Subjects
          key={this.props.match.params.pid}
          pid={this.props.match.params.pid}
        />
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
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,

    openSeries: state.annotationsListReducer.openSeries,
    showProjectModal: state.annotationsListReducer.showProjectModal,
    loading: state.annotationsListReducer.loading
  };
};
export default connect(mapStateToProps)(SearchView);
