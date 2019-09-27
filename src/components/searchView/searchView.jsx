import React, { Component } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import Subjects from "./subjects";
import Toolbar from "./toolbar";
import ProjectModal from "../annotationsList/selectSerieModal";
import { downloadProjects } from "../../services/projectServices";
import {
  downloadSubjects,
  deleteSubject
} from "../../services/subjectServices";
import { downloadStudies, deleteStudy } from "../../services/studyServices";
import { deleteAnnotation } from "../../services/annotationServices";
import {
  downloadSeries,
  getSeries,
  deleteSeries
} from "../../services/seriesServices";
import {
  startLoading,
  loadCompleted,
  annotationsLoadingError,
  addToGrid,
  getSingleSerie,
  getWholeData,
  alertViewPortFull,
  updatePatient,
  clearSelection,
  changeActivePort,
  jumpToAim,
  showAnnotationDock
} from "../annotationsList/action";
import { MAX_PORT } from "../../constants";
import DownloadSelection from "./annotationDownloadModal";
import "./searchView.css";
import UploadModal from "./uploadModal";
import { isLite } from "../../config";
import { getSubjects } from "../../services/subjectServices";
import DeleteAlert from "./deleteConfirmationModal";
import DownloadWarning from "./downloadWarningModal";
import NewMenu from "./newMenu";
import SubjectCreationModal from "./subjectCreationModal.jsx";
import StudyCreationModal from "./studyCreationModal.jsx";
import SeriesCreationModal from "./seriesCreationModal.jsx";
import AnnotationCreationModal from "./annotationCreationModal.jsx";

