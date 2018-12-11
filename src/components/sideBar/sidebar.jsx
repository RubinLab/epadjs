import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { Tabs, Nav, Content } from "react-tiny-tabs";
import { getProjects } from "../../services/projectsService";
import { FiZoomIn } from "react-icons/fi";
import "./w2.css";

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);

    this.state = {
      projects: [],
      width: "200px",
      marginLeft: "200px",
      buttonDisplay: "none",
      open: true
    };
  }

  async componentDidMount() {
    const {
      data: {
        ResultSet: { Result: projects }
      }
    } = await getProjects();
    this.setState({ projects, pId: projects[0].id });
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
              <div>Connections</div>
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
        </div>
      </React.Fragment>
    );
  }
}

export default withRouter(Sidebar);
