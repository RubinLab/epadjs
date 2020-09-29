import React, { Component } from 'react';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { EventSourcePolyfill } from 'event-source-polyfill';
import Keycloak from 'keycloak-js';
import _ from 'lodash';
import { getUser, getUserInfo } from './services/userServices';
import NavBar from './components/navbar';
import Sidebar from './components/sideBar/sidebar';
import SearchView from './components/searchView/searchView';
import DisplayView from './components/display/displayView';
import AnotateView from './components/anotateView';
import ProgressView from './components/progressView';
import FlexView from './components/flexView';
import NotFound from './components/notFound';
import LoginForm from './components/loginForm';
import Logout from './components/logout';
import ProtectedRoute from './components/common/protectedRoute';
import Cornerstone from './components/cornerstone/cornerstone';
import Management from './components/management/mainMenu';
import InfoMenu from './components/infoMenu';
import UserMenu from './components/userProfileMenu.jsx';
import WarningModal from './components/common/warningModal';
import ConfirmationModal from './components/common/confirmationModal';
import SelectModalMenu from './components/common/SelectModalMenu';
// import AnnotationsDock from "./components/annotationsList/annotationDock/annotationsDock";
import auth from './services/authService';
import MaxViewAlert from './components/annotationsList/maxViewPortAlert';
import {
  clearAimId,
  getNotificationsData,
  clearSelection,
  selectProject,
  getTemplates,
} from './components/annotationsList/action';
import Worklist from './components/sideBar/sideBarWorklist';
import ErrorBoundary from './ErrorBoundary';
import Report from './components/searchView/Report.jsx';
import { getSubjects, getSubject } from './services/subjectServices';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const messages = {
  noPatient: {
    title: 'No Patient Selected',
    message: 'Select a patient to get a report!',
  },
  multiplePatient: {
    title: 'Multiple Patients Selected',
    message: 'Select only one patient to get the report!',
  },
  projectWaterfall: {
    title: 'Project Selected',
    message: 'Waterfall report will be created for project ',
  },
};

const reportsList = [
  { name: 'ADLA' },
  { name: 'Longitudinal' },
  { name: 'RECIST' },
  { name: 'Waterfall' },
];
class App extends Component {
  constructor(props) {
    super(props);
    this.eventSource = null;
    this.state = {
      openMng: false,
      keycloak: null,
      authenticated: false,
      openInfo: false,
      openUser: false,
      viewType: 'search',
      lastEventId: null,
      showLog: false,
      admin: false,
      progressUpdated: 0,
      treeExpand: {},
      expandLevel: 0,
      maxLevel: 0,
      refTree: {},
      treeData: {},
      pid: null,
      closeAll: 0,
      projectAdded: 0,
      showWarning: false,
      showConfirmation: false,
      showReportsMenu: false,
      title: '',
      message: '',
      reportType: '',
      reportsCompArr: [],
      metric: null,
    };
  }

  getProjectAdded = () => {
    this.setState(state => ({
      projectAdded: state.projectAdded + 1,
      refTree: {},
      treeData: {},
      expandLevel: 0,
      treeExpand: {},
    }));
  };

  closeWarning = () => {
    this.setState({
      showConfirmation: false,
      showWarning: false,
      title: '',
      message: '',
    });
  };

  handleReportsClick = () => {
    this.setState(state => ({ showReportsMenu: !state.showReportsMenu }));
  };

  closeReportModal = index => {
    const arr = [...this.state.reportsCompArr];
    arr[index] = null;
    this.setState({
      template: null,
      report: null,
      reportsCompArr: arr,
    });

    // if there isn't any report open clear selection
    let nullCount = 0;
    arr.forEach(el => {
      if (el === null) {
        nullCount++;
      }
    });
    if (nullCount === arr.length) this.props.dispatch(clearSelection());
  };

