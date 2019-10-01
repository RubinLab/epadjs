import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Tabs, Nav, Content } from "react-tiny-tabs";
import { getProjects } from "../../services/projectServices";
import { getWorklists } from "../../services/worklistServices";
import { getPacs } from "../../services/pacsServices";
import { FiZoomIn } from "react-icons/fi";
import AnnotationsList from "./../annotationsList/annotationDock/annotationList";

import "./w2.css";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);

    this.state = {
      projects: [],
      worklists: [],
      pacs: [],
      width: "200px",
      marginLeft: "200px",
      buttonDisplay: "none",
      open: true
    };
  }

  async componentDidMount() {
    //get the porjects
    const {
      data: {
        ResultSet: { Result: projects }
      }
    } = await getProjects();
    this.setState({ projects, pId: projects[0].id });
    //get the worklists
    const {
      data: {
        ResultSet: { Result: worklists }
      }
    } = await getWorklists(sessionStorage.getItem("username"));
    this.setState({ worklists });
    const {
      data: {
        ResultSet: { Result: pacs }
      }
    } = await getPacs();
    this.setState({ pacs });
  }

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

  handleRoute(projectId) {
    this.props.history.push(`/search/${projectId}`);
  }

  render() {
    return (
      <React.Fragment>
        <div
          id="mySidebar"
          className="sidenav"
          style={{ width: this.state.width }}
        >
          <Tabs className="theme-default">
            <Nav>
              <div>
                <FiZoomIn />
              </div>
              <div>Worklist</div>
              <div>Connections</div>
              <div>Users</div>
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
                      <tr key={project.id}>
                        <td>
                          <p
                            onClick={() => {
                              this.handleRoute(project.id);
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
                    {this.state.worklists.map(worklist => (
                      <tr key={worklist.workListID}>
                        <td>
                          <p
                            onClick={() => {
                              alert("clicked");
                            }}
                          >
                            {worklist.name}
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
            height: "calc(100% - 50px)"
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
