import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { toast } from "react-toastify";
import ToolBar from "../common/basicToolBar";
import { FaRegTrashAlt } from "react-icons/fa";
import {
  getProjects,
  getProjectsWithPkAsId
} from "../../../services/projectServices";
import { getTemplatesFromDb } from "../../../services/templateServices";
import PluginProjectWindow from "./pluginProjectWindow";
import PluginTemplateWindow from "./pluginTemplateWindow";
import NewPluginWindow from "./newPluginWindow";
import {
  getPluginsWithProject,
  updateProjectsForPlugin,
  updateTemplatesForPlugin,
  deletePlugin,
  savePlugin
} from "../../../services/pluginServices";
import DeleteAlert from "../common/alertDeletionModal";
import UploadModal from "../../searchView/uploadModal";
import EditTools from "../templates/projectTable";
import "./plugin.css";

class Plugins extends React.Component {
  state = {
    plugins: [], //using
    projectList: [], //using
    templateList: [], //using
    selectedProjects: [], //using
    selectedTemplates: [], //using
    tableSelectedData: {}, //using
    manageTabActive: true, //using
    trackTabActive: false, //using
    triggerTabActive: false, //using
    hasAddProjectClicked: false, //using
    hasAddTemplateClicked: false, //using
    newPluginClicked: false, //using
    delAll: false,
    delOne: false,
    selectAll: 0, //using
    selected: {}, //uising
    uploadClicked: false,
    hasEditClicked: false,
    pluginFormElements: {
      //using
      name: "",
      id: "",
      image: "",
      description: "",
      enabled: "",
      modality: "",
      developer: "",
      documentation: ""
    }
  };

  componentDidMount = async () => {
    const pluginList = await getPluginsWithProject();
    let projectList = await getProjectsWithPkAsId();
    let templateList = await getTemplatesFromDb();
    templateList = templateList.data;

    const plugins = pluginList.data;
    projectList = projectList.data;
    this.setState({ plugins, projectList, templateList });
  };

  getPlugins = () => {
    return this.state.plugins;
  };

  arrayToMap = arrayObj => {
    const tempmap = new Map();
    arrayObj.forEach(temp => {
      tempmap.set(temp, temp);
    });
    return tempmap;
  };

  handleProjectSelect = (onclickselectedProject, tableData) => {
    let tempSelectedProjects = this.state.selectedProjects;
    let elementIndex = tempSelectedProjects.indexOf(onclickselectedProject);
    if (elementIndex === -1) {
      tempSelectedProjects.push(onclickselectedProject);
    } else {
      tempSelectedProjects = this.state.selectedProjects.filter(project => {
        return project !== onclickselectedProject;
      });
    }
    this.setState({ selectedProjects: tempSelectedProjects });
  };

  addProject = (projectArray, tableSelectedData) => {
    const tempProjectMap = this.arrayToMap(projectArray);
    this.setState({
      hasAddProjectClicked: true,
      selectedProjectsAsMap: tempProjectMap,
      tableSelectedData: tableSelectedData,
      selectedProjects: projectArray
    });
  };

  handleAddProjectCancel = () => {
    this.setState({
      selectedProjects: [],
      tableSelectedData: {},
      hasAddProjectClicked: false
    });
  };

  handleAddProjectSave = async () => {
    const selectedPluginId = this.state.tableSelectedData.original.id;
    const newProjects = this.state.selectedProjects;
    const tempoldProjects = this.state.tableSelectedData.original.projects;
    const oldProjects = [];

    tempoldProjects.forEach(project => {
      oldProjects.push(project.id);
    });

    let projectsToRemove = [];
    let projectsToAdd = [];

    projectsToAdd = newProjects.filter(prid => !oldProjects.includes(prid));
    projectsToRemove = oldProjects.filter(prid => !newProjects.includes(prid));

    const projectsArrayAsResponse = await updateProjectsForPlugin(
      selectedPluginId,
      {
        projectsToAdd,
        projectsToRemove
      }
    );

    const tempPlugins = this.state.plugins;
    let arrayIndex = -1;
    for (let i = 0; i < tempPlugins.length; i++) {
      if (tempPlugins[i].id === selectedPluginId) {
        tempPlugins[i].projects = projectsArrayAsResponse.data;
      }
    }
    this.setState({
      hasAddProjectClicked: false,
      plugins: tempPlugins,
      tableSelectedData: {}
    });
  };