  handleReportSelect = e => {
    const { projectMap, selectedPatients } = this.props;
    const patients = Object.values(selectedPatients);
    const reportType = e.target.dataset.opt;
    this.handleReportsClick();
    if (patients.length === 0) {
      if (reportType === 'Waterfall') {
        this.setState({
          showConfirmation: true,
          title: messages.projectWaterfall.title,
          message:
            messages.projectWaterfall.message +
            projectMap[this.state.pid].projectName,
        });
      } else {
        this.setState({
          showWarning: true,
          title: messages.noPatient.title,
          message: messages.noPatient.message,
        });
      }
    } else if (patients.length > 1 && reportType !== 'Waterfall') {
      this.setState({
        showWarning: true,
        title: messages.multiplePatient.title,
        message: messages.multiplePatient.message,
      });
    } else {
      const reportsCompArr = [...this.state.reportsCompArr];
      const index = reportsCompArr.length;
      reportsCompArr.push(
        <Report
          onClose={this.closeReportModal}
          report={reportType}
          index={index}
          patient={patients[0]}
          key={`report${index}`}
          waterfallClickOn={this.handleWaterFallClickOnBar}
          handleMetric={this.getMetric}
        />
      );
      this.setState({
        template: null,
        reportType,
        reportsCompArr,
      });
    }
  };

  getMetric = metric => {
    this.setState({ metric });
  };
  handleWaterFallClickOnBar = async name => {
    // find the patient selected
    // if project selected get patient details with call
    const { selectedProject, selectedPatients } = this.props;
    let patient;
    if (selectedProject) {
      ({ data: patient } = await getSubject(selectedProject, name));
    } else {
      patient = this.props.selectedPatients[name];
    }

    const reportsCompArr = [...this.state.reportsCompArr];
    const index = reportsCompArr.length;
    reportsCompArr.push(
      <Report
        onClose={this.closeReportModal}
        report={this.state.metric}
        index={index}
        patient={patient}
        key={`report${index}`}
        waterfallClickOn={this.handleWaterFallClickOnBar}
        handleMetric={this.getMetric}
      />
    );
    this.setState({
      reportsCompArr,
    });
  };

  displayWaterfall = () => {
    this.props.dispatch(selectProject(this.state.pid));
    const reportsCompArr = [...this.state.reportsCompArr];
    const index = reportsCompArr.length;
    reportsCompArr.push(
      <Report
        onClose={this.closeReportModal}
        report={'Waterfall'}
        index={index}
        // patient={patients[0]}
        key={`report${index}`}
        waterfallClickOn={this.handleWaterFallClickOnBar}
        handleMetric={this.getMetric}
      />
    );

    this.setState({
      template: null,
      reportType: 'Waterfall',
      showConfirmation: false,
      reportsCompArr,
    });
  };

  getTreeExpandAll = (expandObj, expanded, expandLevel) => {
    try {
      const { patient, study, series } = expandObj;
      let treeExpand = { ...this.state.treeExpand };
      let refPatients, refStudies, subSeries, subStudies;
      const patientLevel = patient && !study && !series;
      const studyLevel = study && !series;
      const seriesLevel = series;
      if (patientLevel) {
        if (expanded) {
          for (let i = 0; i < patient; i += 1) treeExpand[i] = {};
          if (expandLevel >= this.state.maxLevel)
            this.setState({ maxLevel: expandLevel, refTree: treeExpand });
        }
        if (!expanded) {
          for (let i = 0; i < patient; i += 1) {
            treeExpand[i] = false;
          }
        }
      }

      if (studyLevel) {
        refPatients = Object.values(this.state.refTree);
        for (let i = 0; i < refPatients.length; i += 1) {
          if (!treeExpand[i]) treeExpand[i] = {};
        }
        if (expanded) {
          for (let i = 0; i < study; i += 1) {
            treeExpand[patient][i] = {};
          }
          if (expandLevel >= this.state.maxLevel)
            this.setState({ maxLevel: expandLevel, refTree: treeExpand });
        }
        if (!expanded) {
          for (let i = 0; i < study; i += 1) {
            treeExpand[patient][i] = false;
          }
        }
      }

      if (seriesLevel) {
        refPatients = Object.values(this.state.refTree);
        for (let i = 0; i < refPatients.length; i += 1) {
          refStudies = Object.values(refPatients[i]);
          if (!treeExpand[i]) {
            treeExpand[i] = {};
          }
          for (let k = 0; k < refStudies.length; k++) {
            treeExpand[i][k] = {};
          }
        }
        if (expanded) {
          for (let i = 0; i < series; i += 1) {
            treeExpand[patient][study][i] = {};
          }
          if (expandLevel >= this.state.maxLevel)
            this.setState({ maxLevel: expandLevel, refTree: treeExpand });
        }
        if (!expanded) {
          for (let i = 0; i < study; i += 1) {
            treeExpand[patient][study][i] = false;
          }
        }
      }
      this.setState({ treeExpand });
    } catch (err) {
      console.error(err);
    }
  };

