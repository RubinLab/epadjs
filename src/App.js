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
import AnnotationList from "./components/annotationsList";
import AnnotationsDock from "./components/annotationsList/annotationDock/annotationsDock";
import AnnotationsList from "./components/annotationsList/annotationDock/annotationList";
import ManagementItemModal from "./components/management/common/customModal";

import auth from "./services/authService";
import MaxViewAlert from "./components/annotationsList/maxViewPortAlert";
import ProjectModal from "./components/annotationsList/selectSerieModal";
import { isLite } from "./config.json";
// import Modal from './components/management/projectCreationForm';
// import Modal from './components/common/rndBootModal';

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

class App extends Component {
  state = {
    isMngMenuOpen: false,
    keycloak: null,
    authenticated: false
  };

  closeMenu = event => {
    // if (event && event.type === "keydown") {
    //   if (event.key === 'Escape' || event.keyCode === 27) {
    //     this.setState({ isMngMenuOpen: false });
    //   }
    // }
    this.setState({ isMngMenuOpen: false });
  };

  openMenu = () => {
    this.setState(state => ({ isMngMenuOpen: !state.isMngMenuOpen }));
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
        .catch(err => {
          console.log(err);
        });
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

  componentWillUnmount = () => {
    // window.removeEventListener('keydown', this.closeMenu, true);
  };

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
          openGearMenu={this.openMenu}
          logout={this.onLogout}
        />
        {this.state.isMngMenuOpen && <Management closeMenu={this.closeMenu} />}

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