class SearchView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seriesList: {},
      isSerieSelectionOpen: false,
      showAnnotationModal: false,
      showUploadFileModal: false,
      downloading: false,
      uploading: false,
      error: false,
      showUploadModal: false,
      numOfsubjects: 0,
      showDeleteAlert: false,
      update: 0,
      missingAnns: [],
      expandLevel: 0,
      expanded: {},
      showNew: false
    };
  }

  updateDownloadStatus = () => {
    this.setState(state => ({ downloading: !state.downloading }));
  };

  componentDidMount = async () => {
    if (this.props.dockOpen) {
      this.props.dispatch(showAnnotationDock());
    }
    const subjects = await this.getData();
    this.setState({ numOfsubjects: subjects.length, subjects });
  };

  componentDidUpdate = async prevProps => {
    if (prevProps.match.params.pid !== this.props.match.params.pid) {
      const subjects = await this.getData();
      this.setState({ numOfsubjects: subjects.length, subjects });
    }
  };

  getData = async () => {
    if (this.props.match.params.pid) {
      const {
        data: {
          ResultSet: { Result: data }
        }
      } = await getSubjects(this.props.match.params.pid);
      return data;
    } else {
      return [];
    }
  };

  handleExpand = async () => {
    if (this.state.expandLevel < 3) {
      this.setState(state => ({ expandLevel: state.expandLevel + 1 }));
    }
    let expanded = {};
    for (let i = 0; i < this.state.numOfsubjects; i++) {
      expanded[i] = true;
    }
    this.setState({ expanded });
  };

  handleShrink = async () => {
    if (this.state.expandLevel > 0) {
      await this.setState(state => ({ expandLevel: state.expandLevel - 1 }));
      if (this.state.expandLevel === 0) {
        this.setState({ expanded: {} });
      }
    }
  };

  handleCloseAll = () => {
    this.setState({ expandLevel: 0 });
  };
  updateUploadStatus = async => {
    this.setState(state => {
      return { uploading: !state.uploading, update: state.update + 1 };
    });
    this.updateSubjectCount();
    //update patients after upload
    // filter the patients from openSeries with the first index they appear
    const patients = this.props.openSeries.reduce((all, item, index) => {
      if (!all[item.patientID]) {
        all[item.patientID] = index;
      }
      return all;
    }, {});
    // pass it to getwholedata
    const promiseArr = [];
    for (let patient in patients) {
      promiseArr.push(
        this.props.dispatch(
          getWholeData(this.props.openSeries[patients[patient]])
        )
      );
    }
    Promise.all(promiseArr)
      .then(() => {
        //keep the current state
        for (let serie in this.props.openSeries) {
          let type = serie.aimID ? "annotation" : "serie";
          this.props.dispatch(
            updatePatient(
              type,
              true,
              serie.patientID,
              serie.studyUID,
              serie.seriesUID
            )
          );
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  updateSubjectCount = async () => {
    const subjects = await this.getData();
    await this.setState({ numOfsubjects: subjects.length, subjects });
  };

  deleteStudy = async () => {
    const studiesArr = Object.values(this.props.selectedStudies);
    this.handleClickDeleteIcon();
    for (let study of studiesArr) {
      const series = await this.getSeriesData(study);

      if (series.length > 0) {
        this.setState({ deleting: true });
        deleteSeries(series[0]).then(() => {
          this.updateSubjectCount();
          this.setState({ deleting: false });
          this.props.dispatch(clearSelection());
        });
      }
    }
  };

  deleteSelectionWrapper = async (arr, func) => {
    this.handleClickDeleteIcon();
    const promiseArr = [];
    this.setState({ deleting: true });
    arr.forEach(item => {
      promiseArr.push(func(item));
    });
    Promise.all(promiseArr)
      .then(async () => {
        const subjects = await this.getData();
        this.setState({ deleting: false, numOfsubjects: subjects.length });
        this.setState(state => ({ update: state.update + 1 }));
        this.props.dispatch(clearSelection());
      })
      .catch(err => {
        console.log(err);
      });
  };

  deleteSelection = () => {
    const selectedPatients = Object.values(this.props.selectedPatients);
    const selectedStudies = Object.values(this.props.selectedStudies);
    const selectedSeries = Object.values(this.props.selectedSeries);
    const selectedAnnotations = Object.values(this.props.selectedAnnotations);

    if (selectedPatients.length > 0) {
      this.deleteSelectionWrapper(selectedPatients, deleteSubject);
    } else if (selectedStudies.length > 0) {
      this.deleteSelectionWrapper(selectedStudies, deleteStudy);
    } else if (selectedSeries.length > 0) {
      this.deleteSelectionWrapper(selectedSeries, deleteSeries);
    } else if (selectedAnnotations.length > 0) {
      this.deleteSelectionWrapper(selectedAnnotations, deleteAnnotation);
    }
  };

  updateError = error => {
    this.setState({ error, loading: false });
  };

  checkIfSerieOpen = selectedSerie => {
    let isOpen = false;
    let index;
    this.props.openSeries.forEach((serie, i) => {
      if (serie.seriesUID === selectedSerie) {
        isOpen = true;
        index = i;
      }
    });
    return { isOpen, index };
  };

  groupOpenSeriesByStudy = () => {
    let result = {};
    this.props.openSeries.reduce((all, item, index) => {
      all[item.studyUID]
        ? (all[item.studyUID] = all[item.studyUID] + 1)
        : (all[item.studyUID] = 1);
      return all;
    }, result);
    return result;
  };

  viewSelection = async () => {
    let selectedStudies = Object.values(this.props.selectedStudies);
    let selectedSeries = Object.values(this.props.selectedSeries);
    let selectedAnnotations = Object.values(this.props.selectedAnnotations);
    const groupedAnns = this.groupUnderSerie(selectedAnnotations);
    let groupedObj;
    let notOpenSeries = [];
    //if studies selected
    if (selectedStudies.length > 0) {
      let total = 0;
      let studiesObj = {};

      if (this.props.openSeries.length === MAX_PORT) {
        if (selectedStudies.length === 1) {
          let numOfSer = Object.values(this.groupOpenSeriesByStudy());
          if (selectedStudies[0].numberOfSeries === numOfSer[0]) {
            return;
          } else {
            this.props.dispatch(alertViewPortFull());
          }
        } else {
          this.props.dispatch(alertViewPortFull());
        }
      } else {
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
          this.props.history.push("/display");
          this.props.dispatch(clearSelection());
        }
      }
      //if series selected
    } else if (selectedSeries.length > 0) {
      //check if enough room to display selection
      for (let serie of selectedSeries) {
        if (!this.checkIfSerieOpen(serie.seriesUID).isOpen) {
          notOpenSeries.push(serie);
        }
      }
      //if all ports are full
      if (
        notOpenSeries.length > 0 &&
        this.props.openSeries.length === MAX_PORT
      ) {
        this.props.dispatch(alertViewPortFull());
      } else {
        //if all series already open update active port
        if (notOpenSeries.length === 0) {
          let index = this.checkIfSerieOpen(selectedSeries[0].seriesUID).index;
          this.props.dispatch(changeActivePort(index));
          this.props.history.push("/display");
          this.props.dispatch(clearSelection());
        } else {
          if (selectedSeries.length + this.props.openSeries.length > MAX_PORT) {
            groupedObj = this.groupUnderStudy(selectedSeries);
            await this.setState({ seriesList: groupedObj });
            this.setState({ isSerieSelectionOpen: true });
            // this.props.history.push("/display");
          } else {
            //else get data for each serie for display
            selectedSeries.forEach(serie => {
              this.props.dispatch(addToGrid(serie));
              this.props.dispatch(getSingleSerie(serie));
            });
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
            this.props.history.push("/display");
            this.props.dispatch(clearSelection());
          }
        }
      }
      //if annotations selected
    } else if (selectedAnnotations.length > 0) {
      let serieList = Object.values(groupedAnns);
      groupedObj = this.groupUnderStudy(serieList);
      //check if enough room to display selection
      for (let serie of serieList) {
        if (!this.checkIfSerieOpen(serie.seriesUID).isOpen) {
          notOpenSeries.push(serie);
        }
      }
      if (
        notOpenSeries.length > 0 &&
        this.props.openSeries.length === MAX_PORT
      ) {
        this.props.dispatch(alertViewPortFull());
      } else {
        if (notOpenSeries.length === 0) {
          const serID = serieList[0].seriesUID;
          let index = this.checkIfSerieOpen(serID).index;
          this.props.dispatch(changeActivePort(index));
          this.props.dispatch(jumpToAim(serID, serieList[0].aimID, index));
        } else {
          if (notOpenSeries.length + this.props.openSeries.length > MAX_PORT) {
            await this.setState({ seriesList: groupedObj });
            this.setState({ isSerieSelectionOpen: true });
            //else get data for each serie for display
          } else {
            serieList.forEach(serie => {
              this.props.dispatch(addToGrid(serie, serie.aimID));
              this.props.dispatch(getSingleSerie(serie, serie.aimID));
            });
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
            this.props.history.push("/display");
            this.props.dispatch(clearSelection());
          }
        }
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
    const selectedAnnotations = Object.values(this.props.selectedAnnotations);
    let fileName;
    let promiseArr = [];
    let fileNameArr = [];
    let missingAnns = [];
    if (selectedProjects.length > 0) {
      await this.setState({ downloading: true });
      for (let project of selectedProjects) {
        fileName = `Project-${project.projectID}`;
        promiseArr.push(downloadProjects(project));
        fileNameArr.push(fileName);
      }
      this.downloadHelper(promiseArr, fileNameArr);
      this.props.dispatch(clearSelection());
    } else if (selectedPatients.length > 0) {
      await this.setState({ downloading: true });
      for (let patient of selectedPatients) {
        fileName = `Patients-${patient.subjectID}`;
        if (patient.numberOfAnnotations) {
          promiseArr.push(downloadSubjects(patient));
          fileNameArr.push(fileName);
        } else {
          missingAnns.push(patient.subjectName);
        }
      }
      this.downloadHelper(promiseArr, fileNameArr);
      this.props.dispatch(clearSelection());
    } else if (selectedStudies.length > 0) {
      await this.setState({ downloading: true });
      for (let study of selectedStudies) {
        fileName = `Studies-${study.studyUID}`;
        if (study.numberOfAnnotations) {
          promiseArr.push(downloadStudies(study));
          fileNameArr.push(fileName);
        } else {
          missingAnns.push(study.studyDescription);
        }
      }
      this.downloadHelper(promiseArr, fileNameArr);
      this.props.dispatch(clearSelection());
    } else if (selectedSeries.length > 0) {
      await this.setState({ downloading: true });
      for (let serie of selectedSeries) {
        fileName = `Series-${serie.seriesUID}`;
        if (serie.numberOfAnnotations) {
          promiseArr.push(downloadSeries(serie));
          fileNameArr.push(fileName);
        } else {
          missingAnns.push(serie.seriesDescription);
        }
      }
      this.downloadHelper(promiseArr, fileNameArr);
      this.props.dispatch(clearSelection());
    } else if (selectedAnnotations.length > 0) {
      this.setState({ showAnnotationModal: true });
    }
    this.setState({ missingAnns });
  };

  getSeriesData = async selected => {
    const { projectID, patientID, studyUID } = selected;
    try {
      const {
        data: {
          ResultSet: { Result: series }
        }
      } = await getSeries(projectID, patientID, studyUID);
      return series;
    } catch (err) {
      this.props.dispatch(annotationsLoadingError(err));
    }
  };

  downloadHelper = (promiseArr, nameArr) => {
    Promise.all(promiseArr)
      .then(result => {
        for (let i = 0; i < result.length; i++) {
          let blob = new Blob([result[i].data], { type: "application/zip" });
          this.triggerBrowserDownload(blob, nameArr[i]);
        }
        this.setState({ error: null, downloading: false });
      })
      .catch(err => {
        this.setState({ downloading: false });
        if (err.response.status === 503) {
          isLite
            ? toast.error("There is no aim file to download!", {
                autoClose: false
              })
            : toast.error("No files to download!", {
                autoClose: false
              });
        }
      });
  };

  handleDownloadCancel = () => {
    this.setState({ showAnnotationModal: false });
  };

  handleUploadCancel = () => {
    this.setState({ showUploadModal: false });
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

  handleFileUpload = () => {
    this.setState(state => ({
      showUploadFileModal: !state.showUploadFileModal
    }));
  };

  handleClickDeleteIcon = () => {
    this.setState(state => ({ showDeleteAlert: !state.showDeleteAlert }));
  };

  handleOK = () => {
    this.setState({ missingAnns: [] });
  };

  handleNewClick = () => {
    this.setState(state => ({ showNew: !state.showNew }));
  };

  handleSelectNewOption = e => {
    this.setState({ newSelected: e.target.dataset.opt, showNew: false });
  };

  handleNewModalCancel = () => {
    this.setState({ newSelected: "" });
  };

  updateStatus = () => {
    this.setState({ downloading: false, uploading: false, deleting: false });
  };

  handleNewSelected = () => {
    switch (this.state.newSelected) {
      case "subject":
        return (
          <SubjectCreationModal
            onCancel={this.handleNewModalCancel}
            project={this.props.match.params.pid}
            onSubmit={this.updateUploadStatus}
            onResolve={this.updateStatus}
          />
        );
      case "study":
        return (
          <StudyCreationModal
            onCancel={this.handleNewModalCancel}
            subjects={this.state.subjects}
            project={this.props.match.params.pid}
            onSubmit={this.updateUploadStatus}
            onResolve={this.updateStatus}
          />
        );
      case "series":
        return (
          <SeriesCreationModal
            onCancel={this.handleNewModalCancel}
            project={this.props.match.params.pid}
            subjects={this.state.subjects}
            onSubmit={this.updateUploadStatus}
            onResolve={this.updateStatus}
          />
        );
      // case "annotation":
      //   return (
      //     <AnnotationCreationModal
      //       onCancel={this.handleNewModalCancel}
      //       project={this.props.match.params.pid}
      //     />
      //   );
      default:
        return null;
    }
  };

  render = () => {
    let status;
    if (this.state.uploading) {
      status = "Uploading…";
    } else if (this.state.downloading) {
      status = "Downloading…";
    } else if (this.state.deleting) {
      status = "Deleting…";
    } else {
      status = null;
    }
    const showDelete =
      (Object.entries(this.props.selectedAnnotations).length > 0 &&
        this.props.selectedAnnotations.constructor === Object) ||
      (Object.entries(this.props.selectedPatients).length > 0 &&
        this.props.selectedPatients.constructor === Object) ||
      (Object.entries(this.props.selectedStudies).length > 0 &&
        this.props.selectedStudies.constructor === Object) ||
      (Object.entries(this.props.selectedSeries).length > 0 &&
        this.props.selectedSeries.constructor === Object);
    return (
      <>
        <Toolbar
          onDownload={this.downloadSelection}
          onUpload={this.handleFileUpload}
          onView={this.viewSelection}
          onDelete={this.handleClickDeleteIcon}
          onExpand={this.handleExpand}
          onShrink={this.handleShrink}
          onCloseAll={this.handleCloseAll}
          onNew={this.handleNewClick}
          status={status}
          showDelete={showDelete}
          project={this.props.match.params.pid}
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
          // update={this.state.numOfsubjects}
          expandLevel={this.state.expandLevel}
          expanded={this.state.expanded}
          update={this.state.update}
        />
        {this.state.showAnnotationModal && (
          <DownloadSelection
            onCancel={this.handleDownloadCancel}
            updateStatus={this.updateDownloadStatus}
          />
        )}

        {this.state.showUploadFileModal && (
          <UploadModal
            onCancel={this.handleFileUpload}
            onSubmit={this.updateUploadStatus}
          />
        )}
        {this.state.showDeleteAlert && (
          <DeleteAlert
            onCancel={this.handleClickDeleteIcon}
            onDelete={this.deleteSelection}
          />
        )}
        {this.state.missingAnns.length > 0 && (
          <DownloadWarning
            details={this.state.missingAnns}
            onOK={this.handleOK}
          />
        )}

        {this.state.showNew && (
          <NewMenu
            onSelect={this.handleSelectNewOption}
            onClose={this.handleNewClick}
          />
        )}
        {this.state.newSelected && this.handleNewSelected()}
      </>
    );
  };
}

const mapStateToProps = state => {
  return {
    dockOpen: state.annotationsListReducer.dockOpen,
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
