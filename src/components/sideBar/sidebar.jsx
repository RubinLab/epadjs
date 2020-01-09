import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FiZoomIn } from "react-icons/fi";
import { Tabs, Nav, Content } from "react-tiny-tabs";
import WorklistSelect from "./worklistSelect";
import { getProjects } from "../../services/projectServices";
import Collapsible from "react-collapsible";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import {
  getWorklistsOfAssignee,
  getWorklistsOfCreator,
  getWorklistProgress
} from "../../services/worklistServices";
// import { getPacs } from "../../services/pacsServices";
import "./w2.css";
// import { throws } from "assert";
import SidebarContent from "./sidebarContent";
const mode = sessionStorage.getItem("mode");

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleRoute = this.handleRoute.bind(this);

    this.state = {
      projects: [],
      worklistsAssigned: [],
      worklistsCreated: [],
      pacs: [],
      width: "200px",
      marginLeft: "200px",
      buttonDisplay: "none",
      open: true,
      index: 0,
      pId: null,
      progressView: [false, false]
    };
  }

  componentDidMount = async () => {
    //get the porjects
    if (mode !== "lite") {
      const { data: projects } = await getProjects();
      if (projects.length > 0) {
        this.setState({ projects, pId: projects[0].id });
        const projectMap = {};
        for (let project of projects) {
          projectMap[project.id] = project.name;
        }
        this.props.onData(projectMap);
      }
    }
    const { data: worklistsAssigned } = await getWorklistsOfAssignee(
      sessionStorage.getItem("username")
    );
    const { data: worklistsCreated } = await getWorklistsOfCreator();
    this.getProgressTotal(worklistsCreated, "worklistsCreated");
    this.getProgressTotal(worklistsAssigned, "worklistsAssigned");
  };

  getProgressTotal = (list, attribute) => {
    const promises = [];
    const result = [...list];
    list.forEach(wl => {
      promises.push(getWorklistProgress(wl.workListID));
    });
    Promise.all(promises)
      .then(data => {
        const progressArr = data.map(el => {
          return el.data;
        });
        let total;
        progressArr.forEach((el, i) => {
          total = el.reduce((all, item, index) => {
            return (all += item.completeness);
          }, 0);
          const mean = total / el.length;
          result[i] = { ...result[i], progress: mean };
        });
        this.setState({ [attribute]: result });
      })
      .catch(err => console.log(err));
  };
  componentDidUpdate = prevProps => {};

  handleClose = () => {
    this.setState({
      width: "0",
      marginLeft: "0",
      buttonDisplay: "block",
      open: false
    });
  };

  handleOpen = () => {
    this.setState({
      width: "200px",
      marginLeft: "200px",
      buttonDisplay: "none",
      open: true
    });
  };

  handleRoute = (type, id) => {
    console.log(type);
    if (type !== "progress") {
      this.collapseAll();
    }
    if (type === "project" && this.props.type === "search") {
      this.props.history.push(`/search/${id}`);
      this.setState({ index: 0 });
    } else if (type === "project" && this.props.type === "flex") {
      this.props.history.push(`/flex/${id}`);
      this.setState({ index: 0 });
    } else if (type === "worklist") {
      this.props.history.push(`/worklist/${id}`);
      this.setState({ index: 1 });
    } else if (type === "progress") {
      this.props.history.push(`/progress/${id}`);
      this.setState({ index: 2 });
    }
  };

  handleCollapse = (index, open) => {
    const state = [...this.state.progressView];
    state[index] = open;
    this.setState({ progressView: state });
    if (open) this.setState({ index: 2 });
  };

  collapseAll = () => {
    const progressView = [false, false];
    this.setState({ progressView });
  };

  renderNav = () => {
    if (mode === "thick") {
      return [
        <div onClick={this.collapseAll} key="project">
          <FiZoomIn />
        </div>,
        <div onClick={this.collapseAll} key="worklist">
          Worklist
        </div>,
        <div key="progress">Progress</div>
      ];
    } else {
      return [
        <div onClick={this.collapseAll} key="worklist">
          Worklist
        </div>,
        <div key="progress">Progress</div>
      ];
    }
  };

  renderProjects = () => {
    const projects = this.state.projects.map(project => (
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
    ));
    return <SidebarContent key="projectContent">{projects}</SidebarContent>;
  };

  renderWorklists = () => {
    const worklists = this.state.worklistsAssigned.map(worklist => {
      const className = worklist.projectIDs.length
        ? "sidebar-row __bold"
        : "sidebar-row";
      // const className = "this";
      return (
        <tr key={worklist.workListID} className={className}>
          <td>
            <p
              onClick={() => {
                this.handleRoute("worklist", worklist.workListID);
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
    });
    return <SidebarContent key="worklistContent">{worklists}</SidebarContent>;
  };

  renderContent = () => {
    let projects, worklists, progress;
    const isThick = mode === "thick";
    if (isThick) {
      projects = this.renderProjects();
    }
    worklists = this.renderWorklists();
    return isThick ? [projects, worklists] : [worklists];
  };

  render = () => {
    const { progressView } = this.state;
    return (
      <React.Fragment>
        <div
          id="mySidebar"
          className="sidenav"
          style={{ width: this.state.width }}
        >
          <button
            to="#"
            className="closebtn __leftBar"
            onClick={this.handleClose}
          >
            <FaArrowAltCircleLeft />
          </button>
          <Tabs
            className="theme-default"
            settings={{ index: this.state.index }}
          >
            <Nav>{this.renderNav()}</Nav>
            <Content>
              <div>{this.renderContent()}</div>
              <div>
                <Collapsible
                  trigger="Created by me"
                  onOpen={() => this.handleCollapse(0, true)}
                  onClose={() => this.handleCollapse(0, false)}
                  open={progressView[0]}
                >
                  <WorklistSelect
                    list={this.state.worklistsCreated}
                    handleRoute={this.handleRoute}
                  />
                </Collapsible>
                <Collapsible
                  trigger="Assigned to me"
                  onOpen={() => this.handleCollapse(1, true)}
                  onClose={() => this.handleCollapse(1, false)}
                  open={progressView[1]}
                >
                  <WorklistSelect
                    list={this.state.worklistsAssigned}
                    handleRoute={this.handleRoute}
                  />
                </Collapsible>
              </div>
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
  };
}

const mapStateToProps = state => {
  const { activePort } = state.annotationsListReducer;
  return {
    activePort
  };
};
export default withRouter(connect(mapStateToProps)(Sidebar));
