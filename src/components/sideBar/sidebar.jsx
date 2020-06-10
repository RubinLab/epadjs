import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FiZoomIn } from "react-icons/fi";
// import { Tabs, Nav, Content } from "react-tiny-tabs";
import WorklistSelect from "./worklistSelect";
import { getProjects } from "../../services/projectServices";
import Collapsible from "react-collapsible";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import {
  getWorklistsOfAssignee,
  getWorklistsOfCreator,
  getWorklistProgress,
} from "../../services/worklistServices";
import { getProjectMap, clearSelection } from "../annotationsList/action";
// import { getPacs } from "../../services/pacsServices";
import "./w2.css";
// import { throws } from "assert";
import SidebarContent from "./sidebarContent";
const mode = sessionStorage.getItem("mode");
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";

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
      width: mode === "thick" ? "200px" : "0",
      marginLeft: mode === "thick" ? "200px" : "0",
      buttonDisplay: mode === "thick" ? "none" : "block",
      open: mode === "thick",
      index: 0,
      pid: null,
      progressView: [false, false],
      selected: null,
      type: "",
    };
  }

  componentDidMount = async () => {
    //get the porjects
    // if (mode !== "lite") {
    this.getProjectsData();
    // }
    this.getWorklistandProgressData();
  };

  getProjectsData = async () => {
    try {
      let { data: projects } = await getProjects();
      console.log("Projects", projects);
      console.log("Props", this.props);
      if (projects.length > 0) {
        // get the project all and unassigned
        // push them to the end of the projects
        let allIndex;
        let nonassignedIndex;
        let all = [];
        let nonassigned = [];
        projects.forEach((el, i) => {
          if (el.id === "all") allIndex = i;
          if (el.id === "nonassigned") nonassignedIndex = i;
        });

        if (allIndex !== undefined) all = projects.splice(allIndex, 1);

        nonassignedIndex !== undefined && nonassignedIndex > allIndex
          ? (nonassigned = projects.splice(nonassignedIndex - 1, 1))
          : (nonassigned = projects.splice(nonassignedIndex + 1, 1));

        projects = projects.concat(all, nonassigned);

        const pid = projects[0].id;
        this.setState({ projects, pid, selected: pid });
        this.props.history.push(`/search/${pid}`);
        this.props.getPidUpdate(pid);
        const projectMap = {};
        for (let project of projects) {
          let { name, defaultTemplate } = project;
          defaultTemplate = defaultTemplate === "null" ? null : defaultTemplate;
          projectMap[project.id] = {
            projectName: name,
            defaultTemplate,
          };
        }
        this.props.dispatch(getProjectMap(projectMap));
      }
    } catch (err) {
      console.log(err);
    }
  };

  getWorklistandProgressData = async () => {
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
    list.forEach((wl) => {
      promises.push(getWorklistProgress(wl.workListID));
    });
    Promise.all(promises)
      .then((data) => {
        const progressArr = data.map((el) => {
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
      .catch((err) => console.log(err));
  };

  componentDidUpdate = (prevProps) => {
    let { pathname } = this.props.location;
    const { pid } = this.props;
    if (prevProps.progressUpdated !== this.props.progressUpdated) {
      this.getWorklistandProgressData();
    }
    if (prevProps.projectAdded !== this.props.projectAdded) {
      this.getProjectsData();
    }
    if (pathname !== prevProps.location.pathname) {
      pathname = pathname.split("/").pop();
      this.setState({ selected: pathname });
    }
    if (pid !== prevProps.pid) {
      this.setState({ pid });
    }
  };

  handleClose = () => {
    this.setState({
      width: "0",
      marginLeft: "0",
      buttonDisplay: "block",
      open: false,
    });
  };

  handleOpen = () => {
    this.setState({
      width: "200px",
      marginLeft: "200px",
      buttonDisplay: "none",
      open: true,
    });
  };

  handleRoute = (type, id) => {
    let index;
    const isThick = mode === "thick";
    this.setState({ type });
    this.setState({ selected: null });
    this.props.dispatch(clearSelection());
    if (type !== "progress") {
      this.collapseAll();
    }
    if (type === "project" && this.props.type === "search") {
      this.props.history.push(`/search/${id}`);
      this.setState({ index: 0 });
      this.props.getPidUpdate(id);
      this.props.clearTreeExpand();
    } else if (type === "project" && this.props.type === "flex") {
      this.props.history.push(`/flex/${id}`);
      this.setState({ index: 0 });
    } else if (type === "worklist") {
      this.props.history.push(`/worklist/${id}`);
      index = isThick ? 1 : 0;
      this.setState({ index });
    } else if (type === "progress") {
      this.props.history.push(`/progress/${id}`);
      index = isThick ? 2 : 1;
      this.setState({ index });
      this.setState({ selected: id });
    }
  };

  handleCollapse = (index, open) => {
    const state = [...this.state.progressView];
    state[index] = open;
    this.setState({ progressView: state });
    const conditionalIndex = mode === "thick" ? 2 : 1;
    if (open) this.setState({ index: conditionalIndex });
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
        <div key="progress">Progress</div>,
      ];
    } else {
      return [
        <div onClick={this.collapseAll} key="worklist">
          Worklist
        </div>,
        <div key="progress">Progress</div>,
      ];
    }
  };

  renderProjects = () => {
    try {
      const { projects, selected } = this.state;
      let { pathname } = this.props.location;
      pathname = pathname.split("/").pop();
      // const pid = pathname.pop();
      if (mode === "thick") {
        const projectsList = projects.map((project) => {
          const matchProject =
            selected === project.id || pathname === project.id;
          const className = matchProject
            ? "sidebar-row __selected"
            : "sidebar-row";
          return (
            <tr key={project.id} className={className}>
              <td>
                <p
                  onClick={() => {
                    this.handleRoute("project", project.id);
                    this.props.getPidUpdate(project.id);
                    this.setState({ selected: project.id });
                  }}
                  style={{ padding: "0.6rem" }}
                >
                  {project.name}
                </p>
              </td>
            </tr>
          );
        });
        return (
          <SidebarContent key="projectContent">{projectsList}</SidebarContent>
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  renderWorklists = () => {
    const { type, selected } = this.state;
    const worklists = this.state.worklistsAssigned.map((worklist) => {
      const className =
        worklist.workListID === selected && type === "worklist"
          ? "sidebar-row __selected"
          : "sidebar-row";
      return (
        <tr key={worklist.workListID} className={className}>
          <td>
            <p
              onClick={() => {
                this.handleRoute("worklist", worklist.workListID);
                this.setState({ selected: worklist.workListID });
              }}
              style={{ padding: "0.6rem" }}
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

  renderProgress = () => {
    const { progressView, selected, type } = this.state;
    return (
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
            selected={selected}
            type={type}
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
            selected={selected}
            type={type}
          />
        </Collapsible>
      </div>
    );
  };

  renderContent = () => {
    if (mode === "thick") {
      return (
        <Tabs className="theme-default" settings={{ index: this.state.index }}>
          <Nav>{this.renderNav()}</Nav>
          <Content>
            <div className="testtable">{this.renderProjects()}</div>
            <div>{this.renderWorklists()}</div>
            <div>{this.renderProgress()}</div>
          </Content>
        </Tabs>
      );
    } else {
      return (
        <Tabs className="theme-default" settings={{ index: this.state.index }}>
          <Nav>{this.renderNav()}</Nav>
          <Content>
            <div>{this.renderWorklists()}</div>
            <div>{this.renderProgress()}</div>
          </Content>
        </Tabs>
      );
    }
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
          {this.renderContent()}
        </div>
        <div
          className={this.state.open ? "mainView" : "mainView-closed"}
          style={{
            marginLeft: this.state.marginLeft,
            height: "calc(100% - 50px)",
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

const mapStateToProps = (state) => {
  const { activePort } = state.annotationsListReducer;
  return {
    activePort,
  };
};
export default withRouter(connect(mapStateToProps)(Sidebar));
