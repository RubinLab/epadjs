import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { FiZoomIn } from "react-icons/fi";
import { BsArrowBarLeft, BsArrowBarRight } from "react-icons/bs";
import WorklistSelect from "./worklistSelect";
import { getProjects } from "../../services/projectServices";
import {
  getTemplatesUniversal, 
} from "../../services/templateServices";
import Collapsible from "react-collapsible";
import {
  getWorklistsOfAssignee,
  getWorklistsOfCreator,
  getWorklistProgress
} from "../../services/worklistServices";
import {
  getProjectMap,
  clearSelection,
  getTemplates,
  setLastLocation
} from "../annotationsList/action";
import "./style.css";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import './style.css';
import { resetSelectAllCheckbox } from '../../Utils/aid.js';

let mode;

class Sidebar extends Component {
  constructor(props) {
    super(props);
    mode = sessionStorage.getItem("mode");
    this.handleRoute = this.handleRoute.bind(this);

    this.state = {
      projects: [],
      worklistsAssigned: [],
      worklistsCreated: [],
      pacs: [],
      width: '30px',
      tabMarginLeft: "0px",
      marginLeft: '30px',
      buttonDisplay: mode !== "lite" ? "none" : "block",
      open: false,
      index: 0,
      pid: null,
      progressView: [false, false],
      selected: null,
      type: "",
      height: 200,
      tab: 'projects',
      shouldGetProgress: true
    };
  }

  componentDidMount = async () => {
    mode = sessionStorage.getItem("mode");
    try {
      const projects = await this.getProjectsData();
      this.setStateProjectData(projects, true);
    } catch (error) {
      console.error(error);
    }
    window.addEventListener("refreshProjects", this.refreshProjects);
  };

  setTabHeight = () => {
    const navbar = document.getElementsByClassName("navbar")[0].clientHeight;
    const closebtn = document.getElementsByClassName("closebtn __leftBar")[0]
      .clientHeight;
    const navTabs = document.getElementsByClassName("nav-tabs")[0].clientHeight;
    const windowInner = window.innerHeight;
    const height = windowInner - navTabs - closebtn - navbar - 10;
    this.setState({ height });
  };

  componentWillUnmount = () => {
    window.removeEventListener("refreshProjects", this.refreshProjects);
  };

  refreshProjects = async (event) => {
    const projects = await this.getProjectsData();
    const pid = event ? event.detail : null;
    this.setStateProjectData(projects, true, pid);
  }

  getProjectsData = async () => {
    try {
      let { data: projects } = await getProjects();
      if (projects.length > 0) {
        let allIndex;
        let nonassignedIndex;
        let all = [];
        let nonassigned = [];
        if (mode !== 'teaching') {
          projects.forEach((el, i) => {
            if (el.id === "all") allIndex = i;
            if (el.id === "nonassigned") nonassignedIndex = i;
          });

          if (allIndex !== undefined) all = projects.splice(allIndex, 1);

          nonassignedIndex !== undefined && nonassignedIndex > allIndex
            ? (nonassigned = projects.splice(nonassignedIndex - 1, 1))
            : (nonassigned = projects.splice(nonassignedIndex + 1, 1));

          projects = projects.concat(all, nonassigned);
        }

        const prTempMap = await this.getTemplatesProjectMap();
        const projectMap = {};
        for (let project of projects) {
          let { name, defaultTemplate } = project;
          defaultTemplate = defaultTemplate === "null" ? null : defaultTemplate;
          projectMap[project.id] = {
            projectName: name,
            defaultTemplate,
            templates: prTempMap[project.id] || []
          };
        }
        this.props.dispatch(getProjectMap(projectMap));
        this.props.dispatch(getTemplates());
        return projects;
      }
    } catch (err) {
      console.error(err);
    }
  };

  setStateProjectData = (projects, setPid, pidTojump) => {
    const paths = ['list', 'search', 'flex'];
    let { pathname } = this.props.location;
    const pathParts = pathname.split('/');
    pathname = pathParts.pop();
    const view = pathParts.pop();
    this.setState({ projects });
    if (this.props.openSeries.length === 0 && setPid) {
      // check if url has a valid pid
      pathname = this.props.projectMap[pathname] ? pathname : null;
      let pid = pidTojump || pathname || projects[0].id
      this.setState({ pid, selected: pid });
      if (mode !== 'teaching') {
        const prev = paths.includes(view) ? view : 'list';
        this.props.history.push(`/${prev}/${pid}`);
      }
      if (mode === 'teaching') this.props.history.push(`/search/${pid}`);
      this.props.getPidUpdate(pid);
    }
  };

