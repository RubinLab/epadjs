import React from "react";
import PropTypes from "prop-types";
import ReactTable from "react-table";
import { toast } from "react-toastify";
import ToolBar from "./toolbar";
import { FaRegTrashAlt } from "react-icons/fa";
import { getAllTemplates } from "../../../services/templateServices";
import { getProjects } from "../../../services/projectServices";
import { isLite } from "../../../config.json";
import DeleteAlert from "../common/alertDeletionModal";
import UploadModal from "../../searchView/uploadModal";
import EditTemplates from "./projectTable";
import CustomTable from "./CustomTable";
import {
  downloadTemplates,
  deleteTemplate
} from "../../../services/templateServices";

class Templates extends React.Component {
  state = {
    templates: [],
    projectList: {},
    hasAddClicked: false,
    delAll: false,
    delOne: false,
    selectAll: 0,
    selected: {},
    selectedOne: {},
    uploadClicked: false,
    hasEditClicked: false,
    templateName: ""
  };

  componentDidMount = async () => {
    if (!isLite) {
      const {
        data: {
          ResultSet: { Result: projectList }
        }
      } = await getProjects();
      const temp = [];
      for (let project of projectList) {
        const { id, name } = project;
        temp.push({ id, name });
      }
      this.setState({ projectList: temp });
      this.getTemplatesData();
    } else {
      this.getTemplatesData();
    }
  };

  renderMessages = input => {
    return {
      deleteAll: "Delete selected templates? This cannot be undone.",
      deleteOne: `Delete template ${input}? This cannot be undone.`
    };
  };
  getTemplatesData = async () => {
    const {
      data: {
        ResultSet: { Result: templates }
      }
    } = await getAllTemplates();
    this.setState({ templates });
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
      this.state.templates.forEach(temp => {
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
      promiseArr.push(deleteTemplate(template, newSelected[template]));
    }
    Promise.all(promiseArr)
      .then(() => {
        this.getTemplatesData();
        this.setState({ selectAll: 0, selected: {} });
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getTemplatesData();
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
    deleteTemplate(template)
      .then(() => {
        const newSelected = { ...this.state.selected };
        if (newSelected[template]) {
          delete newSelected[template];
        }
        const selectAll = Object.keys(newSelected).length > 0 ? 2 : 0;
        this.getTemplatesData();
        this.setState({
          selectAll,
          selected: newSelected,
          selectedOne: {},
          delOne: false
        });
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getTemplatesData();
      });
  };

  defineColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
        width: 50,
        Cell: ({ original }) => {
          const { templateUID } = original.Template[0];
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selected[templateUID]}
              onChange={() => this.toggleRow(templateUID)}
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
        Header: "Container",
        accessor: "containerName",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 420
      },
      {
        Header: "Type",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        // resizable: false,
        width: 180,

        Cell: original => {
          return <div>{original.row.checkbox.Template[0].type}</div>;
          // return <span>type</span>;
        }
      },
      {
        Header: "Template",
        sortable: true,
        resizable: true,
        minResizeWidth: 100,
        width: 420,
        Cell: original => {
          return <div>{original.row.checkbox.Template[0].templateName}</div>;
          // return <span>type</span>;
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

  handleDownload = () => {
    const selectedArr = Object.keys(this.state.selected);
    const notSelected = selectedArr.length === 0;
    if (notSelected) {
      return;
    } else {
      downloadTemplates(selectedArr)
        .then(result => {
          let blob = new Blob([result.data], { type: "application/zip" });
          this.triggerBrowserDownload(blob, "Templates");
          // this.props.onSubmit();
        })
        .catch(err => {
          console.log(err);
        });
    }
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
    this.getTemplatesData();
    this.handleCancel();
  };

  handleSubmitDownload = () => {
    this.handleCancel();
  };

  render = () => {
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    const data = this.state.templates;
    const pageSize = data.length < 10 ? 10 : data.length >= 40 ? 50 : 20;
    return (
      <div className="templates menu-display" id="template">
        <ToolBar
          onDelete={this.handleDeleteAll}
          selected={checkboxSelected}
          onUpload={this.handleUpload}
          onDownload={this.handleDownload}
        />
        <ReactTable
          className="pro-table"
          data={this.state.templates}
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
            className="mng-upload"
          />
        )}
        {this.state.hasEditClicked && (
          <EditTemplates
            projectList={this.state.projectList}
            onCancel={this.handleCancel}
          />
        )}
      </div>
    );
  };
}

export default Templates;

/*
const projects = {
      Header: "Projects",
      // width: 50,
      // minResizeWidth: 20,
      // resizable: true,
      // sortable: true,
      Cell: original => {
        const templates = original.row.checkbox.projectTemplates;
        let projects = "";
        if (templates.length === 1 && templates[0].projectID === "all") {
          projects = "All";
        } else {
          let projectsArr = [];
          for (let project of templates) {
            projectsArr.push(this.state.projectList[project.projectID]);
          }
          projects = projectsArr.join(", ");
        }
        return (
          <a
            role="button"
            tabIndex="0"
            className="menu-clickable"
            onClick={this.handleClickProjects}
          >
            {projects}
          </a>
        );
      }
    }; */
