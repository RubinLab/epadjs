import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import Subjects from './Subjects';
import Toolbar from './toolbar';
import ProjectModal from '../annotationsList/selectSerieModal';
import { downloadProjects } from '../../services/projectServices';
import {
  downloadSubjects,
  deleteSubject
} from '../../services/subjectServices';
import {
  downloadStudies,
  deleteStudy,
  getStudies
} from '../../services/studyServices';
import { deleteAnnotation } from '../../services/annotationServices';
import {
  downloadSeries,
  getSeries,
  deleteSeries
} from '../../services/seriesServices';
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
  updateSingleSerie,
  // updatePatientOnAimDelete
} from '../annotationsList/action';
import DownloadSelection from './annotationDownloadModal';
import './searchView.css';
import UploadModal from './uploadModal';
import {
  getSubjects,
  addSubjectToProject
} from '../../services/subjectServices';
import { addStudyToProject } from '../../services/studyServices';

import DeleteAlert from './deleteConfirmationModal';
import NewMenu from './newMenu';
import SubjectCreationModal from './subjectCreationModal.jsx';
import StudyCreationModal from './studyCreationModal.jsx';
import SeriesCreationModal from './seriesCreationModal.jsx';
import Worklists from './addWorklist';
import Projects from './addToProject';
import WarningModal from '../common/warningModal';
import AnnotationCreationModal from './annotationCreationModal.jsx';
import UpLoadWizard from '../tagEditor/uploadWizard';
import { DISP_MODALITIES } from '../../constants';

const mode = sessionStorage.getItem('mode');