  getTemplatesProjectMap = async () => {
    const prTempMap = {};
    try {
      const { data: templates } = await getTemplatesUniversal();
      for (let template of templates) {
        const tempCode = template.Template[0].templateCodeValue;
        if (template.projects) {
          for (let project of template.projects) {
            prTempMap[project]
              ? prTempMap[project].push(tempCode)
              : (prTempMap[project] = [tempCode]);
          }
        }
      }
      return prTempMap;
    } catch (err) {
      console.error("getting templates for projects", err);
      return prTempMap;
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
      .catch(err => console.error(err));
  };

  componentDidUpdate = async prevProps => {
    try {
      let { pathname } = this.props.location;
      const { pid, lastEventId, refresh, notificationAction } = this.props;
      const tagEdited = notificationAction.startsWith("Tag");
      const notSideBarUpdate = tagEdited;
      let projects;
      if (prevProps.progressUpdated !== this.props.progressUpdated) {
        this.getWorklistandProgressData();
      }
      if (prevProps.projectAdded !== this.props.projectAdded) {
        projects = await this.getProjectsData();
        this.setStateProjectData(projects);
      }
      if (pathname !== prevProps.location.pathname) {
        pathname = pathname.split("/").pop();
        this.setState({ selected: pathname });
      }
      if (pid !== prevProps.pid) {
        this.setState({ pid });
      }

      if (lastEventId !== prevProps.lastEventId && refresh && !notSideBarUpdate) {
        projects = await this.getProjectsData();
        this.setStateProjectData(projects);
      }
    } catch (error) {
      console.error(error);
    }
  };

  handleOpenClose = () => {
    const { open, shouldGetProgress } = this.state;
    if (shouldGetProgress) {
      this.getWorklistandProgressData();
      this.setState({ shouldGetProgress: false });
    }
    if (open) {
      this.setState({
        width: "30px",
        marginLeft: "30px",
        tabMarginLeft: "0px",
        buttonDisplay: "block",
        open: false
      });
    } else {
      this.setState({
        width: "205px",
        marginLeft: "205px",
        tabMarginLeft: "170px",
        buttonDisplay: "none",
        open: true
      });
    }
  };

  handleRoute = (type, id) => {
    let index;
    const isThick = mode !== "lite";
    this.setState({ type });
    this.setState({ selected: null });
    this.props.dispatch(clearSelection());
    if (type !== "progress") {
      this.collapseAll();
    }
    if (type === "project" && this.props.type === "search" && mode === 'teaching') {
      this.setState({ index: 0 });
      this.props.getPidUpdate(id);
      this.props.history.push(`/search/${id}`);
      this.props.dispatch(setLastLocation(`/search/${id}`));
    } else if (type === "project" && this.props.type === "list" && mode !== 'teaching') {
      this.setState({ index: 0 });
      this.props.getPidUpdate(id);
      this.props.clearTreeExpand();
      this.props.history.push(`/list/${id}`);
      this.props.dispatch(setLastLocation(`/list/${id}`));
    } else if (type === "project" && this.props.type === "search" && mode !== 'teaching') {
      this.setState({ index: 0 });
      this.props.getPidUpdate(id);
      this.props.history.push(`/search/${id}`);
      this.props.dispatch(setLastLocation(`/search/${id}`));
    } else if (type === "project" && this.props.type === "flex") {
      this.props.history.push(`/flex/${id}`);
      this.setState({ index: 0 });
      this.props.dispatch(setLastLocation(`/flex/${id}`));
    } else if (type === "worklist") {
      this.props.history.push(`/worklist/${id}`);
      index = isThick ? 1 : 0;
      this.setState({ index });
      this.props.dispatch(setLastLocation(`/worklist/${id}`));
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
    const conditionalIndex = mode !== "lite" ? 2 : 1;
    if (open) this.setState({ index: conditionalIndex });
  };

  collapseAll = () => {
    const progressView = [false, false];
    this.setState({ progressView });
  };

  renderNav = () => {
    if (mode !== "lite") {
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
    try {
      const { projects, selected } = this.state;
      let { pathname } = this.props.location;
      pathname = pathname.split("/").pop();
      if (mode !== "lite") {
        const projectsList = projects.map(({ id, name, numberOfSubjects, numberOfTeachingFiles }) => {
          const matchProject =
            selected === id ||
            pathname === id ||
            this.props.pid === id;
          const styling = matchProject
            ? "element_selected"
            : "element";
          return (
            <li key={id} className={matchProject ? "element_selected" : "element_de_selected"} onClick={() => {
              this.handleRoute("project", id);
              this.props.getPidUpdate(id);
              this.setState({ selected: id });
            }} style={{ padding: "0.2rem" }}>
              {name}
              <div className={'element_number'}>
                {mode !== 'teaching' ? numberOfSubjects : numberOfTeachingFiles}
              </div>
            </li>
          );
        });
        return <ul className={'element'} style={{ listStyle: 'none' }}> {projectsList}</ul >;
      }
    } catch (err) {
      console.error(err);
    }
  };

  renderWorklists = () => {
    const { type, selected } = this.state;
    const worklists = this.state.worklistsAssigned.map(({ workListID, name, projectIDs }) => {
      const isSelected = (workListID === selected && type === "worklist");
      return (
        <li key={workListID} className={isSelected ? 'element_selected' : 'element_de_selected'}
          onClick={() => {
            this.handleRoute("worklist", workListID);
            this.setState({ selected: workListID });
          }} style={{ padding: "0.4rem" }}>
          {name}
          {projectIDs.length ? (
            <div className="element_number">
              {projectIDs.length}
            </div>
          ) : null}
        </li>
      );
    });
    return <ul className={'element'} style={{ listStyle: 'none' }}> {worklists}</ul >;
  };

  renderProgress = () => { 
    const { selected, type, worklistsCreated, worklistsAssigned } = this.state;
    return (
      <div>
        <Collapsible
          open={true}
          trigger="Created by me"
          onOpen={() => this.handleCollapse(0, true)}
          onClose={() => this.handleCollapse(0, false)}
          transitionTime={100}
        >
          <WorklistSelect
            list={worklistsCreated}
            handleRoute={this.handleRoute}
            selected={selected}
            type={type}
          />
        </Collapsible>
        <Collapsible
          open={true}
          trigger="Assigned to me"
          onOpen={() => this.handleCollapse(1, true)}
          onClose={() => this.handleCollapse(1, false)}
          transitionTime={100}
        >
          <WorklistSelect
            list={worklistsAssigned}
            handleRoute={this.handleRoute}
            selected={selected}
            type={type}
          />
        </Collapsible>
      </div>
    );
  };

  renderContent = () => {
    const { height } = this.state;
    return (
      <Tabs
        id="controlled-tab-leftSidebar"
        activeKey={this.state.activeTab}
        onSelect={index => this.setState({ index })}
      >
        {mode !== "lite" ? (
          <Tab
            eventKey="0"
            title="Projects"
            style={{ height, overflow: "auto" }}
          >
            <div></div>
            {this.renderProjects()}
          </Tab>
        ) : (
          ""
        )}
        <Tab
          eventKey="1"
          title="Worklists"
          style={{ height, overflow: "auto" }}
        >
          <div>{this.renderWorklists()}</div>
        </Tab>

        <Tab eventKey="2" title="Progress" style={{ height, overflow: "auto" }}>
          {this.renderProgress()}
        </Tab>
      </Tabs>
    );
  };

  render = () => {
    const { open, tab, marginLeft, width, tabMarginLeft } = this.state;
    return (
      <div>
        <div className={open ? "left-open" : "left-closed"} style={{ width: width }}>
          {open && (
            <div className="left-editor-display">
              <div className="tab-content" id="myTabContent">
                <div className="tab-pane fade show active" id="projects-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabIndex="0">
                  {tab === 'projects' &&
                    this.renderProjects()
                  }
                  {tab === 'worklist' &&
                    this.renderWorklists()
                  }
                  {tab === 'progress' &&
                    this.renderProgress()
                  }
                </div>
              </div>
            </div>
          )}
          <div className="drawer-control-left" onClick={this.handleOpenClose}>{open ? <BsArrowBarLeft className="bi bi-arrow-bar-left" /> : <BsArrowBarRight className="bi bi-arrow-bar-left" />}</div>
          <div className={open ? "left-tabs" : "left-tabs-closed"} style={{ marginLeft: tabMarginLeft }}>
            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <li className="nav-item" role="presentation" id="projects-tab__cont">
                <button className={tab === 'projects' ? "nav-link active" : "nav-link"} onClick={() => this.setState({ tab: 'projects' })} id="projects-tab" data-bs-toggle="tab" data-bs-target="#projects-tab-pane" type="button" role="tab" aria-controls="projects-tab-pane" aria-selected="false">Projects</button>
              </li>
              <li className="nav-item" role="presentation" id="worklists-tab__cont">
                <button className={tab === 'worklist' ? "nav-link active" : "nav-link"} onClick={() => this.setState({ tab: 'worklist' })} id="worklists-tab" data-bs-toggle="tab" data-bs-target="#worklists-tab-pane" type="button" role="tab" aria-controls="worklists-tab-pane" aria-selected="true">Worklists</button>
              </li>
              <li className="nav-item" role="presentation" id="progress-tab__cont">
                <button className={tab === 'progress' ? "nav-link active" : "nav-link"} onClick={() => this.setState({ tab: 'progress' })} id="progress-tab" data-bs-toggle="tab" data-bs-target="#progress-tab-pane" type="button" role="tab" aria-controls="progress-tab-pane" aria-selected="false">Progress</button>
              </li>
            </ul>
          </div>

        </div>
        <div
          className={open ? "mainView" : "mainView-closed"}
          style={{
            marginLeft: marginLeft
          }}
        >
          {this.props.children}
        </div>
      </div >
    );
  };
}

const mapStateToProps = state => {
  const {
    activePort,
    lastEventId,
    openSeries,
    notificationAction,
    refresh,
    projectMap
  } = state.annotationsListReducer;
  return {
    activePort,
    lastEventId,
    openSeries,
    notificationAction,
    refresh,
    projectMap
  };
};
export default withRouter(connect(mapStateToProps)(Sidebar));
