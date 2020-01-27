import React, { Component } from "react";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { ToastContainer } from "react-toastify";
import { EventSourcePolyfill } from "event-source-polyfill";
import Keycloak from "keycloak-js";
import { getUser, createUser } from "./services/userServices";
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
  getNotificationsData
} from "./components/annotationsList/action";
import Worklist from "./components/sideBar/sideBarWorklist";

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
      projectMap: {},
      viewType: "search",
      lastEventId: null,
      showLog: false,
      admin: false,
      progressUpdated: 0,
      treeExpand: {}
    };
  }

  getTreeExpand = expandObj => {
    const { patient, study, series } = expandObj;
    const treeExpand = { ...this.state.treeExpand };
    let index, val;
    if (patient) {
      index = Object.keys(patient);
      index = index[0];
      val = Object.values(patient);
      val = val[0];
      treeExpand[index] = val;
    }
    if (study) {
      treeExpand[patient][study] = {};
    }
    if (series) {
      treeExpand[patient][study][series] = {};
    }

    this.setState({ treeExpand });
  };

  closeMenu = notification => {
    // if (event && event.type === "keydown") {
    //   if (event.key === 'Escape' || event.keyCode === 27) {
    //     this.setState({ openMng: false });
    //   }
    // }
    this.setState({
      openMng: false,
      openInfo: false,
      openUser: false,
      openMenu: false
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
      openUser: false
    }));
  };

  handleInfoMenu = () => {
    this.setState(state => ({
      openInfo: !state.openInfo,
      openMng: false,
      openUser: false
    }));
  };

  handleUserProfileMenu = () => {
    this.setState(state => ({
      openInfo: false,
      openMng: false,
      openUser: !state.openUser
    }));
  };

  updateProgress = () => {
    this.setState(state => ({ progressUpdated: state.progressUpdated + 1 }));
  };

  getProjectMap = projectMap => {
    this.setState({ projectMap });
  };
  async componentDidMount() {
    fetch("/config.json")
      .then(async res => {
        const data = await res.json();
        const { mode, apiUrl, wadoUrl } = data;
        sessionStorage.setItem("mode", mode);
        sessionStorage.setItem("apiUrl", apiUrl);
        sessionStorage.setItem("wadoUrl", wadoUrl);
        this.setState({ mode, apiUrl, wadoUrl });
        this.completeAutorization(apiUrl);
      })
      .catch(err => {
        console.log(err);
      });

    fetch("/keycloak.json")
      .then(async res => {
        const data = await res.json();
        const auth = data["auth-server-url"];
        sessionStorage.setItem("auth", auth);
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
    const keycloak = Keycloak("/keycloak.json");
    let keycloakInit = new Promise((resolve, reject) => {
      keycloak.init({ onLoad: "login-required" }).then(authenticated => {
        // this.setState({ keycloak: keycloak, authenticated: authenticated });
        keycloak.loadUserInfo().then(userInfo => {
          // let user = { id: userInfo.email, displayname: userInfo.given_name };
          // this.setState({
          //   name: userInfo.name,
          //   user,
          //   id: userInfo.sub
          // });
          resolve({ userInfo, keycloak, authenticated });
          // reject("Authentication failed!");
        });
      });
    });
    keycloakInit
      .then(async result => {
        let user = {
          user: result.userInfo.preferred_username || result.userInfo.email,
          displayname: result.userInfo.given_name
        };
        await auth.login(user, null, result.keycloak.token);
        this.setState({
          keycloak: result.keycloak,
          authenticated: result.authenticated,
          id: result.userInfo.sub,
          user
        });
        const {
          email,
          family_name,
          given_name,
          preferred_username
        } = result.userInfo;
        const username = preferred_username || email;

        let userData;
        try {
          userData = await getUser(username);
          this.setState({ admin: userData.data.admin });
        } catch (err) {
          // console.log(err);
          createUser(username, given_name, family_name, email)
            .then(async () => {
              {
                console.log(`User ${username} created!`);
              }
            })
            .catch(error => console.log(error));
          console.log(err);
        }

        this.eventSource = new EventSourcePolyfill(`${apiUrl}/notifications`, {
          headers: {
            authorization: `Bearer ${result.keycloak.token}`
          }
        });
        this.eventSource.addEventListener(
          "message",
          this.getMessageFromEventSrc
        );
      })
      .catch(err2 => {
        console.log(err2);
      });
  };
  getMessageFromEventSrc = res => {
    const parsedRes = JSON.parse(res.data);
    const { lastEventId } = res;
    const { params, createdtime, projectID, error } = parsedRes.notification;
    const action = parsedRes.notification.function;
    const complete = action.startsWith("Upload") || action.startsWith("Delete");
    const message = params;
    if (complete)
      this.props.dispatch(getNotificationsData(projectID, lastEventId));
    let time = new Date(createdtime).toString();
    const GMTIndex = time.indexOf(" G");
    time = time.substring(0, GMTIndex - 3);
    let notifications = [...this.state.notifications];
    notifications.unshift({
      message,
      time,
      seen: false,
      action,
      error
    });
    this.setState({ notifications });
    const stringified = JSON.stringify(notifications);
    sessionStorage.setItem("notifications", stringified);
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
      user: null
    });
    this.state.keycloak.logout().then(() => {
      this.setState({
        keycloak: null
      });
      auth.logout();
    });
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

  render() {
    const { notifications, mode, progressUpdated, treeExpand } = this.state;
    let noOfUnseen;
    if (notifications) {
      noOfUnseen = notifications.reduce((all, item) => {
        if (!item.seen) all += 1;
        return all;
      }, 0);
    }
    return (
      <React.Fragment>
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
        />
        {this.state.openMng && (
          <Management
            closeMenu={this.closeMenu}
            projectMap={this.state.projectMap}
            updateProgress={this.updateProgress}
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
            <Sidebar onData={this.getProjectMap} type={this.state.viewType}>
              <Switch className="splitted-mainview">
                <Route path="/logout" component={Logout} />
                <ProtectedRoute
                  path="/display"
                  component={DisplayView}
                  test={"test"}
                />
                <ProtectedRoute
                  path="/search/:pid?"
                  render={props => (
                    <SearchView
                      {...props}
                      updateProgress={this.updateProgress}
                      progressUpdated={progressUpdated}
                    />
                  )}
                />
                <ProtectedRoute path="/anotate" component={AnotateView} />
                <ProtectedRoute
                  path="/progress/:wid?"
                  component={ProgressView}
                />
                <ProtectedRoute path="/flex/:pid?" component={FlexView} />
                <ProtectedRoute path="/worklist/:wid?" component={Worklist} />
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
          <Switch>
            <Route path="/logout" component={Logout} />
            <ProtectedRoute path="/display" component={DisplayView} />
            <Route path="/not-found" component={NotFound} />
            <ProtectedRoute
              path="/"
              render={props => (
                <SearchView
                  {...props}
                  updateProgress={this.updateProgress}
                  progressUpdated={progressUpdated}
                  getTreeExpand={this.getTreeExpand}
                  treeExpand={treeExpand}
                />
              )}
            />
            <Redirect to="/not-found" />
          </Switch>
        )}
        {this.props.showGridFullAlert && <MaxViewAlert />}
        {/* {this.props.selection && (
          <ManagementItemModal selection={this.props.selection} />
        )} */}
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  // console.log(state.annotationsListReducer);
  // console.log(state.managementReducer);
  const {
    showGridFullAlert,
    showProjectModal,
    loading,
    activePort,
    imageID
  } = state.annotationsListReducer;
  return {
    showGridFullAlert,
    showProjectModal,
    loading,
    activePort,
    imageID,
    selection: state.managementReducer.selection
  };
};
export default withRouter(connect(mapStateToProps)(App));