const messages = {
  newUser: {
    title: 'No Permission',
    message: `You don't have permission yet, please contact your admin`
  },
  itemOpen: {
    title: 'Item is open in display',
    message: `couldn't be deleted. Please close series before deleting`
  },
  deleteFmSys: {
    title: `Deleting from System`,
    message: `Deleting from All or Unassigned will remove the items from the system permanently. Do you want to delete the selected items?`
  },
  delete: {
    title: `Deleting items`,
    message: `Delete selected items? This cannot be undone.`
  }
};

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
      expanded: {},
      showNew: false,
      newUser: false,
      openItemsDeleted: false,
      noOfNotDeleted: 0,
      expandLevel: 0,
      showUploadWizard: false,
      showProjects: false,
      editingTags: false
    };
  }

  updateDownloadStatus = () => {
    this.setState(state => ({ downloading: !state.downloading }));
  };

  componentDidMount = async () => {
    try {
      const { pid } = this.props;
      if (mode === 'thick' && !pid) {
        this.props.history.push(`/list/${pid}`);
      }
      let subjects = Object.values(this.props.treeData);
      if (subjects.length > 0) {
        subjects = subjects.map(el => el.data);
      } else if (pid) {
        subjects = await this.getData();
        // this.props.getTreeData("subject", subjects);
      }
      const { expandLevel } = this.props;

      this.setState({
        numOfsubjects: subjects.length,
        subjects,
        expandLevel
      });
    } catch (err) {
      window.addEventListener('openSeriesModal', this.handleSeriesModal);
    }
  };

  // App.js triggers this event when more than allowed series are sent from the url to open
  handleSeriesModal = event => {
    const list = event.detail;
    const seriesList = [list];
    this.setState({ isSerieSelectionOpen: true, seriesList });
  };

  componentDidUpdate = async prevProps => {
    const { uploadedPid, lastEventId, expandLevel } = this.props;
    const { pid } = this.props.match.params;
    const samePid = mode !== 'lite' && uploadedPid === pid;
    let subjects;

    if (prevProps.match.params.pid !== pid) {
      subjects = await this.getData();
      this.setState({ numOfsubjects: subjects.length, subjects });
    }

    if ((samePid || mode === 'lite') && prevProps.lastEventId !== lastEventId) {
      this.setState(state => ({ update: state.update + 1 }));
    }
    if (expandLevel !== prevProps.expandLevel) {
      this.setState({
        expandLevel
      });
      if (expandLevel === 0) {
        this.setState({ expanded: {} });
      }
    }
    if (lastEventId !== prevProps.lastEventId && this.state.editingTags) {
      this.handleEditingTags();
    }
  };

  componentWillUnmount() {
    window.removeEventListener('openSeriesModal', this.handleSeriesModal);
  }

  checkForAllAndUnassigned = () => {
    const { pid } = this.props;
    const checkFromUrl = pid === 'all' || pid === 'nonassigned';
    let selection = [];
    let checkFromProjectID = false;
    const patients = Object.values(this.props.selectedPatients);
    const studies = Object.values(this.props.selectedStudies);
    const series = Object.values(this.props.selectedSeries);
    const annotations = Object.values(this.props.selectedAnnotations);
    selection =
      patients.length > 0
        ? patients
        : studies.length > 0
          ? studies
          : series.length > 0
            ? series
            : annotations;
    selection.forEach((el, i) => {
      if (el.projectID === 'all' || el.projectID === 'nonassigned') {
        checkFromProjectID = true;
      }
    });
    return checkFromProjectID || checkFromUrl;
  };

  getData = async () => {
    let data = [];
    try {
      const { pid } = this.props.match.params;
      const isRoutePidNull = pid === 'null' || !pid;
      const isPropsPidNull =
        this.props.pid === null || this.props.pid === 'null';
      if (pid || this.props.pid || mode === 'lite') {
        if (!isRoutePidNull || !isPropsPidNull) {
          const projectId = isRoutePidNull ? this.props.pid : pid;
          // const result = await getSubjects(projectId);
          // data = result.data;
        }
      }
      return [];
    } catch (err) {
      const { status, statusText } = err.response;
      if (status === 403 && statusText.toLowerCase() === 'forbidden') {
        this.setState({ newUser: true });
      }
    }
  };

  handleSelectionOnExpandChange = searchViewAutoExpand => {
    const { expandLevel } = this.props;
    const lengthOfPatients = Object.entries(this.props.selectedPatients).length;
    const lengthOfStudies = Object.entries(this.props.selectedStudies).length;
    const lengthOfSeries = Object.entries(this.props.selectedSeries).length;
    const lengthOfAnns = Object.entries(this.props.selectedAnnotations).length;
    const selectedLevel = {
      0: lengthOfPatients,
      1: lengthOfStudies,
      2: lengthOfSeries,
      3: lengthOfAnns
    };

    if (searchViewAutoExpand === 0) {
      if (selectedLevel[2] || selectedLevel[3]) {
        this.props.dispatch(clearSelection());
      }
    } else if (searchViewAutoExpand === 1) {
      if (expandLevel === 3 && selectedLevel[3]) {
        this.props.dispatch(clearSelection());
      } else if (expandLevel === 2 && (selectedLevel[3] || selectedLevel[2])) {
        this.props.dispatch(clearSelection());
      } else if (
        expandLevel === 1 &&
        (selectedLevel[3] || selectedLevel[2] || selectedLevel[1])
      ) {
        this.props.dispatch(clearSelection());
      }
    } else {
      if (selectedLevel[0]) return;
      else this.props.dispatch(clearSelection());
    }
  };

  handleExpand = async () => {
    if (this.state.expandLevel < 3) {
      // this.setState(state => ({ expandLevel: state.expandLevel + 1 }));
      this.props.getExpandLevel(this.props.expandLevel + 1);
    }
    let expanded = {};
    for (let i = 0; i < this.state.numOfsubjects; i++) {
      expanded[i] = true;
    }
    this.setState({ expanded });
    this.handleSelectionOnExpandChange(0);
  };

  handleShrink = () => {
    this.props.onShrink();
    this.handleSelectionOnExpandChange(1);
  };

  handleCloseAll = () => {
    this.props.handleCloseAll();
    this.handleSelectionOnExpandChange(2);
  };

  updateUploadStatus = () => {
    // this.setState(state => ({ update: state.update + 1 }));
    this.state.uploading
      ? this.setState({ uploading: false })
      : this.setState({ uploading: true });
    this.updateSubjectCount();
    // update patients after upload
    // filter the patients from openSeries with the first index they appear
    const patients = this.props.openSeries.reduce((all, item, index) => {
      if (!all[item.patientID]) {
        all[item.patientID] = index;
      }
      return all;
    }, {});
    // pass it to getwholedata
    const promiseArr = [];
    // -----> Delete after v1.0 <-----
    // for (let patient in patients) {
      // promiseArr.push(
      //   this.props.dispatch(
      //     getWholeData(this.props.openSeries[patients[patient]])
      //   )
      // );
    //   promiseArr.push(getWholeData(this.props.openSeries[patients[patient]]));
    // }
    // Promise.all(promiseArr)
    //   .then(() => {
    //     //keep the current state
    //     this.props.dispatch(clearSelection());

    //     this.setState(state => ({ update: state.update + 1 }));
    //     this.props.history.push(`/list/${this.props.pid}`);
    //     for (let serie of this.props.openSeries) {
    //       let type = serie.aimID ? 'annotation' : 'serie';
    //       this.props.dispatch(
    //         updatePatient(
    //           type,
    //           true,
    //           serie.patientID,
    //           serie.studyUID,
    //           serie.seriesUID
    //         )
    //       );
    //     }
    //   })
    //   .catch(err => {
    //     console.log(err);
    //   });
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

  handleEditingTags = () => {
    const { editingTags } = this.state;
    this.setState({ editingTags: !editingTags });
  };

  deleteSelectionWrapper = async (arr, func, level, delSys) => {
    this.handleClickDeleteIcon();
    const promiseArr = [];
    this.setState({ deleting: true });
    const openItems = [];
    const deletedItems = [];
    arr.forEach(item => {
      if (this.checkIfSerieOpen(item[level], level).isOpen) {
        openItems.push(item);
      } else {
        this.props
          .closeBeforeDelete(level, item)
          .then(() => {
            promiseArr.push(func(item, delSys));
            deletedItems.push(item);
          })
          .catch(err => console.log(err));
      }
    });
    Promise.all(promiseArr)
      .then(async () => {
        const subjects = await this.getData();
        this.setState({ deleting: false, numOfsubjects: subjects.length });
        this.setState(state => ({ update: state.update + 1 }));
        if (Object.values(this.props.selectedAnnotations).length > 0) {
          this.updateStoreOnAnnotationDelete(deletedItems);
        }
        this.props.dispatch(clearSelection());
        this.props.updateProgress();
        if (openItems.length) {
          this.setState({
            openItemsDeleted: true,
            noOfNotDeleted: openItems.length
          });
        }
        // this.props.clearTreeData();
        this.props.clearTreeExpand();
        this.props.history.push(`/list/${this.props.pid}`);
      })
      .catch(err => {
        console.log(err);
        this.setState(state => ({ update: state.update + 1 }));
      });
  };

  deleteSelection = () => {
    const patients = Object.values(this.props.selectedPatients);
    const studies = Object.values(this.props.selectedStudies);
    const series = Object.values(this.props.selectedSeries);
    const annotations = Object.values(this.props.selectedAnnotations);
    const { showDeleteFromSysAlert } = this.state;

    const delSys = showDeleteFromSysAlert ? '?all=true' : '';

    if (patients.length > 0) {
      this.deleteSelectionWrapper(patients, deleteSubject, 'patientID', delSys);
    } else if (studies.length > 0) {
      this.deleteSelectionWrapper(studies, deleteStudy, 'studyUID', delSys);
    } else if (series.length > 0) {
      this.deleteSelectionWrapper(series, deleteSeries, 'seriesUID', delSys);
    } else if (annotations.length > 0) {
      this.deleteSelectionWrapper(
        annotations,
        deleteAnnotation,
        'seriesUID',
        delSys
      );
    }
    if (showDeleteFromSysAlert) {
      // this.props.clearTreeData();
      localStorage.setItem('treeData', JSON.stringify({}));
      this.props.clearTreeExpand();
    }
  };

  updateStoreOnAnnotationDelete = arr => {
    const seriesToUpdate = {};
    const patientsToUpdate = [];
    const openSeriesUIDs = this.props.openSeries.reduce((all, item, index) => {
      all.push(item.seriesUID);
      return all;
    }, []);
    arr.forEach((el, index) => {
      if (openSeriesUIDs.includes(el.seriesUID)) {
        seriesToUpdate[el.seriesUID] = openSeriesUIDs.indexOf(el.seriesUID);
        // -----> Delete after v1.0 <-----
        // patientsToUpdate.push(el);
      }
    });
    Object.values(seriesToUpdate).forEach(el => {
      const subjectID = this.props.openSeries[el].patientID;
      this.props.dispatch(
        updateSingleSerie({ ...this.props.openSeries[el], subjectID })
      );
    });
    // -----> Delete after v1.0 <-----
    // patientsToUpdate.forEach(el => {
    //   this.props.dispatch(updatePatientOnAimDelete(el));
    // });
  };

  updateError = error => {
    this.setState({ error, loading: false });
  };

  checkIfSerieOpen = (selectedUID, UIDlevel) => {
    let isOpen = false;
    let index;
    this.props.openSeries.forEach((port, i) => {
      if (port[UIDlevel] === selectedUID) {
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
    const maxPort = parseInt(sessionStorage.getItem('maxPort'));
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
      for (let st of selectedStudies) {
        total += st.numberOfSeries;
      }
      for (let st of selectedStudies) {
        studiesObj[st.studyUID] = await this.getSeriesData(st);
      }

      //check if enough room to display selection
      if (total + this.props.openSeries.length > maxPort) {
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
        // -----> Delete after v1.0 <-----
        // for (let study in studiesObj) {
        //   for (let serie of studiesObj[study]) {
        //     if (!this.props.patients[serie.patientID]) {
        //       // await this.props.dispatch(getWholeData(serie));
        //       getWholeData(serie);
        //     } else {
        //       this.props.dispatch(
        //         updatePatient(
        //           'serie',
        //           true,
        //           serie.patientID,
        //           serie.studyUID,
        //           serie.seriesUID
        //         )
        //       );
        //     }
        //   }
        // }
        this.props.history.push('/display');
        this.props.dispatch(clearSelection());
      }
      //if series selected
    } else if (selectedSeries.length > 0) {
      //check if enough room to display selection
      for (let serie of selectedSeries) {
        if (
          !this.checkIfSerieOpen(serie.seriesUID, 'seriesUID').isOpen &&
          DISP_MODALITIES.includes(serie.examType)
        ) {
          notOpenSeries.push(serie);
        }
      }
      //if all series already open update active port
      if (notOpenSeries.length === 0) {
        let index = this.checkIfSerieOpen(
          selectedSeries[0].seriesUID,
          'seriesUID'
        ).index;
        this.props.dispatch(changeActivePort(index));
        this.props.history.push('/display');
        this.props.dispatch(clearSelection());
      } else {
        if (selectedSeries.length + this.props.openSeries.length > maxPort) {
          groupedObj = this.groupUnderStudy(selectedSeries);
          await this.setState({ seriesList: groupedObj });
          this.setState({ isSerieSelectionOpen: true });
          // this.props.history.push("/display");
        } else {
          //else get data for each serie for display
          notOpenSeries.forEach(serie => {
            this.props.dispatch(addToGrid(serie));
            this.props.dispatch(getSingleSerie(serie));
          });
          // -----> Delete after v1.0 <-----
          // for (let series of selectedSeries) {
          //   if (!this.props.patients[series.patientID]) {
          //     // await this.props.dispatch(getWholeData(series));
          //     getWholeData(series);
          //   } else {
          //     this.props.dispatch(
          //       updatePatient(
          //         'serie',
          //         true,
          //         series.patientID,
          //         series.studyUID,
          //         series.seriesUID
          //       )
          //     );
          //   }
          // }
          this.props.history.push('/display');
          this.props.dispatch(clearSelection());
        }
      }
      //if annotations selected
    } else if (selectedAnnotations.length > 0) {
      let serieList = Object.values(groupedAnns);
      groupedObj = this.groupUnderStudy(serieList);
      //check if enough room to display selection
      for (let serie of serieList) {
        if (
          !this.checkIfSerieOpen(serie.seriesUID, 'seriesUID').isOpen &&
          DISP_MODALITIES.includes(serie.examType)
        ) {
          notOpenSeries.push(serie);
        }
      }
      if (notOpenSeries.length === 0) {
        const serID = serieList[0].seriesUID;
        let index = this.checkIfSerieOpen(serID, 'seriesUID').index;
        this.props.dispatch(changeActivePort(index));
        this.props.dispatch(jumpToAim(serID, serieList[0].aimID, index));
      } else {
        if (notOpenSeries.length + this.props.openSeries.length > maxPort) {
          await this.setState({ seriesList: groupedObj });
          this.setState({ isSerieSelectionOpen: true });
          //else get data for each serie for display
        } else {
          serieList.forEach(serie => {
            this.props.dispatch(addToGrid(serie, serie.aimID));
            this.props.dispatch(getSingleSerie(serie, serie.aimID));
          });
          // -----> Delete after v1.0 <-----
          // for (let ann of selectedAnnotations) {
          //   if (!this.props.patients[ann.subjectID]) {
          //     // await this.props.dispatch(getWholeData(null, null, ann));
          //     getWholeData(null, null, ann);
          //   } else {
          //     this.props.dispatch(
          //       updatePatient(
          //         'annotation',
          //         true,
          //         ann.subjectID,
          //         ann.studyUID,
          //         ann.seriesUID,
          //         ann.aimID
          //       )
          //     );
          //   }
          // }
          this.props.history.push('/display');
          this.props.dispatch(clearSelection());
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
    // const selectedProjects = Object.values(this.props.selectedProjects);
    const selectedPatients = Object.values(this.props.selectedPatients);
    const selectedStudies = Object.values(this.props.selectedStudies);
    const selectedSeries = Object.values(this.props.selectedSeries);
    const selectedAnnotations = Object.values(this.props.selectedAnnotations);
    const selected =
      // selectedProjects.length ||
      selectedPatients.length ||
      selectedStudies.length ||
      selectedSeries.length;
    if (selected) {
      const { pid } = this.props;
      let bodyArr = [];
      let fileName = 'downloaded_items';
      let promise;
      await this.setState({ downloading: true });
      // if (selectedProjects.length > 0) {
      // for (let project of selectedProjects) {
      //   fileName = `Project-${project.projectID}`;
      //   promiseArr.push(downloadProjects(project));
      //   fileNameArr.push(fileName);
      // }
      // this.downloadHelper(promiseArr, fileNameArr);
      // this.props.dispatch(clearSelection());
      // } else
      if (selectedPatients.length > 0) {
        bodyArr = selectedPatients.map(el => el.patientID);
        promise = downloadSubjects(pid, bodyArr);
        fileName = 'Downloaded_subjects';
      } else if (selectedStudies.length > 0) {
        bodyArr = selectedStudies.map(el => {
          return { study: el.studyUID, subject: el.patientID };
        });
        promise = downloadStudies(pid, bodyArr);
        fileName = 'Downloaded_studies';
      } else if (selectedSeries.length > 0) {
        bodyArr = selectedSeries.map(el => {
          return {
            series: el.seriesUID,
            study: el.studyUID,
            subject: el.patientID
          };
        });
        promise = downloadSeries(pid, bodyArr);
        fileName = 'Downloaded_series';
      }

      promise
        .then(result => {
          let blob = new Blob([result.data], { type: 'application/zip' });
          this.triggerBrowserDownload(blob, fileName);
          this.setState({ error: null, downloading: false });
        })
        .catch(err => {
          this.setState({ downloading: false });
          console.log(err);
        });
      this.setState(state => ({ update: state.update + 1 }));
      this.props.dispatch(clearSelection());
    } else if (selectedAnnotations.length > 0) {
      this.setState({ showAnnotationModal: true });
    } else {
      toast.info('Nothing selected to download', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
  };

  getSeriesData = async selected => {
    const { projectID, patientID, studyUID } = selected;
    try {
      const { data: series } = await getSeries(projectID, patientID, studyUID);
      return series;
    } catch (err) {
      this.props.dispatch(annotationsLoadingError(err));
    }
  };

  handleDownloadCancel = () => {
    this.setState({ showAnnotationModal: false });
  };

  handleUploadCancel = () => {
    this.setState({ showUploadModal: false });
  };

  triggerBrowserDownload = (blob, fileName) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.style = 'display: none';
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
    const { showDeleteFromSysAlert } = this.state;
    if (this.checkForAllAndUnassigned() || showDeleteFromSysAlert) {
      this.setState(state => ({
        showDeleteFromSysAlert: !state.showDeleteFromSysAlert
      }));
    } else {
      this.setState(state => ({ showDeleteAlert: !state.showDeleteAlert }));
    }
  };

  handleOK = () => {
    this.setState({
      newUser: false,
      openItemsDeleted: false,
      noOfNotDeleted: 0
    });
  };

  handleNewClick = () => {
    this.setState(state => ({ showNew: !state.showNew }));
  };

  handleSelectNewOption = e => {
    this.setState({ newSelected: e.target.dataset.opt, showNew: false });
  };

  handleNewModalCancel = () => {
    this.setState({ newSelected: '' });
  };

  updateStatus = () => {
    this.setState({ downloading: false, uploading: false, deleting: false });
  };

  handleWorklistClick = () => {
    // if (this.state.showWorklists) this.props.dispatch(clearSelection());
    this.setState(state => ({ showWorklists: !state.showWorklists }));
  };

  updateTreeView = () => {
    this.setState(state => ({
      update: state.update + 1
    }));
  };

  handleNewSelected = () => {
    const { selectedPatients, selectedStudies } = this.props;
    switch (this.state.newSelected) {
      case 'subject':
        return (
          <SubjectCreationModal
            onCancel={this.handleNewModalCancel}
            project={this.props.match.params.pid}
            onSubmit={this.updateUploadStatus}
            onResolve={this.updateStatus}
            updateTreeDataOnSave={this.props.updateTreeDataOnSave}
          />
        );
      case 'study':
        return (
          <StudyCreationModal
            onCancel={this.handleNewModalCancel}
            project={this.props.match.params.pid}
            onSubmit={this.updateUploadStatus}
            onResolve={this.updateStatus}
            updateTreeDataOnSave={this.props.updateTreeDataOnSave}
            selectedPatients={Object.values(selectedPatients)}
          />
        );
      case 'series':
        return (
          <SeriesCreationModal
            onCancel={this.handleNewModalCancel}
            project={this.props.match.params.pid}
            onSubmit={this.updateUploadStatus}
            onResolve={this.updateStatus}
            updateTreeDataOnSave={this.props.updateTreeDataOnSave}
            selectedPatients={Object.values(selectedPatients)}
            selectedStudies={Object.values(selectedStudies)}
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

  handleSubmitDownload = () => {
    this.setState({ showAnnotationModal: false });
    this.setState(state => ({ update: state.update + 1 }));
    this.props.dispatch(clearSelection());
  };

  handleUploadWizardClick = () => {
    this.setState(state => ({ showUploadWizard: !state.showUploadWizard }));
  };

  handleProjectClick = () => {
    this.setState(state => ({ showProjects: !state.showProjects }));
  };

  verifyObject = object => {
    return object.constructor === Object;
  };

  addSelectionToProject = async e => {
    try {
      const { id } = e.target;
      const { pid } = this.props;
      let promises = [];
      let patientIDs = new Set();
      const patients = Object.values(this.props.selectedPatients);
      const studies = Object.values(this.props.selectedStudies);
      if (patients.length > 0) {
        patients.forEach(el => {
          promises.push(addSubjectToProject(id, el.patientID, pid));
        });
      }
      if (studies.length > 0) {
        studies.forEach(el => {
          promises.push(addStudyToProject(id, el.patientID, el.studyUID, pid));
        });
      }
      await Promise.all(promises);
      localStorage.setItem('treeData', JSON.stringify({}));
      this.setState({ showProjects: false });
      this.props.clearTreeExpand();
      this.props.dispatch(clearSelection());
      this.props.history.push(`/list/${id}`);
    } catch (err) {
      console.log(err);
    }
  };

  render = () => {
    let status;
    if (this.state.uploading) {
      status = 'Uploading…';
    } else if (this.state.downloading) {
      status = 'Downloading…';
    } else if (this.state.deleting) {
      status = 'Deleting…';
    } else if (this.state.editingTags) {
      status = 'Editing tags…';
    } else {
      status = null;
    }

    const {
      selectedPatients,
      selectedStudies,
      selectedSeries,
      selectedAnnotations
    } = this.props;

    const lengthOfPatients = Object.entries(selectedPatients).length;
    const lengthOfStudies = Object.entries(selectedStudies).length;
    const lengthOfSeries = Object.entries(selectedSeries).length;
    const lengthOfAnns = Object.entries(selectedAnnotations).length;

    const hideEyeIcon =
      lengthOfStudies === 0 && lengthOfSeries === 0 && lengthOfAnns === 0;

    const pid = this.props.match.params.pid || this.props.pid;
    const showAddTo =
      (lengthOfPatients > 0 && this.verifyObject(selectedPatients)) ||
      (lengthOfStudies > 0 && this.verifyObject(selectedStudies));
    const showDelete =
      showAddTo ||
      (lengthOfAnns > 0 && this.verifyObject(selectedAnnotations)) ||
      (lengthOfSeries > 0 && this.verifyObject(selectedSeries));
    const {
      isSerieSelectionOpen,
      showUploadFileModal,
      showDeleteAlert,
      showNew,
      showWorklists,
      newUser,
      openItemsDeleted,
      newSelected,
      showProjects,
      noOfNotDeleted,
      showDeleteFromSysAlert
    } = this.state;
    const itemStr = noOfNotDeleted > 1 ? 'items' : 'item';
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
          onWorklist={this.handleWorklistClick}
          onUploadWizard={this.handleUploadWizardClick}
          status={status}
          showDelete={showDelete}
          showAddTo={showAddTo}
          showTagEditor={lengthOfSeries > 0}
          project={this.props.match.params.pid}
          onAddProject={this.handleProjectClick}
          admin={this.props.admin}
          hideEyeIcon={hideEyeIcon}
          expandLevel={this.props.expandLevel}
        // expanding={expanding}
        />
        {(this.props.showSeriesModal ||
          (isSerieSelectionOpen && !this.props.loading)) && (
            <ProjectModal
              seriesPassed={this.state.seriesList}
              onCancel={this.closeSelectionModal}
            />
          )}
        {/* {this.props.showSeriesModal && (
          <ProjectModal
            seriesPassed={this.props.seriesList}
            onCancel={this.closeSelectionModal}
          />
        )} */}
        <Subjects
          key={this.props.match.params.pid}
          pid={pid}
          expandLevel={this.props.expandLevel}
          expanded={this.state.expanded}
          update={this.state.update}
          handleCloseAll={this.handleCloseAll}
          // updateExpandedLevelNums={this.props.updateExpandedLevelNums}
          progressUpdated={this.props.progressUpdated}
          getTreeExpandSingle={this.props.getTreeExpandSingle}
          getTreeExpandAll={this.props.getTreeExpandAll}
          treeExpand={this.props.treeExpand}
          // expandLoading={this.props.expandLoading}
          // patientExpandComplete={patientExpandComplete}
          treeData={this.props.treeData}
          getTreeData={this.props.getTreeData}
          closeAllCounter={this.props.closeAllCounter}
          collapseSubjects={this.props.collapseSubjects}
        />
        {this.state.showAnnotationModal && (
          <DownloadSelection
            onCancel={this.handleDownloadCancel}
            updateStatus={this.updateDownloadStatus}
            onSubmit={this.handleSubmitDownload}
            pid={this.props.pid}
          />
        )}

        {showUploadFileModal && (
          <UploadModal
            onCancel={this.handleFileUpload}
            onSubmit={this.updateUploadStatus}
            pid={this.props.pid}
            clearTreeData={this.props.clearTreeData}
            onResolve={this.updateStatus}
            clearTreeExpand={this.props.clearTreeExpand}
          />
        )}
        {showDeleteAlert && (
          <DeleteAlert
            onCancel={this.handleClickDeleteIcon}
            onDelete={this.deleteSelection}
            title={messages.delete.title}
            message={messages.delete.message}
          />
        )}
        {showDeleteFromSysAlert && (
          <DeleteAlert
            onCancel={this.handleClickDeleteIcon}
            onDelete={this.deleteSelection}
            title={messages.deleteFmSys.title}
            message={messages.deleteFmSys.message}
          />
        )}
        {showNew && (
          <NewMenu
            onSelect={this.handleSelectNewOption}
            onClose={this.handleNewClick}
            selectedPatients={selectedPatients}
            selectedStudies={selectedStudies}
            selectedSeries={selectedSeries}
          />
        )}

        {showWorklists && (
          <Worklists
            onClose={this.handleWorklistClick}
            updateProgress={this.props.updateProgress}
          />
        )}
        {showProjects && (
          <Projects
            onProjectClose={this.handleProjectClick}
            onSave={this.addSelectionToProject}
          />
        )}
        {newUser && (
          <WarningModal
            onOK={this.handleOK}
            title={messages.newUser.title}
            message={messages.newUser.message}
          />
        )}
        {openItemsDeleted && (
          <WarningModal
            onOK={this.handleOK}
            title={messages.itemOpen.title}
            message={`${noOfNotDeleted} ${itemStr} ${messages.itemOpen.message}`}
          />
        )}
        {this.state.showUploadWizard && (
          <UpLoadWizard
            onClose={this.handleUploadWizardClick}
            pid={this.props.pid}
            updateTreeView={this.updateTreeView}
            onSave={this.handleEditingTags}
          />
        )}
        {this.state.newSelected && this.handleNewSelected()}
      </>
    );
  };
}

const mapStateToProps = state => {
  const {
    selectedProject,
    selectedPatients,
    selectedStudies,
    selectedSeries,
    selectedAnnotations,
    patients,
    openSeries,
    showProjectModal,
    loading,
    uploadedPid,
    lastEventId
  } = state.annotationsListReducer;
  return {
    selectedProject,
    selectedPatients,
    selectedStudies,
    selectedSeries,
    selectedAnnotations,
    patients,
    openSeries,
    showProjectModal,
    loading,
    uploadedPid,
    lastEventId
  };
};
export default connect(mapStateToProps)(SearchView);