  addTemplate = (templateArray, tableSelectedData) => {
    const tempTemplateMap = this.arrayToMap(templateArray);
    this.setState({
      hasAddTemplateClicked: true,
      selectedTemplateAsMap: tempTemplateMap,
      tableSelectedData: tableSelectedData,
      selectedTemplates: templateArray
    });
  };

  handleAddTemplateSave = async () => {
    const selectedPluginId = this.state.tableSelectedData.original.id;
    const newTemplates = this.state.selectedTemplates;
    const tempoldTemplates = this.state.tableSelectedData.original.templates;
    const oldTemplates = [];

    tempoldTemplates.forEach(template => {
      oldTemplates.push(template.id);
    });
    let templatesToRemove = [];
    let templatesToAdd = [];
    templatesToAdd = newTemplates.filter(
      templateid => !oldTemplates.includes(templateid)
    );
    templatesToRemove = oldTemplates.filter(
      templateid => !newTemplates.includes(templateid)
    );

    const templatesArrayAsResponse = await updateTemplatesForPlugin(
      selectedPluginId,
      {
        templatesToAdd,
        templatesToRemove
      }
    );

    const tempPlugins = this.state.plugins;
    let arrayIndex = -1;
    for (let i = 0; i < tempPlugins.length; i++) {
      if (tempPlugins[i].id === selectedPluginId) {
        tempPlugins[i].templates = templatesArrayAsResponse.data;
      }
    }

    this.setState({
      hasAddTemplateClicked: false,
      plugins: tempPlugins,
      tableSelectedData: {}
    });
  };

  handleTemplateSelect = (onclickselectedTemplate, tableData) => {
    let tempSelectedTemplates = this.state.selectedTemplates;
    let elementIndex = tempSelectedTemplates.indexOf(onclickselectedTemplate);
    if (elementIndex === -1) {
      tempSelectedTemplates.push(onclickselectedTemplate);
    } else {
      tempSelectedTemplates = this.state.selectedTemplates.filter(template => {
        return template !== onclickselectedTemplate;
      });
    }

    this.setState({ selectedTemplates: tempSelectedTemplates });
  };

  handleAddTemplateCancel = () => {
    this.setState({
      selectedTemplates: [],
      tableSelectedData: {},
      hasAddTemplateClicked: false
    });
  };

  handleTabClic = whichtab => {
    this.setState({
      manageTabActive: false,
      trackTabActive: false,
      triggerTabActive: false,
      [whichtab]: true
    });
  };

  handleDeleteOne = async rowdata => {
    const selectedRowPluginId = rowdata.id;
    const tempPlugins = this.state.plugins;

    let resultPlugins = [];
    const deletePluginResult = await deletePlugin({ selectedRowPluginId });

    console.log("delete plugin result :", deletePluginResult);
    resultPlugins = tempPlugins.filter(plugin => {
      return plugin.id !== selectedRowPluginId;
    });
    this.setState({ plugins: resultPlugins });
  };

  handleDeleteAll = async () => {
    const tempPlugins = this.state.plugins;
    const selectedCheckBoxes = this.state.selected;
    let resultPlugins = [];
    resultPlugins = tempPlugins.filter(plugin => {
      return typeof selectedCheckBoxes[plugin.id] === "undefined";
    });
    const pluginIdsToDelete = Object.values(selectedCheckBoxes);
    const deletePluginResult = await deletePlugin({ pluginIdsToDelete });
    this.setState({ plugins: resultPlugins });
  };

