import React from "react";
import PropTypes from "prop-types";
import Table from "react-table";
import { toast } from "react-toastify";
import ToolBar from "../common/basicToolBar";
import { FaRegTrashAlt, FaEdit, FaRegEye } from "react-icons/fa";
import {
  getWorklists,
  deleteWorklist,
  saveWorklist,
  updateWorklist
} from "../../../services/worklistServices";
import { getUsers } from "../../../services/userServices";
import { Link } from "react-router-dom";
import DeleteAlert from "../common/alertDeletionModal";
import CreationForm from "./worklistCreationForm";

const messages = {
  deleteSingle: "Delete the worklist? This cannot be undone.",
  deleteSelected: "Delete selected worklists? This cannot be undone.",
  fillRequiredFields: "Please fill the required fields",
  addWorklistError: "An error occured while saving the worklist.",
  updateWorklistError: "An error occured while updating the worklist."
};

class WorkList extends React.Component {
  state = {
    worklists: [],
    userList: [],
    singleDeleteData: {},
    deleteSingleClicked: false,
    hasAddClicked: false,
    deleteAllClicked: false,
    selectAll: 0,
    selected: {}
  };

  componentDidMount = async () => {
    this.getWorkListData();
    const {
      data: {
        ResultSet: { Result: userList }
      }
    } = await getUsers();
    this.setState({ userList });
  };

  getWorkListData = async () => {
    const {
      data: {
        ResultSet: { Result: worklists }
      }
    } = await getWorklists(sessionStorage.getItem("username"));
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

  handleSaveWorklist = e => {
    let { name, id, user, description } = this.state;
    if (!name || !id || !user) {
      this.setState({ error: messages.fillRequiredFields });
    } else {
      description = description ? description : "";
      saveWorklist(user, id, description, name)
        .then(() => {
          this.getWorkListData();
        })
        .catch(error =>
          toast.error(
            messages.addWorklistError + ": " + error.response.data.message,
            {
              autoClose: false
            }
          )
        );
      this.handleCancel();
    }
  };

  handleSingleDelete = (name, id) => {
    this.setState({
      deleteSingleClicked: true,
      singleDeleteData: { name, id }
    });
  };

  updateWorklist = e => {
    updateWorklist(e.target.value, e.target.dataset.id)
      .then(() => this.getWorkListData())
      .catch(error =>
        toast.error(
          messages.updateWorklistError + ": " + error.response.data.message,
          {
            autoClose: false
          }
        )
      );
    this.handleCancel();
  };

  defineColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
        width: 30,
        Cell: ({ original }) => {
          console.log(original);
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
        Header: "Name",
        accessor: "name",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: "Open",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        width: 50,
        Cell: original => (
          // <Link
          //   className="open-link"
          //   to={"/search/" + original.row.checkbox.id}
          // >
          <div onClick={this.props.onClose}>
            <FaRegEye className="menu-clickable" />
          </div>
          // </Link>
        )
      },
      {
        Header: "User",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => {
          const options = [];
          let index = 0;
          for (let user of this.state.userList) {
            options.push(
              <option key={`${index}-${user.username}`} value={user.username}>
                {user.displayname}
              </option>
            );
            index++;
          }
          return (
            <select
              className="user-select"
              defaultValue={original.row.checkbox.username}
              onChange={this.updateWorklist}
              data-id={original.row.checkbox.workListID}
            >
              {options}
            </select>
          );
        }
      },
      {
        Header: "Description",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => <div>{original.row.checkbox.description || ""}</div>
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
    console.log(this.state);
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    return (
      <div className="worklist menu-display" id="worklist">
        <ToolBar
          onDelete={this.handleDeleteAll}
          onAdd={this.handleAddWorklist}
          selected={checkboxSelected}
        />
        <Table
          className="pro-table"
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
        {this.state.hasAddClicked && (
          <CreationForm
            users={this.state.userList}
            onCancel={this.handleCancel}
            onChange={this.handleFormInput}
            onSubmit={this.handleSaveWorklist}
            error={this.state.error}
          />
        )}

        {this.state.deleteAllClicked && (
          <DeleteAlert
            message={messages.deleteSelected}
            onCancel={this.handleCancel}
            onDelete={this.deleteAllSelected}
            error={this.state.errorMessage}
          />
        )}
      </div>
    );
  };
}

WorkList.propTypes = {
  selection: PropTypes.string,
  onClose: PropTypes.func
};
export default WorkList;
