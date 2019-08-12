import React from "react";
import ReactTable from "react-table";
import { FaEdit, FaCheck, FaSave } from "react-icons/fa";
import "../menuStyle.css";
import { getUsers } from "../../../services/userServices";
import ToolBar from "../common/basicToolBar";
import EditUsers from "./editUsersForm";
import ColorPicker from "./colorPicker";
import EditField from "./editField";

class Users extends React.Component {
  state = {
    data: [],
    showColorpicker: false,
    hasAdminPermission: false,
    deleteAllClicked: false,
    selectAll: 0,
    selected: {},
    edit: {}
  };

  componentDidMount = () => {
    this.getUserData();
    document.addEventListener("mousedown", this.handleClickOutside);
    document.addEventListener("keydown", this.escapeFieldInput);
  };

  componentWillUnmount = () => {
    document.removeEventListener("mousedown", this.handleClickOutside);
    document.removeEventListener("keydown", this.escapeFieldInput);
  };

  escapeFieldInput = e => {
    if (e.key === "Escape") {
      this.handleOutClick();
    }
  };

  handleEditField = (field, id) => {
    const { edit } = this.state;
    edit[field] = id;
    this.setState({ edit });
  };

  handleOutClick = () => {
    this.setState({ edit: {} });
  };
  getUserData = async () => {
    const result = await getUsers();
    const data = result.data.ResultSet.Result;
    this.setState({ data });
    let hasAdminPermission = false;
    //check if the signed in user has admin permissions
    for (let user of data) {
      if (user.username === sessionStorage.getItem("username")) {
        hasAdminPermission = user.admin;
      }
    }
    this.setState({ hasAdminPermission });
  };

  convertArrToStr = arr => {
    return arr.reduce((all, item, index) => {
      if (item.length > 0) {
        all.length > 0 ? (all += ", " + item) : (all += item);
      }
      return all;
    }, "");
  };

  toggleRow = async username => {
    let newSelected = Object.assign({}, this.state.selected);
    if (newSelected[username]) {
      delete newSelected[username];
      let values = Object.values(newSelected);
      if (values.length === 0) {
        this.setState({
          selectAll: 0
        });
      }
    } else {
      newSelected[username] = true;
      await this.setState({
        selectAll: 2
      });
    }
    this.setState({ selected: newSelected });
  };

