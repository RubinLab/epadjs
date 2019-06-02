import React from "react";
import PropTypes from "prop-types";
import Table from "react-table";
import { toast } from "react-toastify";
import ToolBar from "../common/basicToolBar";
import { FaRegTrashAlt, FaEdit, FaRegEye } from "react-icons/fa";
import {
  getWorklists,
  deleteWorklist,
  saveWorklist
} from "../../../services/worklistServices";
import { getUsers } from "../../../services/userServices";
import { Link } from "react-router-dom";
import DeleteAlert from "../common/alertDeletionModal";
import CreationForm from "./worklistCreationForm";

const messages = {
  deleteSingle: "Delete the worklist? This cannot be undone.",
  deleteSelected: "Delete selected projects? This cannot be undone.",
  fillRequiredFields: "Please fill the required fields",
  addWorklistError:
    "An error occured while saving the worklist. Please try again"
};

class WorkList extends React.Component {
  state = {
    worklists: [],
    userList: [],
    singleDeleteData: {},
    hasDeleteSingleClicked: false,
    hasAddClicked: false
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
      delete newSelected[id];
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
      this.state.data.forEach(project => {
        newSelected[project.id] = true;
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
      error: ""
    });
  };

  deleteAllSelected = async () => {};

  deleteSingleWorklist = async () => {
    const { name, id } = this.state.singleDeleteData;
    deleteWorklist(name, id)
      .then(() => {
        this.setState({ hasDeleteSingleClicked: false, singleDeleteData: {} });
        this.getWorkListData();
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
      });
  };

  handleDeleteAll = () => {
    this.setState({ hasDeleteAllClicked: true });
  };

  handleAddWorklist = () => {
    this.setState({ hasAddClicked: true });
  };

  handleFormInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSaveWorklist = e => {
    //check if required fields are filled
    let { name, id, user, description } = this.state;
    console.log(name, id, user);
    if (!name || !id || !user) {
      console.log("in here");
      this.setState({ error: messages.fillRequiredFields });
    } else {
      description = description ? description : "";
      saveWorklist(user, id, description, name)
        .then(() => {
          this.getWorkListData();
        })
        .catch(
          err =>
            toast.error(err.response.message + " " + messages.addWorklistError),
          {
            autoClose: false
          }
        );
      //close the modal
      this.handleCancel();
      //if all required fields are ok
      //make api call to save

      //when saved refresh the page to show all worklists
    }
  };

  handleSingleDelete = (name, id) => {
    this.setState({
      hasDeleteSingleClicked: true,
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
              //   checked={this.state.selected[original.id]}
              onChange={() => this.toggleRow(original.id, original.name)}
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
          <Link
            className="open-link"
            to={"/search/" + original.row.checkbox.id}
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
    return (
      <div className="worklist menu-display" id="worklist">
        <ToolBar
          onDelete={this.handleDeleteAll}
          onAdd={this.handleAddWorklist}
          //   selected={checkboxSelected}
        />
        <Table
          className="pro-table"
          data={this.state.worklists}
          columns={this.defineColumns()}
        />
        {this.state.hasDeleteSingleClicked && (
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
      </div>
    );
  };
}

WorkList.propTypes = {
  selection: PropTypes.string,
  onClose: PropTypes.func
};
export default WorkList;
