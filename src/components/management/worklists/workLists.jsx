import React from "react";
import PropTypes from "prop-types";
import Table from "react-table";
import { toast } from "react-toastify";
import ToolBar from "../common/basicToolBar";
import { FaRegTrashAlt, FaEdit, FaRegEye } from "react-icons/fa";
import {
  getWorklistsOfCreator,
  deleteWorklist,
  saveWorklist,
  updateWorklistAssignee,
  updateWorklist
} from "../../../services/worklistServices";
import { getUsers } from "../../../services/userServices";
import { Link } from "react-router-dom";
import DeleteAlert from "../common/alertDeletionModal";
import CreationForm from "./worklistCreationForm";
import EditField from "../../sideBar/editField";

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
    selected: {},
    cellDoubleClicked: false,
    clickedIndex: null,
    worklistId: null
  };

  componentDidMount = async () => {
    this.getWorkListData();
    const { data: userList } = await getUsers();
    this.setState({ userList });
    document.addEventListener("mousedown", this.handleClickOutside);
    document.addEventListener("keydown", this.handleKeyboardEvent);
  };

  componentWillUnmount = () => {
    document.removeEventListener("mousedown", this.handleClickOutside);
    document.removeEventListener("keydown", this.handleKeyboardEvent);
  };

  getWorkListData = async () => {
    const { data: worklists } = await getWorklistsOfCreator(
      sessionStorage.getItem("username")
    );
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
        newSelected[project.worklistID] = project.username;
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
      dueDate: "",
      deleteSingleClicked: false,
      deleteAllClicked: false,
      selected: {},
      user: "",
      cellDoubleClicked: false,
      worklistId: ""
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
        this.setState({ selectAll: 0 });
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
    let { name, id, user, description, dueDate } = this.state;
    if (!name || !id || !user) {
      this.setState({ error: messages.fillRequiredFields });
    } else {
      description = description ? description : "";
      saveWorklist(id, name, user, description, dueDate)
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

  handleUpdateField = (index, fieldName, worklistId, defaultValue) => {
    console.log("id: ", worklistId);
    this.setState({
      cellDoubleClicked: fieldName,
      clickedIndex: index,
      worklistId: worklistId
    });
    fieldName === "name"
      ? this.setState({ name: defaultValue })
      : this.setState({ description: defaultValue });
  };

  handleKeyboardEvent = e => {
    const { name, description, worklistId, cellDoubleClicked } = this.state;
    const fieldUpdateValidation =
      (name || description) && worklistId && cellDoubleClicked;
    if (e.key === "Escape") {
      this.handleUpdateField(null, null);
    } else if (e.key === "Enter" && fieldUpdateValidation) {
      console.log("detect enter");
      this.updateWorklist();
    }
  };

  setWrapperRef = (node, id) => {
    this.wrapperRef = node;
  };

  handleClickOutside = event => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.handleUpdateField(null);
    }
  };

  getUpdate = e => {
    // e.stopPropagation();
    const { name, value } = e.target;
    console.log(name, value);
    this.setState({ [name]: value });
  };

  updateWorklistAssignee = (e, username, worklistID) => {
    updateWorklistAssignee(username, worklistID, {
      user: e.target.value
    })
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

  updateWorklist = () => {
    const { name, description, worklistId } = this.state;
    const body = name ? { name } : { description };
    updateWorklist(worklistId, body)
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
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selected[original.worklistID]}
              onChange={() =>
                this.toggleRow(original.worklistID, original.username)
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
        minWidth: 50,
        Cell: original => {
          const { cellDoubleClicked, clickedIndex } = this.state;
          return cellDoubleClicked === "name" &&
            clickedIndex === original.index ? (
            <div ref={this.setWrapperRef} className="--commentInput">
              <EditField
                name="name"
                onType={this.getUpdate}
                default={this.state.name}
              />
            </div>
          ) : (
            <div
              className="--commentCont"
              onClick={() =>
                this.handleUpdateField(
                  original.index,
                  "name",
                  original.row.checkbox.worklistID,
                  original.row.checkbox.name
                )
              }
            >
              {original.row.checkbox.name}
            </div>
          );
        }
      },
      {
        Header: "Open",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        width: 50,
        Cell: original => (
          <Link
            className="open-link"
            to={"/worklist/" + original.row.checkbox.worklistID}
          >
            <div onClick={this.props.onClose}>
              <FaRegEye className="menu-clickable" />
            </div>
          </Link>
        )
      },
      {
        Header: "User",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => {
          const { username, worklistID } = original.row.checkbox;
          const options = [];
          let index = 0;
          for (let user of this.state.userList) {
            options.push(
              <option key={`${index}-${user.username}`} value={user.username}>
                {user.username}
              </option>
            );
            index++;
          }
          return (
            <select
              className="user-select"
              name="user_id"
              defaultValue={original.row.checkbox.username}
              onChange={e =>
                this.updateWorklistAssignee(e, username, worklistID)
              }
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
        Cell: original => {
          let { description } = original.row.checkbox;
          description = description || "";
          const className = original.row.checkbox.description
            ? "wrapped"
            : "wrapped click-to-add";
          const { cellDoubleClicked, clickedIndex } = this.state;
          return cellDoubleClicked === "description" &&
            clickedIndex === original.index ? (
            <div ref={this.setWrapperRef} className="--commentInput">
              <EditField
                name="description"
                onType={this.getUpdate}
                default={this.state.description}
              />
            </div>
          ) : (
            <div
              className={`--commentCont ${className}`}
              onClick={() =>
                this.handleUpdateField(
                  original.index,
                  "description",
                  original.row.checkbox.worklistID,
                  description
                )
              }
            >
              {description || "Add description"}
            </div>
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
            onClick={() =>
              this.handleSingleDelete(
                original.row.checkbox.username,
                original.row.checkbox.worklistID
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
      <div className="worklist menu-display" id="worklist">
        <ToolBar
          onDelete={this.handleDeleteAll}
          onAdd={this.handleAddWorklist}
          selected={checkboxSelected}
        />
        <Table
          NoDataComponent={() => null}
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
