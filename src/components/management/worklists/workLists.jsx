import React from "react";
import PropTypes from "prop-types";
import Table from "react-table";
import ToolBar from "../common/basicToolBar";
import { FaRegTrashAlt, FaEdit, FaRegEye } from "react-icons/fa";
import { getWorklists } from "../../../services/worklistServices";
import { getUsers } from "../../../services/userServices";
import { Link } from "react-router-dom";

class Projects extends React.Component {
  state = { worklists: [], userList: [] };

  componentDidMount = async () => {
    const {
      data: {
        ResultSet: { Result: worklists }
      }
    } = await getWorklists(sessionStorage.getItem("username"));
    const {
      data: {
        ResultSet: { Result: userList }
      }
    } = await getUsers();
    console.log(worklists, userList);
    this.setState({ worklists, userList });
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

  handleCancel = () => {};

  deleteAllSelected = async () => {};

  deleteSingleWorklist = async () => {};

  handleDeleteAll = () => {
    this.setState({ hasDeleteAllClicked: true });
  };

  handleSingleDelete = id => {
    this.setState({ hasDeleteSingleClicked: true, singleDeleteId: id });
  };

  handleAddWorklist = () => {
    this.setState({ hasAddClicked: true });
  };

  handleFormInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
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
                {user.username}
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
        // accessor: "description",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => <div>{original.row.description || ""}</div>
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

  render = () => {
    console.log("project", this.props);
    // const checkboxSelected = Object.values(this.state.selected).length > 0;
    return (
      <div className="projects menu-display" id="projects">
        <ToolBar
          onDelete={this.handleDeleteAll}
          onAdd={this.handleAddProject}
          //   selected={checkboxSelected}
        />
        <Table
          className="pro-table"
          data={this.state.worklists}
          columns={this.defineColumns()}
        />
      </div>
    );
  };
}

Projects.propTypes = {
  selection: PropTypes.string,
  onClose: PropTypes.func
};
export default Projects;
