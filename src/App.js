import React, { Component } from "react";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { ToastContainer } from "react-toastify";
import { EventSourcePolyfill } from "event-source-polyfill";
import Keycloak from "keycloak-js";
import { getUser, getUserInfo } from "./services/userServices";
import NavBar from "./components/navbar";
import Sidebar from "./components/sideBar/sidebar";
import SearchView from "./components/searchView/searchView";
import DisplayView from "./components/display/displayView";
import AnotateView from "./components/anotateView";
import ProgressView from "./components/progressView";
import FlexView from "./components/flexView";
import NotFound from "./components/notFound";
import LoginForm from "./components/loginForm";
import Logout from "./components/logout";
import ProtectedRoute from "./components/common/protectedRoute";
import Cornerstone from "./components/cornerstone/cornerstone";
import Management from "./components/management/mainMenu";
import InfoMenu from "./components/infoMenu";
import UserMenu from "./components/userProfileMenu.jsx";
import AnnotationList from "./components/annotationsList";
// import AnnotationsDock from "./components/annotationsList/annotationDock/annotationsDock";
import auth from "./services/authService";
import MaxViewAlert from "./components/annotationsList/maxViewPortAlert";
import {
  clearAimId,
  getNotificationsData,
} from "./components/annotationsList/action";
import Worklist from "./components/sideBar/sideBarWorklist";
import ErrorBoundary from "./ErrorBoundary";
import { getSubjects, getSubject } from "./services/subjectServices";
import { getStudies, getStudy } from "./services/studyServices";
import { getSeries, getSingleSeries } from "./services/seriesServices";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

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
      viewType: "search",
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
      console.log(err);
    }
  };

  closeBeforeDelete = (level, ids) => {
    return new Promise((resolve, reject) => {
      try {
        const treeExpand = { ...this.state.treeExpand };
        if (level === "patientID") {
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
      console.log(err);
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
        sessionStorage.setItem("mode", mode);
        sessionStorage.setItem("apiUrl", apiUrl);
        sessionStorage.setItem("wadoUrl", wadoUrl);
        sessionStorage.setItem("authMode", authMode);
        this.setState({ mode, apiUrl, wadoUrl, authMode });
        const keycloakData = await results[1].json();
        const auth =
          process.env.REACT_APP_AUTH_URL || keycloakData["auth-server-url"];
        const keycloakJson = {};
        // check and use environment variables if any
        keycloakJson.realm =
          process.env.REACT_APP_AUTH_REALM || keycloakData.realm;
        keycloakJson.url =
          process.env.REACT_APP_AUTH_URL || keycloakData["auth-server-url"];
        keycloakJson.clientId =
          process.env.REACT_APP_AUTH_RESOURCE || keycloakData.resource;
        sessionStorage.setItem("auth", auth);
        sessionStorage.setItem("keycloakJson", JSON.stringify(keycloakJson));
        this.completeAutorization(apiUrl);
      })
      .catch(err => {
        console.log(err);
      });
    //get notifications from sessionStorage and setState
    let notifications = sessionStorage.getItem("notifications");
    if (!notifications) {
      sessionStorage.setItem("notifications", JSON.stringify([]));
      this.setState({ notifications: [] });
    } else {
      notifications = JSON.parse(notifications);
      this.setState({ notifications });
    }
  }

  completeAutorization = apiUrl => {
    let getAuthUser = null;

    if (sessionStorage.getItem("authMode") !== "external") {
      const keycloak = Keycloak(
        JSON.parse(sessionStorage.getItem("keycloakJson"))
      );
      getAuthUser = new Promise((resolve, reject) => {
        keycloak
          .init({ onLoad: "login-required" })
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
            console.log(err);
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
            "message",
            this.getMessageFromEventSrc
          );
        } catch (err) {
          console.log("Error in user retrieval!", err);
        }
      })
      .catch(err2 => {
        console.log("Authentication failed!", err2);
      });
  };

  getMessageFromEventSrc = res => {
    try {
      if (res.data === "heartbeat") {
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
          getNotificationsData(projectID, lastEventId, refresh)
        );
      let time = new Date(createdtime).toString();
      const GMTIndex = time.indexOf(" G");
      time = time.substring(0, GMTIndex - 3);
      let notifications = [...this.state.notifications];
      notifications.unshift({
        message,
        time,
        seen: false,
        action,
        error,
      });
      this.setState({ notifications });
      const stringified = JSON.stringify(notifications);
      sessionStorage.setItem("notifications", stringified);
    } catch (err) {
      console.log(err);
    }
  };

  componentWillUnmount = () => {
    this.eventSource.removeEventListener(
      "message",
      this.getMessageFromEventSrc
    );
  };

  onLogout = e => {
    auth.logout();
    // sessionStorage.removeItem("annotations");
    sessionStorage.setItem("notifications", JSON.stringify([]));
    this.setState({
      authenticated: false,
      id: null,
      name: null,
      user: null,
    });
    if (sessionStorage.getItem("authMode") !== "external")
      this.state.keycloak.logout().then(() => {
        this.setState({
          keycloak: null,
        });
        auth.logout();
      });
    else console.log("No logout in external authentication mode");
  };

  updateNotificationSeen = () => {
    const notifications = [...this.state.notifications];
    notifications.forEach(notification => {
      notification.seen = true;
    });
    this.setState({ notifications });
    const stringified = JSON.stringify(notifications);
    sessionStorage.setItem("notifications", stringified);
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
      if (level === "subject") {
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
      } else if (level === "studies") {
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
      } else if (level === "series") {
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
      console.log("getTreeData operation --", err);
    }
  };

  getPidUpdate = pid => {
    this.setState({ pid });
  };

  clearTreeExpand = () => {
    this.setState({ treeExpand: {}, expandLevel: 0 });
  };

  clearTreeData = () => {
    const { pid } = this.state;
    const treeData = { [pid]: { ...this.state.treeData[pid] } };
    this.setState({ treeData });
  };

  updateTreeDataOnAimSave = async () => {
    const { openSeries, activePort } = this.props;
    const treeData = { ...this.state.treeData };
    const { projectID, patientID, studyUID, seriesUID } = openSeries[
      activePort
    ];

    if (treeData[projectID][patientID]) {
      const promises = [];
      promises.push(getSubject(projectID, patientID));
      if (treeData[projectID][patientID].studies[studyUID])
        promises.push(getStudy(projectID, patientID, studyUID));
      if (treeData[projectID][patientID].studies[studyUID].series[seriesUID])
        promises.push(
          getSingleSeries(projectID, patientID, studyUID, seriesUID)
        );

      const result = await Promise.all(promises);
      treeData[projectID][patientID].data = result[0].data;

      if (treeData[projectID][patientID].studies[studyUID]) {
        treeData[projectID][patientID].studies[studyUID].data = result[1].data;
      }

      if (treeData[projectID][patientID].studies[studyUID].series[seriesUID]) {
        treeData[projectID][patientID].studies[studyUID].series[
          seriesUID
        ].data = result[2].data[0];
      }
    }
    this.setState({ treeData });
  };

  render() {
    const {
      notifications,
      mode,
      progressUpdated,
      treeExpand,
      expandLevel,
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
          logout={this.onLogout}
          onSearchViewClick={this.switchSearhView}
          onSwitchView={this.switchView}
          viewType={this.state.viewType}
          notificationWarning={noOfUnseen}
          pid={this.state.pid}
        />
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
        {!this.state.authenticated && mode !== "lite" && (
          <Route path="/login" component={LoginForm} />
        )}
        {this.state.authenticated && mode !== "lite" && (
          <div style={{ display: "inline", width: "100%", height: "100%" }}>
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
                      updateTreeDataOnAimSave={this.updateTreeDataOnAimSave}
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
                      closeAllCounter={this.state.closeAll}
                      pid={this.state.pid}
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
                      closeAllCounter={this.state.closeAll}
                      pid={this.state.pid}
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
                      closeAllCounter={this.state.closeAll}
                      pid={this.state.pid}
                    />
                  )}
                />

                <Redirect to="/not-found" />
              </Switch>
              {/* {this.props.activePort === 0 ? <AnnotationsList /> : null} */}
            </Sidebar>
          </div>
        )}
        {this.state.authenticated && mode === "lite" && (
          <Sidebar type={this.state.viewType} progressUpdated={progressUpdated}>
            <Switch>
              <Route path="/logout" component={Logout} />
              <ProtectedRoute path="/display" component={DisplayView} />
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
                    // expandLoading={expandLoading}
                    // updateExpandedLevelNums={this.updateExpandedLevelNums}
                    onShrink={this.handleShrink}
                    handleCloseAll={this.handleCloseAll}
                    treeData={this.state.treeData}
                    getTreeData={this.getTreeData}
                    closeAllCounter={this.state.closeAll}
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
  console.log(state.annotationsListReducer);
  // console.log(state.managementReducer);
  const {
    showGridFullAlert,
    showProjectModal,
    loading,
    activePort,
    imageID,
    openSeries,
  } = state.annotationsListReducer;
  return {
    showGridFullAlert,
    showProjectModal,
    loading,
    activePort,
    imageID,
    openSeries,
    selection: state.managementReducer.selection,
  };
};
export default withRouter(connect(mapStateToProps)(App));
