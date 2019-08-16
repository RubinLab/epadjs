import React from "react";
import Table from "react-table";
import { toast } from "react-toastify";
import { FaRegTrashAlt, FaRegEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getWorklist, deleteWorklist } from "./../../services/worklistServices";
import { getProject } from "./../../services/projectServices";
import DeleteAlert from "./../management/common/alertDeletionModal";

const messages = {
  deleteSingle: "Delete the worklist? This cannot be undone.",
  deleteSelected: "Delete selected worklists? This cannot be undone."
};

class WorkList extends React.Component {
  state = {
    worklists: [],
    singleDeleteData: {},
    deleteSingleClicked: false,
    hasAddClicked: false,
    deleteAllClicked: false,
    selectAll: 0,
    selected: {}
  };

  componentDidMount = async () => {
    this.getWorkListData();
  };

  componentDidUpdate = prevProps => {
    if (prevProps.match.params.wid !== this.props.match.params.wid) {
      this.getWorkListData();
    }
  };
  getWorkListData = async () => {
    const {
      data: {
        ResultSet: { Result: worklists }
      }
    } = await getWorklist(
      sessionStorage.getItem("username"),
      this.props.match.params.wid
    );

    for (let worklist of worklists) {
      const { data: projectDetails } = await getProject(worklist.projectID);
      worklist.projectName = projectDetails.name;
    }
    this.setState({ worklists });
  };

  toggleRow = async (id, name) => {
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
      newSelected[id] = name;
      await this.setState({
        selectAll: 2
      });
    }
    this.setState({ selected: newSelected });
  };

  toggleSelectAll() {
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.worklists.forEach(project => {
        newSelected[project.workListID] = project.username;
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
      deleteSingleClicked: false,
      deleteAllClicked: false
    });
  };

  deleteAllSelected = () => {
    let newSelected = Object.assign({}, this.state.selected);
    const promiseArr = [];
    for (let project in newSelected) {
      promiseArr.push(deleteWorklist(newSelected[project], project));
    }
    Promise.all(promiseArr)
      .then(() => {
        this.getWorkListData();
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getWorkListData();
      });
    this.handleCancel();
  };

  deleteSingleWorklist = async () => {
    const { name, id } = this.state.singleDeleteData;
    deleteWorklist(name, id)
      .then(() => {
        this.setState({ deleteSingleClicked: false, singleDeleteData: {} });
        this.getWorkListData();
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
      });
  };

  clearCarets = string => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace("^", " ");
      }
      return string.trim();
    }
  };

  handleDeleteAll = () => {
    this.setState({ deleteAllClicked: true });
  };

  handleAddWorklist = () => {
    this.setState({ hasAddClicked: true });
  };

  handleFormInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSingleDelete = (name, id) => {
    this.setState({
      deleteSingleClicked: true,
      singleDeleteData: { name, id }
    });
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
              checked={this.state.selected[original.workListID]}
              onChange={() =>
                this.toggleRow(original.workListID, original.username)
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
        Header: "Open",
        minResizeWidth: 20,
        width: 50,
        Cell: original => (
          <div onClick={this.props.onClose}>
            <FaRegEye className="menu-clickable" />
          </div>
        )
      },
      {
        Header: "Subject",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => {
          const subjectName = this.clearCarets(
            original.row.checkbox.subjectName
          );
          return <div>{subjectName}</div>;
        }
      },
      {
        Header: "Project",
        accessor: "projectName",
        sortable: true,
        resizable: true,
        minWidth: 50
        // Cell: original => <div>{original.row.checkbox.projectName}</div>
      },
      {
        Header: "Comment",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
        // Cell: original => <div>{original.row.checkbox.description || ""}</div>
      },
      {
        Header: "",
        width: 45,
        minResizeWidth: 20,
        resizable: true,
        Cell: original => (
          <div
            onClick={() =>
              this.handleSingleDelete(
                original.row.checkbox.username,
                original.row.checkbox.workListID
              )
            }
          >
            <FaRegTrashAlt className="menu-clickable" />
          </div>
        )
      }
    ];
  };

  render = () => {
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    return (
      <div className="worklist-page">
        <div>{this.state.worklists.length}</div>
        <Table
          className="__table"
          data={this.state.worklists}
          columns={this.defineColumns()}
        />
        {this.state.deleteSingleClicked && (
          <DeleteAlert
            message={messages.deleteSingle}
            onCancel={this.handleCancel}
            onDelete={this.deleteSingleWorklist}
            error={this.state.errorMessage}
          />
        )}
      </div>
    );
  };
}

export default WorkList;
