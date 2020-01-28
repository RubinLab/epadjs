import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { toast } from "react-toastify";
import ToolBar from "../common/basicToolBar";
import { FaRegTrashAlt } from "react-icons/fa";
import { getProjects } from "../../../services/projectServices";
import { getTemplatesDataFromDb } from "../../../services/templateServices";
import PluginProjectTable from "./pluginProjectTable";
import PluginTemplateTable from "./pluginTemplateTable";
import {
  getTools,
  getPlugins,
  getPluginsWithProject,
  deleteTool
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
    delAll: false,
    delOne: false,
    selectAll: 0,
    selected: {},
    uploadClicked: false,
    hasEditClicked: false
  };

  componentDidMount = async () => {
    const pluginList = await getPluginsWithProject();
    let projectList = await getProjects();
    let templateList = await getTemplatesDataFromDb();
    templateList = templateList.data;

    const plugins = pluginList.data;
    projectList = projectList.data;
    this.setState({ plugins, projectList, templateList });
    console.log("projects ------>  ", projectList);
    console.log("plugins ------>  ", plugins);
    console.log("plugins ------>  ", templateList);
  };

  getPlugins = () => {
    return this.state.plugins;
  };

  arrayToMap = arrayObj => {
    const tempmap = new Map();
    arrayObj.forEach(temp => {
      console.log("array map", temp);
      tempmap.set(temp, temp);
    });
    console.log("map itself", tempmap);
    return tempmap;
  };

  showme = rowinfo => {
    console.log("row info &&&&&&&&&&&", rowinfo);
  };

  handleProjectSelect = (selectedProject, tableData) => {
    console.log(
      "selected project and selected row data   ",
      selectedProject,
      " ",
      tableData
    );
    let tempSelectedProjects = this.state.selectedProjects;
    let elementIndex = tempSelectedProjects.indexOf(selectedProject);
    if (elementIndex === -1) {
      tempSelectedProjects.push(selectedProject);
    } else {
      //tempSelectedProjects[elementIndex] = "";
      tempSelectedProjects = this.state.selectedProjects.filter(project => {
        return project !== selectedProject;
      });
    }
    this.setState({ selectedProjects: tempSelectedProjects });
  };

  handleAddProjectCancel = () => {
    this.setState({
      selectedProjects: [],
      tableSelectedData: {},
      hasAddProjectClicked: false
    });
  };

  handleAddProjectSave = () => {
    console.log("table selected data to save", this.state.tableSelectedData);
    console.log("new projects for the row", this.state.selectedProjects);
    this.setState({
      hasAddProjectClicked: false
    });
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

  addTemplate = (templateArray, tableSelectedData) => {
    console.log("check template arry before the map", templateArray);
    const tempTemplateMap = this.arrayToMap(templateArray);
    this.setState({
      hasAddTemplateClicked: true,
      selectedTemplateAsMap: tempTemplateMap,
      tableSelectedData: tableSelectedData,
      selectedTemplates: templateArray
    });
  };

  handleAddTemplateSave = () => {
    console.log("table selected data to save", this.state.tableSelectedData);
    console.log("new projects for the row", this.state.selectedTemplates);
    this.setState({
      hasAddTemplateClicked: false
    });
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

  handleDeleteAll = () => {
    /*
    const selectedArr = Object.keys(this.state.selected);
    if (selectedArr.length === 0) {
      return;
    } else {
      this.setState({ delAll: true });
    }
    */
  };

  toggleSelectAll = () => {
    /*
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.tools.forEach(temp => {
        let tempID = temp.Template[0].templateUID;
        let projectID = temp.projectID ? temp.projectID : "lite";
        newSelected[tempID] = projectID;
      });
    }
    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
    */
  };

  toggleRow = async (id, projectID) => {
    /*
    projectID = projectID ? projectID : "lite";
    let newSelected = Object.assign({}, this.state.selected);
    if (newSelected[id]) {
      delete newSelected[id];
      let values = Object.values(newSelected);
      if (values.length === 0) {
        this.setState({
          selectAll: 0
        });
      }
    } else {
      newSelected[id] = projectID;
      await this.setState({
        selectAll: 2
      });
    }
    this.setState({ selected: newSelected });
    */
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

  handleDeleteOne = templateData => {
    const projectID = templateData.projectID ? templateData.projectID : "lite";
    const { templateName, templateUID } = templateData.Template[0];
    this.setState({
      delOne: true,
      templateName,
      selectedOne: { [templateUID]: projectID }
    });
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

  //cavit
  projectDataToCell = tableData => {
    //console.log("cell ----------- >>>>", tableData);
    const {
      projectId,
      projectName,
      projectid,
      projectID,
      projects
    } = tableData.row;
    const tempProjects = [];
    let projectArray = [];
    for (let project of projects) {
      const { id, projectid } = project;
      tempProjects.push(projectid);
    }
    projectArray = tempProjects.join(",");

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
    //console.log("template data from table cell ----------- >>>>", tableData);
    const { id, templateName, templates } = tableData.row;
    const tempTemplates = [];
    let templateArray = [];
    for (let template of templates) {
      const { id, templateName } = template;
      tempTemplates.push(templateName);
    }
    templateArray = tempTemplates.join(",");

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
          const { pluginId } = original;
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selected[pluginId]}
              onChange={() => this.toggleRow(pluginId)}
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
              onChange={() => this.toggleSelectAll()}
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
        width: 100,
        Cell: original => {
          return this.projectDataToCell(original);
        }
      },
      {
        Header: "Templates",
        accessor: "templates",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 100,
        Cell: original => {
          return this.templateDataToCell(original);
        }
      },
      {
        Header: "",
        // width: 45,
        // minResizeWidth: 20,
        // resizable: false,
        Cell: original => {
          const template = original.row.checkbox;
          return (
            <div onClick={() => this.handleDeleteOne(template)}>
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
          onDelete={this.handleDeleteAll}
          selected={checkboxSelected}
          onUpload={this.handleUpload}
          onDownload={this.handleDownload}
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
          <PluginProjectTable
            onChange={this.handleProjectSelect}
            onCancel={this.handleAddProjectCancel}
            onSave={this.handleAddProjectSave}
            selectedProjectsAsMap={this.state.selectedProjectsAsMap}
            allProjects={this.state.projectList}
            tableSelectedData={this.state.tableSelectedData}
          />
        )}
        {this.state.hasAddTemplateClicked && (
          <PluginTemplateTable
            onChange={this.handleTemplateSelect}
            onCancel={this.handleAddTemplateCancel}
            onSave={this.handleAddTemplateSave}
            selectedTemplateAsMap={this.state.selectedTemplateAsMap}
            allTemplates={this.state.templateList}
            tableSelectedData={this.state.tableSelectedData}
          />
        )}
      </div>
    );
  };
}

export default Plugins;
