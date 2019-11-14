import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { toast } from "react-toastify";
import ToolBar from "../common/basicToolBar";
import { FaRegTrashAlt } from "react-icons/fa";
import { getProjects } from "../../../services/projectServices";
import { getTools, deleteTool } from "../../../services/tools";
import DeleteAlert from "../common/alertDeletionModal";
import UploadModal from "../../searchView/uploadModal";
import EditTools from "../templates/projectTable";

class Tools extends React.Component {
  state = {
    tools: [],
    projectList: {},
    hasAddClicked: false,
    delAll: false,
    delOne: false,
    selectAll: 0,
    selected: {},
    selectedOne: {},
    uploadClicked: false,
    hasEditClicked: false,
    templateName: "",
    toolsByProjects: {}
  };

  componentDidMount = async () => {
    const { data: projectList } = await getProjects();
    const temp = [];
    for (let project of projectList) {
      const { id, name } = project;
      temp.push({ id, name });
    }
    this.setState({ projectList: temp });
    this.getToolsData();
  };

  groupByProjects = tools => {
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
    const { data: tools } = await getTools();
    const toolsByProjects = this.groupByProjects(tools);
    this.setState({ tools, toolsByProjects });
  };

  toggleRow = async (id, projectID) => {
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
  };

  toggleSelectAll() {
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
  }

  handleCancel = () => {
    this.setState({
      hasAddClicked: false,
      name: "",
      id: "",
      user: "",
      description: "",
      error: "",
      delAll: false,
      uploadClicked: false,
      hasEditClicked: false,
      delOne: false,
      templateName: "",
      selectedOne: {}
    });
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

  handleDeleteAll = () => {
    const selectedArr = Object.keys(this.state.selected);
    if (selectedArr.length === 0) {
      return;
    } else {
      this.setState({ delAll: true });
    }
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
      {
        Header: "Description",
        accessor: "description",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 420
      },
      {
        Header: "Projects",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 420,
        Cell: original => {
          const { projectId, projectName, pluginId } = original.row.checkbox;
          return projectId === "all" ? (
            <div>{projectName}</div>
          ) : (
            <div>{this.state.toolsByProjects[pluginId].join(",")}</div>
          );
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

  render = () => {
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    const data = this.state.tools;
    const pageSize = data.length < 10 ? 10 : data.length >= 40 ? 50 : 20;
    return (
      <div className="tools menu-display" id="template">
        <ToolBar
          onDelete={this.handleDeleteAll}
          selected={checkboxSelected}
          onUpload={this.handleUpload}
          onDownload={this.handleDownload}
        />
        <ReactTable
          className="pro-table"
          data={this.state.tools}
          columns={this.defineColumns()}
          pageSizeOptions={[10, 20, 50]}
          defaultPageSize={pageSize}
        />
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
      </div>
    );
  };
}

export default Tools;
