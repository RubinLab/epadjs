import React, { Component } from "react";
import { Route, Switch, Redirect, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { ToastContainer } from "react-toastify";
import Keycloak from "keycloak-js";
import { getUser } from "./services/userServices";
import NavBar from "./components/navbar";
import Sidebar from "./components/sideBar/sidebar";
import SearchView from "./components/searchView/searchView";
import DisplayView from "./components/display/displayView";
// import DisplayViewContainer from "./components/display/displayViewContainer";
import AnotateView from "./components/anotateView";
import ProgressView from "./components/progressView";
import NotFound from "./components/notFound";
import LoginForm from "./components/loginForm";
import Logout from "./components/logout";
import ProtectedRoute from "./components/common/protectedRoute";
import Cornerstone from "./components/cornerstone/cornerstone";
import Management from "./components/management/mainMenu";
import InfoMenu from "./components/infoMenu";
import UserMenu from "./components/userProfileMenu";

import AnnotationList from "./components/annotationsList";
import AnnotationsDock from "./components/annotationsList/annotationDock/annotationsDock";

import auth from "./services/authService";
import MaxViewAlert from "./components/annotationsList/maxViewPortAlert";
import { isLite } from "./config.json";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

class App extends Component {
  state = {
    openMng: false,
    keycloak: null,
    authenticated: false,
    openInfo: false,
    openMenu: false,
    openUser: false
  };

  closeMenu = event => {
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
  };

  handleMngMenu = () => {
    console.log("this mng menu");
    if (this.state.openMenu) {
      this.setState({ openMng: true, openInfo: false, openUser: false });
    }
  };

  handleInfoMenu = () => {
    console.log("this info menu");
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
    console.log("this open menu");
    console.log("openMenu is ", this.state.openMenu);
    if (!this.state.openMenu) {
      console.log("openMenu was false, being set to true");
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

  async componentDidMount() {
    // when comp mount check if the user is set already. If is set then set state
    if (isLite) {
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
            user: result.userInfo.email,
            displayname: result.userInfo.given_name
          };
          await auth.login(user, null, result.keycloak.token);
          this.setState({
            keycloak: result.keycloak,
            authenticated: result.authenticated,
            id: result.userInfo.sub,
            user
          });
        })
        .catch(err => {});
    } else {
      try {
        const username = sessionStorage.getItem("username");
        if (username) {
          const { data: user } = await getUser(username);
          this.setState({ user, authenticated: true });
        }
      } catch (ex) {}
    }
    // window.addEventListener("keydown", this.closeMenu, true);
  }

  onLogout = e => {
    auth.logout();
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
  render() {
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
        />
        {this.state.openMng && this.state.openMenu && (
          <Management closeMenu={this.closeMenu} />
        )}
        {this.state.openInfo && this.state.openMenu && (
          <InfoMenu closeMenu={this.closeMenu} user={this.state.user} />
        )}
        {this.state.openUser && this.state.openMenu && (
          <UserMenu closeMenu={this.closeMenu} />
        )}
        {!this.state.authenticated && !isLite && (
          <Route path="/login" component={LoginForm} />
        )}
        {this.state.authenticated && !isLite && (
          <div style={{ display: "inline", width: "100%", height: "100%" }}>
            <Sidebar>
              <Switch className="splitted-mainview">
                <Route path="/logout" component={Logout} />
                <ProtectedRoute
                  path="/display"
                  component={DisplayView}
                  test={"test"}
                />
                <ProtectedRoute path="/search/:pid?" component={SearchView} />
                <ProtectedRoute path="/anotate" component={AnotateView} />
                <ProtectedRoute path="/progress" component={ProgressView} />
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
        {this.props.listOpen && <AnnotationList />}
        {this.props.dockOpen && <AnnotationsDock />}
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
    listOpen,
    dockOpen,
    showGridFullAlert,
    showProjectModal,
    loading,
    activePort,
    imageID
  } = state.annotationsListReducer;
  return {
    listOpen,
    dockOpen,
    showGridFullAlert,
    showProjectModal,
    loading,
    activePort,
    imageID,
    selection: state.managementReducer.selection
  };
};
export default withRouter(connect(mapStateToProps)(App));