  handleSelectAll = () => {
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.plugins.forEach(plugin => {
        let pluginid = plugin.id;

        newSelected[pluginid] = pluginid;
      });
    }
    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  };

  handleSelectRow = async id => {
    console.log(this.state.selected, id);
    let selectedCheckBoxes = this.state.selected;
    console.log(selectedCheckBoxes[id]);
    if (typeof selectedCheckBoxes[id] === "undefined") {
      selectedCheckBoxes = { ...selectedCheckBoxes, [id]: id };
    } else {
      delete selectedCheckBoxes[id];
    }
    this.setState({ selected: selectedCheckBoxes });
  };
  handleAddPlugin = () => {
    this.setState({ newPluginClicked: true });
  };
  handleAddPluginCancel = () => {
    this.setState({ newPluginClicked: false });
  };
  handleAddPluginSave = async () => {
    const pluginform = this.state.pluginFormElements;
    this.setState({ newPluginClicked: false });
    const responseSavePlugin = await savePlugin({
      pluginform
    });
    //pluginFomElements
  };
  /*
  groupByProjects = tools => {
    //console.log("--->tools ", tools);
    // const projects = {};
    return tools.reduce((all, item, index) => {
      if (item.projectId !== "all") {
        all[item.pluginId]
          ? all[item.pluginId].push(item.projectName)
          : (all[item.pluginId] = [item.projectName]);
      }
      return all;
    }, {});
  };
  renderMessages = input => {
    return {
      deleteAll: "Delete selected tools? This cannot be undone.",
      deleteOne: `Delete template ${input}? This cannot be undone.`
    };
  };
  getToolsData = async () => {
    //cavit
    const { data: tools } = await getPluginsWithProject();
    //cavit
    // cavit commented const { data: tools } = await getTools();
    console.log("tools --->", tools);
    const toolsByProjects = this.groupByProjects(tools);
    this.setState({ tools, toolsByProjects });
  };







  deleteAll = async () => {
    let newSelected = Object.assign({}, this.state.selected);
    const promiseArr = [];
    for (let template in newSelected) {
      promiseArr.push(deleteTool());
    }
    Promise.all(promiseArr)
      .then(() => {
        this.getToolsData();
        this.setState({ selectAll: 0, selected: {} });
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getToolsData();
      });
    this.handleCancel();
  };



  handleFormInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleEdit = e => {
    this.setState({ hasEditClicked: true });
  };



  deleteOne = () => {
    const template = Object.keys(this.state.selectedOne);
    deleteTool(template)
      .then(() => {
        const newSelected = { ...this.state.selected };
        if (newSelected[template]) {
          delete newSelected[template];
        }
        const selectAll = Object.keys(newSelected).length > 0 ? 2 : 0;
        this.getToolsData();
        this.setState({
          selectAll,
          selected: newSelected,
          selectedOne: {},
          delOne: false
        });
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getToolsData();
      });
  };

  handleClickProjects = () => {
    this.setState({
      hasEditClicked: true
    });
  };
  handleUpload = () => {
    this.setState({ uploadClicked: true });
  };

  triggerBrowserDownload = (blob, fileName) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    document.body.appendChild(link);
    link.style = "display: none";
    link.href = url;
    link.download = `${fileName}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  handleSubmitUpload = () => {
    this.getToolsData();
    this.handleCancel();
  };

  handleSubmitDownload = () => {
    this.handleCancel();
  };
*/
  handleTAddPluginChange = e => {
    const plElements = { ...this.state.pluginFormElements };
    plElements[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ pluginFormElements: plElements });
    console.log("form elements : ", this.state.pluginFormElements);
  };
  //cavit
  projectDataToCell = tableData => {
    const { projects } = tableData.row;
    const tempProjects = [];
    let projectArray = [];
    let projectNameArray = [];
    for (let project of projects) {
      const { id, projectname } = project;
      tempProjects.push(id);
      projectNameArray.push(projectname);
    }
    projectArray = projectNameArray.join(" ,");

    return (
      <div
        onClick={() => {
          this.addProject(tempProjects, tableData);
        }}
      >
        {projectArray.length === 0 ? "add project" : projectArray}
      </div>
    );
  };

  templateDataToCell = tableData => {
    const { templates } = tableData.row;
    const tempTemplates = [];
    let templateArray = [];
    const templateNameArray = [];
    for (let template of templates) {
      const { id, templateName } = template;
      tempTemplates.push(id);
      templateNameArray.push(templateName);
    }
    templateArray = templateNameArray.join(" ,");

    return (
      <div
        onClick={() => {
          this.addTemplate(tempTemplates, tableData);
        }}
      >
        {templateArray.length === 0 ? "add template" : templateArray}
      </div>
    );
  };

  defineColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
        width: 50,
        Cell: ({ original }) => {
          const { id } = original;
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selected[id]}
              onChange={() => this.handleSelectRow(id)}
            />
          );
        },
        Header: x => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selectAll === 1}
              ref={input => {
                if (input) {
                  input.indeterminate = this.state.selectAll === 2;
                }
              }}
              onChange={() => this.handleSelectAll()}
            />
          );
        },
        // sortable: false,
        resizable: false
        // minResizeWidth: 20
        // maxWidth: 45
      },
      {
        Header: "Name",
        accessor: "name",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 420
      },
      /*{
        Header: "container image",
        accessor: "container_image",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 420
      },*/
      {
        Header: "Projects",
        accessor: "projects",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 200,
        Cell: original => {
          return this.projectDataToCell(original);
        },
        style: { whiteSpace: "unset" }
      },
      {
        Header: "Templates",
        accessor: "templates",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 200,
        Cell: original => {
          return this.templateDataToCell(original);
        },
        style: { whiteSpace: "unset" }
      },
      {
        Header: "",
        Cell: original => {
          const rowdata = original.row.checkbox;
          return (
            <div onClick={() => this.handleDeleteOne(rowdata)}>
              <FaRegTrashAlt className="menu-clickable" />
            </div>
          );
        }
      }
    ];
  };

  render = () => {
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    const data = this.state.plugins;
    const pageSize = data.length < 10 ? 10 : data.length >= 40 ? 50 : 20;
    return (
      <div className="tools menu-display" id="template">
        <ToolBar
          onAdd={this.handleAddPlugin}
          onDelete={this.handleDeleteAll}
          selected={checkboxSelected}
        />
        <div className="pluginnavbar">
          <ul className="pluginform nav nav-tabs" id="myTab">
            <li className="pluginform nav-item ">
              <a
                href="#"
                className={
                  this.state.manageTabActive === true
                    ? "pluginform nav-link active"
                    : "pluginform nav-link"
                }
                onClick={() => {
                  this.handleTabClic("manageTabActive");
                }}
              >
                manage
              </a>
            </li>
            <li className="pluginform nav-item">
              <a
                href="#"
                className={
                  this.state.trackTabActive === true
                    ? "pluginform nav-link active"
                    : "pluginform nav-link"
                }
                onClick={() => {
                  this.handleTabClic("trackTabActive");
                }}
              >
                track
              </a>
            </li>
            <li className="pluginform nav-item">
              <a
                href="#"
                className={
                  this.state.triggerTabActive === true
                    ? "pluginform nav-link active"
                    : "pluginform nav-link"
                }
                onClick={() => {
                  this.handleTabClic("triggerTabActive");
                }}
              >
                trigger
              </a>
            </li>
          </ul>
        </div>
        {this.state.manageTabActive && (
          <ReactTable
            className="pro-table"
            data={this.state.plugins}
            columns={this.defineColumns()}
            pageSizeOptions={[10, 20, 50]}
            defaultPageSize={pageSize}
          />
        )}
        {(this.state.delAll || this.state.delOne) && (
          <DeleteAlert
            message={
              this.state.delAll
                ? this.renderMessages().deleteAll
                : this.renderMessages(this.state.templateName).deleteOne
            }
            onCancel={this.handleCancel}
            onDelete={this.state.delAll ? this.deleteAll : this.deleteOne}
            error={this.state.errorMessage}
          />
        )}
        {this.state.uploadClicked && (
          <UploadModal
            onCancel={this.handleCancel}
            onSubmit={this.handleSubmitUpload}
          />
        )}
        {this.state.hasEditClicked && (
          <EditTools
            projectList={this.state.projectList}
            onCancel={this.handleCancel}
          />
        )}
        {this.state.hasAddProjectClicked && (
          <PluginProjectWindow
            onChange={this.handleProjectSelect}
            onCancel={this.handleAddProjectCancel}
            onSave={this.handleAddProjectSave}
            selectedProjectsAsMap={this.state.selectedProjectsAsMap}
            allProjects={this.state.projectList}
            tableSelectedData={this.state.tableSelectedData}
          />
        )}
        {this.state.hasAddTemplateClicked && (
          <PluginTemplateWindow
            onChange={this.handleTemplateSelect}
            onCancel={this.handleAddTemplateCancel}
            onSave={this.handleAddTemplateSave}
            selectedTemplateAsMap={this.state.selectedTemplateAsMap}
            allTemplates={this.state.templateList}
            tableSelectedData={this.state.tableSelectedData}
          />
        )}
        {this.state.newPluginClicked && (
          <NewPluginWindow
            onCancel={this.handleAddPluginCancel}
            onSave={this.handleAddPluginSave}
            onChange={this.handleTAddPluginChange}
            error={this.handleTAddPluginError}
            pluginFormElements={this.state.pluginFormElements}
          />
        )}
      </div>
    );
  };
}

export default Plugins;
