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
import UserMenu from "./components/userProfileMenu";
import AnnotationList from "./components/annotationsList";
// import AnnotationsDock from "./components/annotationsList/annotationDock/annotationsDock";
import auth from "./services/authService";
import MaxViewAlert from "./components/annotationsList/maxViewPortAlert";
import { isLite, apiUrl } from "./config.json";
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
      openMenu: false,
      openUser: false,
      projectMap: {},
      viewType: "search",
      lastEventId: null,
      showLog: false
    };
  }

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
    if (this.state.openMenu) {
      this.setState({ openMng: true, openInfo: false, openUser: false });
    }
  };

  handleInfoMenu = () => {
    if (this.state.openMenu) {
      this.setState({ openInfo: true, openMng: false, openUser: false });
    }
  };

  handleUserProfileMenu = () => {
    if (this.state.openMenu) {
      this.setState({ openUser: true, openInfo: false, openMng: false });
    }
  };
  handleOpenMenu = e => {
    if (!this.state.openMenu) {
      this.setState({ openMenu: true });
      if (e.target.dataset.name === "mng") {
        this.setState({ openMng: true });
      } else if (e.target.dataset.name === "info") {
        this.setState({ openInfo: true });
      } else if (e.target.dataset.name === "user") {
        this.setState({ openUser: true });
      }
    } else {
      this.setState({ openMenu: false });
      this.setState({ openMng: false, openInfo: false, openUser: false });
    }
  };

  getProjectMap = projectMap => {
    this.setState({ projectMap });
  };
  async componentDidMount() {
    // when comp mount check if the user is set already. If is set then set state
    // if (isLite) {

    //get notifications from sessionStorage and setState
    let notifications = sessionStorage.getItem("notifications");
    if (!notifications) {
      sessionStorage.setItem("notifications", JSON.stringify([]));
      this.setState({ notifications: [] });
    } else {
      notifications = JSON.parse(notifications);
      this.setState({ notifications });
    }

    const keycloak = Keycloak("/keycloak.json");
    let user;
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
        } catch (err) {
          createUser(username, given_name, family_name, email)
            .then(async () => {
              {
                userData = await getUser(email);
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
    // } else {
    //   try {
    //     const username = sessionStorage.getItem("username");
    //     if (username) {
    //       const { data: user } = await getUser(username);
    //       this.setState({ user, authenticated: true });
    //     }
    //   } catch (ex) {}
    // }
    // window.addEventListener("keydown", this.closeMenu, true);
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  getMessageFromEventSrc = res => {
    const parsedRes = JSON.parse(res.data);
    const { lastEventId } = res;
    const { params, createdtime, projectID, error } = parsedRes.notification;
    const upload = parsedRes.notification.function.startsWith("Upload");
    const message = params;
    if (upload)
      this.props.dispatch(getNotificationsData(projectID, lastEventId));
    let time = new Date(createdtime).toString();
    const GMTIndex = time.indexOf(" G");
    time = time.substring(0, GMTIndex - 3);
    let notifications = [...this.state.notifications];
    notifications.unshift({
      message,
      time,
      seen: false,
      action: parsedRes.notification.function,
      error
    });
    this.setState({ notifications });
    const stringified = JSON.stringify(notifications);
    sessionStorage.setItem("notifications", stringified);
  };

  componentWillUnmount = () => {
    document.removeEventListener("mousedown", this.handleClickOutside);
    this.eventSource.removeEventListener(
      "message",
      this.getMessageFromEventSrc
    );
  };

  handleClickOutside = event => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.handleOpenMenu(event);
    }
  };

  setWrapperRef = node => {
    this.wrapperRef = node;
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
    const { notifications } = this.state;
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
          openMenu={this.handleOpenMenu}
          onSearchViewClick={this.switchSearhView}
          onSwitchView={this.switchView}
          viewType={this.state.viewType}
          notificationWarning={noOfUnseen}
        />
        {this.state.openMng && this.state.openMenu && (
          <div ref={this.setWrapperRef}>
            <Management
              closeMenu={this.closeMenu}
              projectMap={this.state.projectMap}
            />
          </div>
        )}
        {this.state.openInfo && this.state.openMenu && (
          <div ref={this.setWrapperRef}>
            <InfoMenu
              closeMenu={this.closeMenu}
              user={this.state.user}
              notifications={notifications}
              notificationWarning={noOfUnseen}
            />
          </div>
        )}
        {!isLite && this.state.openUser && this.state.openMenu && (
          <div ref={this.setWrapperRef}>
            <UserMenu closeMenu={this.closeMenu} user={this.state.user} />
          </div>
        )}
        {!this.state.authenticated && !isLite && (
          <Route path="/login" component={LoginForm} />
        )}
        {this.state.authenticated && !isLite && (
          <div style={{ display: "inline", width: "100%", height: "100%" }}>
            <Sidebar onData={this.getProjectMap} type={this.state.viewType}>
              <Switch className="splitted-mainview">
                <Route path="/logout" component={Logout} />
                <ProtectedRoute
                  path="/display"
                  component={DisplayView}
                  test={"test"}
                />
                <ProtectedRoute path="/search/:pid?" component={SearchView} />
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
                  component={SearchView}
                />

                <Redirect to="/not-found" />
              </Switch>
              {/* {this.props.activePort === 0 ? <AnnotationsList /> : null} */}
            </Sidebar>
          </div>
        )}
        {this.state.authenticated && isLite && (
          <Switch>
            <Route path="/logout" component={Logout} />
            <ProtectedRoute path="/display" component={DisplayView} />
            <Route path="/not-found" component={NotFound} />
            <ProtectedRoute path="/" component={SearchView} />
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
  console.log(state.annotationsListReducer);
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
