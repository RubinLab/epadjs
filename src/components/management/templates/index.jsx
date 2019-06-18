import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Table from "react-table";
import { toast } from "react-toastify";
import ToolBar from "./toolbar";
import { FaRegTrashAlt, FaEdit } from "react-icons/fa";
import { getAllTemplates } from "../../../services/templateServices";
import { getProjects } from "../../../services/projectServices";
import matchSorter from "match-sorter";
import { isLite } from "../../../config.json";
import DeleteAlert from "../common/alertDeletionModal";
import UploadModal from "../../searchView/uploadModal";
import DownloadModal from "../../searchView/annotationDownloadModal";
import EditTemplates from "./projectTable";
import { MAX_PORT } from "../../../constants";
import CustomTable from "./CustomTable";

const messages = {
  deleteSelected: "Delete selected annotations? This cannot be undone.",
  fillRequiredFields: "Please fill the required fields",
  dateFormat: "Date format should be M/d/yy."
};

class Templates extends React.Component {
  state = {
    templates: [],
    projectList: {},
    // singleDeleteData: {},
    // deleteSingleClicked: false,
    hasAddClicked: false,
    deleteAllClicked: false,
    selectAll: 0,
    selected: {},
    uploadClicked: false,
    downloadClicked: false,
    hasEditClicked: false
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

  getTemplatesData = async () => {
    const {
      data: {
        ResultSet: { Result: templates }
      }
    } = await getAllTemplates();

    this.setState({ templates });
  };

  handleFilterInput = e => {
    const { name, value } = e.target;
    this.setState({ name: value });
  };

  toggleRow = async (id, projectID) => {
    projectID = projectID ? projectID : "lite";
    let newSelected = Object.assign({}, this.state.selected);
    if (newSelected[id]) {
      newSelected[id] = false;
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
        newSelected[temp.templateCode] = temp.templateCode;
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
      deleteAllClicked: false,
      uploadClicked: false,
      downloadClicked: false,
      hasEditClicked: false
    });
  };

  deleteAllSelected = async () => {
    // let newSelected = Object.assign({}, this.state.selected);
    // const promiseArr = [];
    // for (let annotation in newSelected) {
    //   promiseArr.push(deleteAnnotation(annotation, newSelected[annotation]));
    // }
    // Promise.all(promiseArr)
    //   .then(() => {
    //     this.getTemplatesData();
    //   })
    //   .catch(error => {
    //     toast.error(error.response.data.message, { autoClose: false });
    //     this.getTemplatesData();
    //   });
    // this.handleCancel();
  };

  handleDeleteAll = () => {
    // const selectedArr = Object.values(this.state.selected);
    // const notSelected = selectedArr.includes(false) || selectedArr.length === 0;
    // if (notSelected) {
    //   return;
    // } else {
    //   this.setState({ deleteAllClicked: true });
    //   };
  };

  handleFormInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleEdit = e => {
    this.setState({ hasEditClicked: true });
  };

  defineColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
        width: 30,
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selected[original.aimID]}
              onChange={() =>
                this.toggleRow(original.aimID, original.projectID)
              }
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
        sortable: false,
        minResizeWidth: 20,
        width: 45
      },
      {
        Header: "Container",
        accessor: "templateName",
        sortable: true,
        resizable: true,
        minResizeWidth: 20
        // minWidth: 30
      },

      {
        Header: "Type",
        accessor: "description",
        sortable: true,
        resizable: true,
        minResizeWidth: 20
        // minWidth: 10
      },
      {
        Header: "Templates",
        accessor: "templateName",
        sortable: true,
        resizable: true,
        minResizeWidth: 20
        // minWidth: 30
      },
      {
        Header: "Projects",
        // width: 50,
        minResizeWidth: 20,
        resizable: true,
        sortable: true,
        Cell: original => {
          const templates = original.row.checkbox.projectTemplates;
          let projects = "";
          if (templates.length === 1 && templates[0].projectID === "all") {
            projects = "All";
          } else {
            let projectsArr = [];
            for (let project of templates) {
              console.log(this.state.projectList[project.projectID]);
              projectsArr.push(this.state.projectList[project.projectID]);
            }
            projects = projectsArr.join(", ");
          }
          return (
            <a
              role="button"
              tabindex="0"
              className="menu-clickable"
              onClick={this.handleClickProjects}
            >
              {projects}
            </a>
          );
        }
      },

      {
        Header: "",
        width: 45,
        minResizeWidth: 20,
        resizable: true,
        Cell: original => (
          <div
            onClick={() => this.handleSingleDelete(original.row.checkbox.id)}
          >
            <FaRegTrashAlt className="menu-clickable" />
          </div>
        )
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
    const selectedArr = Object.values(this.state.selected);
    const notSelected = selectedArr.includes(false) || selectedArr.length === 0;
    if (notSelected) {
      return;
    } else {
      this.setState({ downloadClicked: true });
    }
  };

  handleSubmitUpload = () => {
    this.getTemplatesData();
    this.handleCancel();
  };

  handleSubmitDownload = () => {
    this.handleCancel();
  };

  render = () => {
    console.log(this.state.templates);
    console.log(this.state.projectList);
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    return (
      <div className="templates menu-display" id="annotation">
        <ToolBar
        //   onDelete={this.handleDeleteAll}
        //   selected={checkboxSelected}
        //   projects={this.state.projectList}
        //   onSelect={this.handleProjectSelect}
        //   onClear={this.handleClearFilter}
        //   onType={this.handleFilterInput}
        //   onFilter={this.filterTableData}
        //   onUpload={this.handleUpload}
        //   onDownload={this.handleDownload}
        />
        <Table
          className="pro-table"
          data={this.state.templates}
          columns={this.defineColumns()}
        />
        {this.state.deleteAllClicked && (
          <DeleteAlert
            message={messages.deleteSelected}
            onCancel={this.handleCancel}
            onDelete={this.deleteAllSelected}
            error={this.state.errorMessage}
          />
        )}
        {this.state.uploadClicked && (
          <UploadModal
            onCancel={this.handleCancel}
            onSubmit={this.handleSubmitUpload}
          />
        )}
        {this.state.downloadClicked && (
          <DownloadModal
            onCancel={this.handleCancel}
            onSubmit={this.handleSubmitDownload}
            updateStatus={() => console.log("update status")}
            selected={this.state.selected}
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

const mapsStateToProps = state => {
  return { openSeries: state.annotationsListReducer.openSeries };
};

export default connect(mapsStateToProps)(Templates);
