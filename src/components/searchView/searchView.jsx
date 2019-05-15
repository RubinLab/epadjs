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
  startLoading,
  loadCompleted,
  annotationsLoadingError,
  addToGrid,
  getSingleSerie,
  getWholeData,
  alertViewPortFull,
  updatePatient
} from "../annotationsList/action";
import { MAX_PORT } from "../../constants";
import "./searchView.css";
import DownloadSelection from "./annotationDownloadModal";
import Header from "./header";
class SearchView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seriesList: {},
      isSerieSelectionOpen: false,
      showAnnotationModal: false
    };
  }

  viewSelection = async () => {
    if (this.props.openSeries.length === MAX_PORT) {
      this.props.dispatch(alertViewPortFull());
    } else {
      const selectedStudies = Object.values(this.props.selectedStudies);
      const selectedSeries = Object.values(this.props.selectedSeries);
      let selectedAnnotations = Object.values(this.props.selectedAnnotations);
      const groupedAnns = this.groupUnderSerie(selectedAnnotations);
      let patientList;
      let groupedObj;
      //if studies selected
      if (selectedStudies.length > 0) {
        let total = 0;
        let studiesObj = {};
        patientList = this.groupUnderPatient(selectedStudies);
        for (let st of selectedStudies) {
          total += st.numberOfSeries;
        }
        for (let st of selectedStudies) {
          studiesObj[st.studyUID] = await this.getSeriesData(st);
        }
        //check if enough room to display selection
        if (total + this.props.openSeries.length > MAX_PORT) {
          this.props.dispatch(startLoading());
          this.setState({ seriesList: studiesObj });
          this.props.dispatch(loadCompleted());
          this.setState({ isSerieSelectionOpen: true });
        } else {
          for (let study in studiesObj) {
            for (let serie of studiesObj[study]) {
              this.props.dispatch(addToGrid(serie));
              this.props.dispatch(getSingleSerie(serie));
            }
          }
          for (let study in studiesObj) {
            for (let serie of studiesObj[study]) {
              if (!this.props.patients[serie.patientID]) {
                await this.props.dispatch(getWholeData(serie));
              } else {
                this.props.dispatch(
                  updatePatient(
                    "serie",
                    true,
                    serie.patientID,
                    serie.studyUID,
                    serie.seriesUID
                  )
                );
              }
            }
          }
        }
        //if series selected
      } else if (selectedSeries.length > 0) {
        patientList = this.groupUnderPatient(selectedSeries);
        //check if enough room to display selection
        if (selectedSeries.length + this.props.openSeries.length > MAX_PORT) {
          groupedObj = this.groupUnderStudy(selectedSeries);
          await this.setState({ seriesList: groupedObj });
          this.setState({ isSerieSelectionOpen: true });
        } else {
          //else get data for each serie for display
          selectedSeries.forEach(serie => {
            this.props.dispatch(addToGrid(serie));
            this.props.dispatch(getSingleSerie(serie));
          });
          // selectedSeries.forEach(serie => {
          //   this.props.dispatch(getSingleSerie(serie));
          // });
          for (let series of selectedSeries) {
            if (!this.props.patients[series.patientID]) {
              await this.props.dispatch(getWholeData(series));
            } else {
              this.props.dispatch(
                updatePatient(
                  "serie",
                  true,
                  series.patientID,
                  series.studyUID,
                  series.seriesUID
                )
              );
            }
          }
        }
        //if annptations selected
      } else if (selectedAnnotations.length > 0) {
        let serieList = Object.values(groupedAnns);
        groupedObj = this.groupUnderStudy(serieList);
        patientList = this.groupUnderPatient(selectedAnnotations);
        //check if enough room to display selection
        if (serieList.length + this.props.openSeries.length > MAX_PORT) {
          await this.setState({ seriesList: groupedObj });
          this.setState({ isSerieSelectionOpen: true });
          //else get data for each serie for display
        } else {
          serieList.forEach(serie => {
            this.props.dispatch(addToGrid(serie, serie.aimID));
            this.props.dispatch(getSingleSerie(serie, serie.aimID));
          });
          // serieList.forEach(serie => {
          //   this.props.dispatch(getSingleSerie(serie, serie.aimID));
          // });
          for (let ann of selectedAnnotations) {
            if (!this.props.patients[ann.subjectID]) {
              await this.props.dispatch(getWholeData(null, null, ann));
            } else {
              this.props.dispatch(
                updatePatient(
                  "annotation",
                  true,
                  ann.subjectID,
                  ann.studyUID,
                  ann.seriesUID,
                  ann.aimID
                )
              );
            }
          }
        }
      }
    }
  };
  groupUnderPatient = objArr => {
    let groupedObj = {};
    for (let item of objArr) {
      groupedObj[item.patientID] = item;
    }
    return groupedObj;
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

  handleDownloadCancel = () => {
    this.setState({ showAnnotationModal: false });
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
        {/* <Header /> */}
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
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
    patients: state.annotationsListReducer.patients,
    openSeries: state.annotationsListReducer.openSeries,
    showProjectModal: state.annotationsListReducer.showProjectModal,
    loading: state.annotationsListReducer.loading
  };
};
export default connect(mapStateToProps)(SearchView);
