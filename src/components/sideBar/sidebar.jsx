import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Tabs, Nav, Content } from "react-tiny-tabs";
import { getProjects } from "../../services/projectServices";
import { getWorklistsOfAssignee } from "../../services/worklistServices";
import { getPacs } from "../../services/pacsServices";
import { FiZoomIn } from "react-icons/fi";
import "./w2.css";
import { throws } from "assert";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleRoute = this.handleRoute.bind(this);

    this.state = {
      projects: [],
      worklists: [],
      pacs: [],
      width: "200px",
      marginLeft: "200px",
      buttonDisplay: "none",
      open: true,
      index: 0
    };
  }

  async componentDidMount() {
    //get the porjects
    const { data: projects } = await getProjects();
    this.setState({ projects, pId: projects[0].id });
    //get the worklists
    const projectMap = {};
    for (let project of projects) {
      projectMap[project.id] = project.name;
    }

    this.props.onData(projectMap);
    const {
      data: {
        ResultSet: { Result: worklists }
      }
    } = await getWorklistsOfAssignee(sessionStorage.getItem("username"));
    this.setState({ worklists });
    const {
      data: {
        ResultSet: { Result: pacs }
      }
    } = await getPacs();
    this.setState({ pacs });
  }

  componentDidUpdate = prevProps => {
    if (
      this.props.history.location.pathname.includes("worklist") &&
      this.state.index !== 1
    ) {
      this.setState({ index: 1 });
    }
  };

  handleClose() {
    this.setState({
      width: "0",
      marginLeft: "0",
      buttonDisplay: "block",
      open: false
    });
  }

  handleOpen() {
    this.setState({
      width: "200px",
      marginLeft: "200px",
      buttonDisplay: "none",
      open: true
    });
  }

  handleRoute(type, id) {
    if (type === "project") {
      this.props.history.push(`/search/${id}`);
      this.setState({ index: 0 });
    } else if (type === "worklist") {
      this.props.history.push(`/worklist/${id}`);
      this.setState({ index: 1 });
    }
  }

  updateState = () => {
    this.setState({ index: 1 });
  };

  render() {
    return (
      <React.Fragment>
        <div
          id="mySidebar"
          className="sidenav"
          style={{ width: this.state.width }}
        >
          <Tabs
            className="theme-default"
            settings={{ index: this.state.index }}
          >
            <Nav>
              <div>
                <FiZoomIn />
              </div>
              <div>Worklist</div>
              {/* <div>Connections</div> */}
              {/* <div>Users</div> */}
            </Nav>
            <Content>
              <div>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <button
                          to="#"
                          className="closebtn"
                          onClick={this.handleClose}
                        >
                          Close &times;
                        </button>
                      </td>
                    </tr>
                    {this.state.projects.map(project => (
                      <tr key={project.id} className="sidebar-row">
                        <td>
                          <p
                            onClick={() => {
                              this.handleRoute("project", project.id);
                            }}
                          >
                            {project.name}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <button
                          to="#"
                          className="closebtn"
                          onClick={this.handleClose}
                        >
                          Close &times;
                        </button>
                      </td>
                    </tr>
                    {this.state.worklists.map(worklist => {
                      const className = worklist.projectIDs.length
                        ? "sidebar-row __bold"
                        : "sidebar-row";
                      return (
                        <tr key={worklist.workListID} className={className}>
                          <td>
                            <p
                              onClick={() => {
                                this.handleRoute(
                                  "worklist",
                                  worklist.workListID
                                );
                              }}
                            >
                              {worklist.name}
                              {worklist.projectIDs.length ? (
                                <span className="badge badge-secondary worklist">
                                  {worklist.projectIDs.length}
                                </span>
                              ) : null}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <button
                          to="#"
                          className="closebtn"
                          onClick={this.handleClose}
                        >
                          Close &times;
                        </button>
                      </td>
                    </tr>
                    {this.state.pacs.map(pac => (
                      <tr key={pac.pacID}>
                        <td>
                          <p
                            onClick={() => {
                              alert("clicked");
                            }}
                          >
                            {pac.aeTitle}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>Users</div>
            </Content>
          </Tabs>
        </div>
        <div
          className={this.state.open ? "mainView" : "mainView-closed"}
          style={{
            marginLeft: this.state.marginLeft,
            height: "calc(100% - 50px"
          }}
        >
          <button
            id="openNav"
            style={{ display: this.state.buttonDisplay }}
            onClick={this.handleOpen}
          >
            &#9776;
          </button>
          {this.props.children}
          {/* {this.props.activePort !== null ? <AnnotationsList /> : null} */}
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const { activePort } = state.annotationsListReducer;
  return {
    activePort
  };
};
export default withRouter(connect(mapStateToProps)(Sidebar));