  toggleSelectAll() {
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.data.forEach(users => {
        newSelected[users.username] = true;
      });
    }

    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  }

  /**
   * Set the wrapper ref
   */
  setWrapperRef = (node, id) => {
    this.wrapperRef = node;
  };

  /**
   * Alert if clicked on outside of element
   */
  handleClickOutside = event => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.handleOutClick();
    }
  };

  defineColumns = () => {
    return [
      {
        id: "checkbox",
        accessor: "",
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              className="checkbox"
              checked={this.state.selected[original.username]}
              onChange={() => this.toggleRow(original.username)}
            />
          );
        },
        Header: x => {
          return (
            <input
              type="checkbox"
              className="checkbox"
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
        width: 45
      },
      {
        Header: "First",
        accessor: "firstname",
        className: "usersTable-cell",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 35,
        className: "mng-user__cell",
        Cell: original => {
          const { firstname, username } = original.row.checkbox;
          return this.state.edit.firstname === username ? (
            <div ref={this.setWrapperRef}>
              <EditField default={firstname} />
            </div>
          ) : (
            <div
              data-name="firstname"
              onClick={() => {
                this.handleEditField("firstname", username);
              }}
            >
              {firstname}
            </div>
          );
        }
      },
      {
        Header: "Last",
        accessor: "lastname",
        className: "usersTable-cell",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 35,
        className: "mng-user__cell",
        Cell: original => {
          const { lastname, username } = original.row.checkbox;
          return this.state.edit.lastname === username ? (
            <div ref={this.setWrapperRef}>
              <EditField default={lastname} />
            </div>
          ) : (
            <div
              data-name="lastname"
              onClick={() => {
                this.handleEditField("lastname", username);
              }}
            >
              {lastname}
            </div>
          );
        }
      },
      {
        Header: "Email",
        accessor: "email",
        className: "usersTable-cell",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        className: "mng-user__cell",
        Cell: original => {
          const { email, username } = original.row.checkbox;
          return this.state.edit.email === username ? (
            <div ref={this.setWrapperRef}>
              <EditField default={email} />
            </div>
          ) : (
            <div
              data-name="email"
              onClick={() => {
                this.handleEditField("email", username);
              }}
            >
              {email}
            </div>
          );
        }
      },
      {
        Header: "Color",
        className: "usersTable-cell",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 20,
        className: "mng-user__cell",
        Cell: original => {
          let color = original.row.checkbox.colorpreference;
          color = color ? `#${color}` : `#19ff75`;
          return (
            <p className="menu-clickable wrapped" style={{ color }}>
              {original.row.checkbox.username}
            </p>
          );
        }
      },
      {
        Header: "Projects",
        className: "usersTable-cell",
        accessor: "projects",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        className: "mng-user__cell",
        Cell: original => (
          <p className="menu-clickable wrapped">
            {original.row.projects.join(", ")}
          </p>
        )
      },
      {
        Header: "Admin",
        className: "usersTable-cell",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 20,
        className: "mng-user__cell",
        Cell: original => {
          return original.row.checkbox.admin ? (
            <div className="centeredCell"> {<FaCheck />}</div>
          ) : null;
        }
      },

      {
        Header: "Permissions",
        accessor: "permissions",
        className: "usersTable-cell",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        className: "mng-user__cell",
        Cell: original => (
          <p className="menu-clickable wrapped">
            {this.convertArrToStr(original.row.permissions)}
          </p>
        )
      },
      {
        Header: "Enabled",
        className: "usersTable-cell",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 30,
        className: "mng-user__cell",
        Cell: original => {
          return original.row.checkbox.enabled ? (
            <div className="centeredCell"> {<FaCheck />}</div>
          ) : null;
        }
      },
      {
        Header: "Edit",
        width: 45,
        minResizeWidth: 20,
        resizable: true,
        className: "mng-user__cell",
        Cell: original => {
          return original.row.checkbox.username ===
            sessionStorage.getItem("username") ||
            this.state.hasAdminPermission ? (
            <div
              onClick={() => {
                this.setState({
                  hasEditClicked: true,
                  userToEdit: original.row.checkbox
                });
              }}
            >
              <FaEdit className="menu-clickable" />
            </div>
          ) : null;
        }
      }
    ];
  };

  handleCancel = () => {
    this.setState({
      hasAddClicked: false,
      error: "",
      delAll: false,
      hasEditClicked: false,
      delOne: false,
      selectedOne: {},
      displayCreationForm: false,
      firstname: "",
      lastname: "",
      email: "",
      colorpreference: "",
      showColorpicker: false
    });
  };

  handleColorClick = () => {
    this.setState(state => ({ showColorPicker: !state.showColorPicker }));
  };

  render = () => {
    console.log(this.state);
    const pageSize =
      this.state.data.length < 10 ? 10 : this.state.data.length >= 40 ? 50 : 20;
    return (
      <>
        <div className="users menu-display">
          <ToolBar />
          <ReactTable
            className="pro-table"
            data={this.state.data}
            columns={this.defineColumns()}
            pageSizeOptions={[10, 20, 50]}
            defaultPageSize={pageSize}
          />
          {this.state.hasEditClicked && (
            <EditUsers
              onCancel={this.handleCancel}
              userToEdit={this.state.userToEdit}
              handleColorClick={this.handleColorClick}
              admin={this.state.hasAdminPermission}
              // onType={this.handleFormInput}
              // onSubmit={this.editConnection}
            />
          )}
        </div>
        {this.state.showColorPicker && (
          <ColorPicker onCancel={this.handleColorClick} />
        )}
        {/* {this.state.showColorPicker && <div>here</div>} */}
      </>
    );
  };
}

export default Users;