  closeBeforeDelete = (level, ids) => {
    return new Promise((resolve, reject) => {
      try {
        const treeExpand = { ...this.state.treeExpand };
        if (level === 'patientID') {
          treeExpand[ids.index] = false;
        }
        this.setState({ treeExpand });
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  };

  getTreeExpandSingle = async expandObj => {
    try {
      const { patient, study, series } = expandObj;
      let treeExpand = { ...this.state.treeExpand };
      let index, val;
      const patientLevel = patient && !study && !series;
      const studyLevel = study && !series;
      const seriesLevel = series;

      if (patientLevel) {
        index = Object.keys(patient);
        index = index[0];
        val = Object.values(patient);
        val = val[0];
        treeExpand[index] = val;
      }
      if (studyLevel) {
        index = Object.keys(study);
        index = index[0];

        val = Object.values(study);
        val = val[0];
        treeExpand[patient][index] = val;
      }
      if (seriesLevel) {
        index = Object.keys(series);
        index = index[0];

        val = Object.values(series);
        val = val[0];
        treeExpand[patient][study][index] = val;
      }
      this.setState({ treeExpand });
    } catch (err) {
      console.error(err);
    }
  };

  getExpandLevel = expandLevel => {
    this.setState({ expandLevel });
  };

  handleShrink = async () => {
    const { expandLevel } = this.state;
    if (expandLevel > 0) {
      await this.setState(state => ({ expandLevel: state.expandLevel - 1 }));
    }
  };

  closeMenu = notification => {
    // if (event && event.type === "keydown") {
    //   if (event.key === "Escape" || event.keyCode === 27) {
    //     this.setState({ openMng: false });
    //   }
    // }
    this.setState({
      openMng: false,
      openInfo: false,
      openUser: false,
      openMenu: false,
    });
    if (notification) this.updateNotificationSeen();
  };

  switchView = viewType => {
    this.setState({ viewType });
  };

  handleMngMenu = () => {
    this.setState(state => ({
      openInfo: false,
      openMng: !state.openMng,
      openUser: false,
    }));
  };

  handleInfoMenu = () => {
    this.setState(state => ({
      openInfo: !state.openInfo,
      openMng: false,
      openUser: false,
    }));
  };

  handleUserProfileMenu = () => {
    this.setState(state => ({
      openInfo: false,
      openMng: false,
      openUser: !state.openUser,
    }));
  };

  updateProgress = () => {
    this.setState(state => ({ progressUpdated: state.progressUpdated + 1 }));
  };

  async componentDidMount() {
    Promise.all([
      fetch(`${process.env.PUBLIC_URL}/config.json`),
      fetch(`${process.env.PUBLIC_URL}/keycloak.json`),
    ])
      .then(async results => {
        const configData = await results[0].json();
        let { mode, apiUrl, wadoUrl, authMode } = configData;
        // check and use environment variables if any
        mode = process.env.REACT_APP_MODE || mode;
        apiUrl = process.env.REACT_APP_API_URL || apiUrl;
        wadoUrl = process.env.REACT_APP_WADO_URL || wadoUrl;
        authMode = process.env.REACT_APP_AUTH_MODE || authMode;
        sessionStorage.setItem('mode', mode);
        sessionStorage.setItem('apiUrl', apiUrl);
        sessionStorage.setItem('wadoUrl', wadoUrl);
        sessionStorage.setItem('authMode', authMode);
        this.setState({ mode, apiUrl, wadoUrl, authMode });
        const keycloakData = await results[1].json();
        const auth =
          process.env.REACT_APP_AUTH_URL || keycloakData['auth-server-url'];
        const keycloakJson = {};
        // check and use environment variables if any
        keycloakJson.realm =
          process.env.REACT_APP_AUTH_REALM || keycloakData.realm;
        keycloakJson.url =
          process.env.REACT_APP_AUTH_URL || keycloakData['auth-server-url'];
        keycloakJson.clientId =
          process.env.REACT_APP_AUTH_RESOURCE || keycloakData.resource;
        sessionStorage.setItem('auth', auth);
        sessionStorage.setItem('keycloakJson', JSON.stringify(keycloakJson));
        this.completeAutorization(apiUrl);
        if (mode === 'lite') this.setState({ pid: 'lite' });
      })
      .catch(err => {
        console.error(err);
      });
    //get notifications from sessionStorage and setState
    let notifications = sessionStorage.getItem('notifications');
    if (!notifications) {
      sessionStorage.setItem('notifications', JSON.stringify([]));
      this.setState({ notifications: [] });
    } else {
      notifications = JSON.parse(notifications);
      this.setState({ notifications });
    }
  }

  componentDidUpdate = prevProps => {
    const uploaded = this.props.notificationAction.startsWith('Upload');
    if (prevProps.lastEventId !== this.props.lastEventId && uploaded) {
      this.props.dispatch(getTemplates());
    }
  };

  completeAutorization = apiUrl => {
    let getAuthUser = null;

    if (sessionStorage.getItem('authMode') !== 'external') {
      const keycloak = Keycloak(
        JSON.parse(sessionStorage.getItem('keycloakJson'))
      );
      getAuthUser = new Promise((resolve, reject) => {
        keycloak
          .init({ onLoad: 'login-required' })
          .then(authenticated => {
            keycloak
              .loadUserInfo()
              .then(userInfo => {
                resolve({ userInfo, keycloak, authenticated });
              })
              .catch(err => reject(err));
          })
          .catch(err => reject(err));
      });
    } else {
      // authMode is external ask backend for user
      getAuthUser = new Promise((resolve, reject) => {
        getUserInfo()
          .then(userInfoResponse => {
            resolve({
              userInfo: userInfoResponse.data,
              keycloak: {},
              authenticated: true,
            });
          })
          .catch(err => reject(err));
      });
    }

    getAuthUser
      .then(async result => {
        try {
          let user = {
            user: result.userInfo.preferred_username || result.userInfo.email,
            displayname: result.userInfo.given_name,
          };
          await auth.login(user, null, result.keycloak);
          this.setState({
            keycloak: result.keycloak,
            authenticated: result.authenticated,
            id: result.userInfo.sub,
            user,
          });
          const {
            email,
            family_name,
            given_name,
            preferred_username,
          } = result.userInfo;
          const username = preferred_username || email;

          let userData;
          try {
            userData = await getUser(username);
            userData = userData.data;
            this.setState({ admin: userData.admin });
          } catch (err) {
            console.error(err);
          }
          this.eventSource = new EventSourcePolyfill(
            `${apiUrl}/notifications`,
            result.keycloak.token
              ? {
                  headers: {
                    authorization: `Bearer ${result.keycloak.token}`,
                  },
                }
              : {}
          );
          this.eventSource.addEventListener(
            'message',
            this.getMessageFromEventSrc
          );
        } catch (err) {
          console.log('Error in user retrieval!', err);
        }
      })
      .catch(err2 => {
        console.log('Authentication failed!', err2);
      });
  };

  getMessageFromEventSrc = res => {
    try {
      if (res.data === 'heartbeat') {
        return;
      }
      const parsedRes = JSON.parse(res.data);
      const { lastEventId } = res;
      const {
        params,
        createdtime,
        projectID,
        error,
        refresh,
      } = parsedRes.notification;
      const action = parsedRes.notification.function;
      const message = params;
      if (refresh)
        this.props.dispatch(
          getNotificationsData(projectID, lastEventId, refresh, action)
        );
      let time = new Date(createdtime).toString();
      const GMTIndex = time.indexOf(' G');
      time = time.substring(0, GMTIndex - 3);
      let notifications = [...this.state.notifications];
      notifications.unshift({
        message,
        time,
        seen: false,
        action,
        error,
      });
      const tagEdited = action.startsWith('Tag');
      const uploaded = action.startsWith('Upload');
      if (tagEdited || uploaded) {
        const { pid } = this.state;
        this.setState({ treeData: {} });
        this.setState({ pid });
        if (this.props.openSeries.length === 0) {
          this.props.history.push(`/search/${pid}`);
        }
      }
      this.setState({ notifications });
      const stringified = JSON.stringify(notifications);
      sessionStorage.setItem('notifications', stringified);
    } catch (err) {
      console.error(err);
    }
  };

  componentWillUnmount = () => {
    this.eventSource.removeEventListener(
      'message',
      this.getMessageFromEventSrc
    );
  };

  onLogout = e => {
    auth.logout();
    // sessionStorage.removeItem("annotations");
    sessionStorage.setItem('notifications', JSON.stringify([]));
    this.setState({
      authenticated: false,
      id: null,
      name: null,
      user: null,
    });
    if (sessionStorage.getItem('authMode') !== 'external')
      this.state.keycloak.logout().then(() => {
        this.setState({
          keycloak: null,
        });
        auth.logout();
      });
    else console.log('No logout in external authentication mode');
  };

  updateNotificationSeen = () => {
    const notifications = [...this.state.notifications];
    notifications.forEach(notification => {
      notification.seen = true;
    });
    this.setState({ notifications });
    const stringified = JSON.stringify(notifications);
    sessionStorage.setItem('notifications', stringified);
  };

  switchSearhView = () => {
    this.props.dispatch(clearAimId());
  };

  handleCloseAll = () => {
    // let { closeAll } = this.state;
    // closeAll += 1;
    this.setState(state => ({
      expandLevel: 0,
      closeAll: state.closeAll + 1,
    }));
  };

  getTreeData = (projectID, level, data) => {
    try {
      const treeData = { ...this.state.treeData };
      const patientIDs = [];
      if (level === 'subject') {
        if (!treeData[projectID]) treeData[projectID] = {};
        data.forEach(el => {
          if (!treeData[projectID][el.subjectID]) {
            treeData[projectID][el.subjectID] = { data: el, studies: {} };
          }
          patientIDs.push(el.subjectID);
        });
        if (this.state.treeData[projectID]) {
          if (
            data.length < Object.keys(this.state.treeData[projectID]).length
          ) {
            for (let patient in treeData[projectID]) {
              if (!patientIDs.includes(patient)) {
                delete treeData[projectID][patient];
              }
            }
          }
        }
      } else if (level === 'studies') {
        const studyUIDs = [];
        const patientID = data[0].patientID;
        data.forEach(el => {
          if (!treeData[projectID][el.patientID].studies[el.studyUID]) {
            treeData[projectID][el.patientID].studies[el.studyUID] = {
              data: el,
              series: {},
            };
          }
          studyUIDs.push(el.studyUID);
        });
        const studiesObj = treeData[projectID][patientID].studies;
        const studiesArr = Object.values(studiesObj);
        if (data.length < studiesArr.length) {
          for (let study in studiesObj) {
            if (!studyUIDs.includes(study)) {
              delete studiesObj[study];
            }
          }
        }
      } else if (level === 'series') {
        const patientID = data[0].patientID;
        const studyUID = data[0].studyUID;
        const seriesUIDs = [];
        data.forEach(el => {
          if (
            !treeData[projectID][el.patientID].studies[el.studyUID].series[
              el.seriesUID
            ]
          ) {
            treeData[projectID][el.patientID].studies[el.studyUID].series[
              el.seriesUID
            ] = {
              data: el,
            };
          }
          seriesUIDs.push(el.seriesUID);
        });
        const seriesObj =
          treeData[projectID][patientID].studies[studyUID].series;
        const seriesArr = Object.values(seriesObj);
        if (data.length < seriesArr.length) {
          for (let series in seriesObj) {
            if (!seriesUIDs.includes(series)) {
              delete seriesObj[series];
            }
          }
        }
      }
      this.setState({ treeData });
    } catch (err) {
      console.error(err);
    }
  };

  getPidUpdate = pid => {
    this.setState({ pid });
  };

  clearTreeExpand = () => {
    this.setState({ treeExpand: {}, expandLevel: 0 });
  };

  sortLevelArr = (arr, attribute) => {
    return arr.sort(function(a, b) {
      if (a.data[attribute] < b.data[attribute]) {
        return -1;
      }
      if (a.data[attribute] > b.data[attribute]) {
        return 1;
      }
      return 0;
    });
  };

  getPatientIDfromSortedArray = (index, arr, attribute, returnVal) => {
    const sortedArr = this.sortLevelArr(arr, attribute);
    return sortedArr[index].data[returnVal];
  };

  getIndexOfPatient = (arr, patientID) => {
    let index;
    arr.forEach((el, i) => {
      if (el.data.subjectID === patientID) {
        index = i;
      }
    });
    return index;
  };

  clearTreeData = () => {
    try {
      const { pid, treeExpand } = this.state;
      const patients = { ...this.state.treeData[pid] };
      const patientsArr = Object.values(patients);

      for (let patientIndex in treeExpand) {
        // if the index is kept as false it means that
        // level opened and then closed so we need to clear data
        const patientID = this.getPatientIDfromSortedArray(
          patientIndex,
          patientsArr,
          'subjectName',
          'subjectID'
        );
        if (!treeExpand[patientIndex]) {
          // find subject id and empty studies
          patients[patientID].studies = {};
        } else {
          for (let studyIndex in treeExpand[patientIndex]) {
            if (!treeExpand[patientIndex][studyIndex]) {
              const studies = Object.values(patients[patientID].studies);
              const { studyUID } = studies[studyIndex].data;
              patients[patientID].studies[studyUID].series = {};
            }
          }
        }
      }
      const treeData = { [pid]: patients };
      this.setState({ treeData });
    } catch (err) {
      console.error(err);
    }
  };

  findNonExisting = (arr, uid, level) => {
    const result = arr.filter(el => el[level] === uid);
    return result[0];
  };

  updateTreeDataOnSave = async (refs, newLevel) => {
    try {
      this.setState({ treeData: {} });
      // const treeData = { ...this.state.treeData };
      // const { projectID, patientID, studyUID, seriesUID } = refs;
      // const isPatient = projectID && patientID;
      // const isStudy = projectID && patientID && studyUID;
      // const isSeries = projectID && patientID && studyUID && seriesUID;
      // const patient = treeData[projectID][patientID];
      // const shouldUpdateStudy =
      //   patient && Object.values(patient.studies).length > 0;
      // const shouldUpdateSeries =
      //   shouldUpdateStudy &&
      //   Object.values(patient.studies[studyUID].series).length > 0;
      // if (newLevel) {
      //   if (newLevel === "study" && isStudy && shouldUpdateStudy) {
      //     const { data: studies } = await getStudies(
      //       projectID,
      //       patientID,
      //       studyUID
      //     );
      //     let study = this.findNonExisting(studies, studyUID, "studyUID");
      //     study = { data: study, series: {} };
      //     treeData[projectID][patientID].studies[studyUID] = study;
      //   }
      //   if (newLevel === "series" && isSeries && shouldUpdateSeries) {
      //     const { data: seriesArr } = await getSeries(
      //       projectID,
      //       patientID,
      //       studyUID
      //     );
      //     let series = this.findNonExisting(seriesArr, seriesUID, "seriesUID");
      //     series = { data: series };
      //     treeData[projectID][patientID].studies[studyUID].series[
      //       seriesUID
      //     ] = series;
      //   }
      // } else {
      //   if (isPatient && treeData[projectID][patientID]) {
      //     const promises = [];
      //     promises.push(getSubject(projectID, patientID));
      //     if (isStudy && treeData[projectID][patientID].studies[studyUID])
      //       promises.push(getStudy(projectID, patientID, studyUID));
      //     if (
      //       isSeries &&
      //       treeData[projectID][patientID].studies[studyUID].series[seriesUID]
      //     )
      //       promises.push(
      //         getSingleSeries(projectID, patientID, studyUID, seriesUID)
      //       );

      //     const result = await Promise.all(promises);
      //     treeData[projectID][patientID].data = result[0].data;

      //     if (isStudy && treeData[projectID][patientID].studies[studyUID]) {
      //       treeData[projectID][patientID].studies[studyUID].data =
      //         result[1].data;
      //     }

      //     if (
      //       isSeries &&
      //       treeData[projectID][patientID].studies[studyUID].series[seriesUID]
      //     ) {
      //       treeData[projectID][patientID].studies[studyUID].series[
      //         seriesUID
      //       ].data = result[2].data[0];
      //     }
      //   }
      // }
      // this.setState({ treeData });
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    const {
      notifications,
      mode,
      progressUpdated,
      treeExpand,
      showReportsMenu,
      showWarning,
      showConfirmation,
      title,
      message,
    } = this.state;
    let noOfUnseen;
    if (notifications) {
      noOfUnseen = notifications.reduce((all, item) => {
        if (!item.seen) all += 1;
        return all;
      }, 0);
    }
    return (
      <ErrorBoundary>
        <Cornerstone />
        <ToastContainer />
        <NavBar
          user={this.state.user}
          openGearMenu={this.handleMngMenu}
          openInfoMenu={this.handleInfoMenu}
          openUser={this.handleUserProfileMenu}
          onReports={this.handleReportsClick}
          logout={this.onLogout}
          onSearchViewClick={this.switchSearhView}
          onSwitchView={this.switchView}
          viewType={this.state.viewType}
          notificationWarning={noOfUnseen}
          pid={this.state.pid}
        />
        {showReportsMenu && (
          <SelectModalMenu
            list={reportsList}
            onClick={this.handleReportSelect}
          />
        )}
        {this.state.openMng && (
          <Management
            closeMenu={this.closeMenu}
            updateProgress={this.updateProgress}
            admin={this.state.admin}
            getProjectAdded={this.getProjectAdded}
            pid={this.state.pid}
          />
        )}
        {this.state.openInfo && (
          <InfoMenu
            closeMenu={this.closeMenu}
            user={this.state.user}
            notifications={notifications}
            notificationWarning={noOfUnseen}
          />
        )}
        {this.state.openUser && (
          <UserMenu
            closeMenu={this.closeMenu}
            user={this.state.user}
            admin={this.state.admin}
          />
        )}
        {showWarning && (
          <WarningModal
            onOK={this.closeWarning}
            title={title}
            message={message}
          />
        )}
        {showConfirmation && (
          <ConfirmationModal
            title={title}
            button={'Get Report'}
            message={message}
            onSubmit={this.displayWaterfall}
            onCancel={this.closeWarning}
          />
        )}
        {this.state.reportsCompArr}
        {!this.state.authenticated && mode !== 'lite' && (
          <Route path="/login" component={LoginForm} />
        )}
        {this.state.authenticated && mode !== 'lite' && (
          <div style={{ display: 'inline', width: '100%', height: '100%' }}>
            <Sidebar
              type={this.state.viewType}
              progressUpdated={progressUpdated}
              getPidUpdate={this.getPidUpdate}
              pid={this.state.pid}
              clearTreeExpand={this.clearTreeExpand}
              projectAdded={this.state.projectAdded}
            >
              <Switch className="splitted-mainview">
                <Route path="/logout" component={Logout} />
                <ProtectedRoute
                  path="/display"
                  render={props => (
                    <DisplayView
                      {...props}
                      updateProgress={this.updateProgress}
                      pid={this.state.pid}
                      updateTreeDataOnSave={this.updateTreeDataOnSave}
                    />
                  )}
                />
                <ProtectedRoute
                  path="/search/:pid?"
                  render={props => (
                    <SearchView
                      {...props}
                      updateProgress={this.updateProgress}
                      progressUpdated={progressUpdated}
                      expandLevel={this.state.expandLevel}
                      getTreeExpandSingle={this.getTreeExpandSingle}
                      getTreeExpandAll={this.getTreeExpandAll}
                      treeExpand={treeExpand}
                      getExpandLevel={this.getExpandLevel}
                      closeBeforeDelete={this.closeBeforeDelete}
                      // expandLoading={expandLoading}
                      // updateExpandedLevelNums={this.updateExpandedLevelNums}
                      onShrink={this.handleShrink}
                      handleCloseAll={this.handleCloseAll}
                      treeData={this.state.treeData}
                      getTreeData={this.getTreeData}
                      clearTreeData={this.clearTreeData}
                      updateTreeDataOnSave={this.updateTreeDataOnSave}
                      closeAllCounter={this.state.closeAll}
                      pid={this.state.pid}
                      admin={this.state.admin}
                    />
                  )}
                />
                <ProtectedRoute
                  path="/search/:pid?"
                  render={props => (
                    <SearchView
                      {...props}
                      updateProgress={this.updateProgress}
                      progressUpdated={progressUpdated}
                      expandLevel={this.state.expandLevel}
                      getTreeExpandSingle={this.getTreeExpandSingle}
                      getTreeExpandAll={this.getTreeExpandAll}
                      treeExpand={treeExpand}
                      getExpandLevel={this.getExpandLevel}
                      closeBeforeDelete={this.closeBeforeDelete}
                      // expandLoading={expandLoading}
                      // updateExpandedLevelNums={this.updateExpandedLevelNums}
                      onShrink={this.handleShrink}
                      handleCloseAll={this.handleCloseAll}
                      treeData={this.state.treeData}
                      getTreeData={this.getTreeData}
                      clearTreeData={this.clearTreeData}
                      updateTreeDataOnSave={this.updateTreeDataOnSave}
                      closeAllCounter={this.state.closeAll}
                      pid={this.state.pid}
                      admin={this.state.admin}
                    />
                  )}
                />
                <ProtectedRoute path="/anotate" component={AnotateView} />
                <ProtectedRoute
                  path="/progress/:wid?"
                  component={ProgressView}
                />
                <ProtectedRoute
                  path="/flex/:pid?"
                  render={props => <FlexView {...props} pid={this.state.pid} />}
                />
                <ProtectedRoute path="/worklist/:wid?" component={Worklist} />
                {/* component={Worklist} /> */}
                <Route path="/tools" />
                <Route path="/edit" />
                <Route path="/not-found" component={NotFound} />
                <ProtectedRoute
                  from="/"
                  exact
                  to="/search"
                  render={props => (
                    <SearchView
                      {...props}
                      updateProgress={this.updateProgress}
                      progressUpdated={progressUpdated}
                      expandLevel={this.state.expandLevel}
                      getTreeExpandSingle={this.getTreeExpandSingle}
                      closeBeforeDelete={this.closeBeforeDelete}
                      getTreeExpandAll={this.getTreeExpandAll}
                      treeExpand={treeExpand}
                      getExpandLevel={this.getExpandLevel}
                      // expandLoading={expandLoading}
                      // updateExpandedLevelNums={this.updateExpandedLevelNums}
                      onShrink={this.handleShrink}
                      handleCloseAll={this.handleCloseAll}
                      treeData={this.state.treeData}
                      getTreeData={this.getTreeData}
                      clearTreeData={this.clearTreeData}
                      updateTreeDataOnSave={this.updateTreeDataOnSave}
                      closeAllCounter={this.state.closeAll}
                      pid={this.state.pid}
                      admin={this.state.admin}
                    />
                  )}
                />

                <Redirect to="/not-found" />
              </Switch>
              {/* {this.props.activePort === 0 ? <AnnotationsList /> : null} */}
            </Sidebar>
          </div>
        )}
        {this.state.authenticated && mode === 'lite' && (
          <Sidebar
            type={this.state.viewType}
            progressUpdated={progressUpdated}
            getPidUpdate={this.getPidUpdate}
            pid={this.state.pid}
            clearTreeExpand={this.clearTreeExpand}
            projectAdded={this.state.projectAdded}
          >
            <Switch>
              <Route path="/logout" component={Logout} />
              <ProtectedRoute
                  path="/display"
                  render={props => (
                    <DisplayView
                      {...props}
                      updateProgress={this.updateProgress}
                      pid={this.state.pid}
                      updateTreeDataOnSave={this.updateTreeDataOnSave}
                    />
                  )}
                />
              <Route path="/not-found" component={NotFound} />
              <ProtectedRoute path="/worklist/:wid?" component={Worklist} />
              <ProtectedRoute path="/progress/:wid?" component={ProgressView} />
              <ProtectedRoute
                path="/"
                render={props => (
                  <SearchView
                    {...props}
                    updateProgress={this.updateProgress}
                    progressUpdated={progressUpdated}
                    expandLevel={this.state.expandLevel}
                    getTreeExpandSingle={this.getTreeExpandSingle}
                    closeBeforeDelete={this.closeBeforeDelete}
                    getTreeExpandAll={this.getTreeExpandAll}
                    treeExpand={treeExpand}
                    getExpandLevel={this.getExpandLevel}
                    pid={this.state.pid}
                    // expandLoading={expandLoading}
                    // updateExpandedLevelNums={this.updateExpandedLevelNums}
                    onShrink={this.handleShrink}
                    handleCloseAll={this.handleCloseAll}
                    treeData={this.state.treeData}
                    getTreeData={this.getTreeData}
                    closeAllCounter={this.state.closeAll}
                    admin={this.state.admin}
                  />
                )}
              />
              <Redirect to="/not-found" />
            </Switch>
          </Sidebar>
        )}
        {this.props.showGridFullAlert && <MaxViewAlert />}
        {/* {this.props.selection && (
          <ManagementItemModal selection={this.props.selection} />
        )} */}
      </ErrorBoundary>
    );
  }
}

const mapStateToProps = state => {
  // console.log(state.managementReducer);
  // console.log(state.annotationsListReducer);
  const {
    showGridFullAlert,
    showProjectModal,
    loading,
    activePort,
    imageID,
    openSeries,
    selectedProject,
    selectedPatients,
    projectMap,
    lastEventId,
    notificationAction,
  } = state.annotationsListReducer;
  return {
    showGridFullAlert,
    showProjectModal,
    loading,
    activePort,
    imageID,
    openSeries,
    selectedProject,
    selectedPatients,
    projectMap,
    lastEventId,
    notificationAction,
    selection: state.managementReducer.selection,
  };
};
export default withRouter(connect(mapStateToProps)(App));
