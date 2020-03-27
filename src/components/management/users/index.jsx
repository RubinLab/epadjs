import React from "react";
import ReactTable from "react-table";
import { FaCheck, FaRegTrashAlt, FaTimes } from "react-icons/fa";
import "../menuStyle.css";
import {
  getUsers,
  updateUserProjectRole,
  deleteUserProjectRole,
  updateUser,
  deleteUser,
  createUser,
} from "../../../services/userServices";
import ToolBar from "../common/basicToolBar";
import UserRoleEditForm from "./userRoleEdit";
import UserPermissionEdit from "./userPermissionEdit";
import DeleteAlert from "../common/alertDeletionModal";
import CreateUser from "./CreateUserForm";

const messages = {
  deleteSingle: "Delete the user? This cannot be undone.",
  deleteSelected: "Delete selected users? This cannot be undone.",
};

class Users extends React.Component {
  state = {
    data: [],
    hasAdminPermission: false,
    deleteAllClicked: false,
    selectAll: 0,
    selected: {},
    edit: [],
    roleEdit: {},
    permissionEdit: {},
    showRoleEdit: false,
    userToEdit: "",
    clickedUserIndex: null,
    showPermissionEdit: false,
    errorMessage: "",
    hasAddClicked: false,
  };

  componentDidMount = () => {
    this.getUserData();
  };

  getUserData = async () => {
    const { data } = await getUsers();
    const mode = sessionStorage.getItem("mode");
    let usersProjects = [];
    let hasAdminPermission = false;
    const filteredProjects = [];
    //check if the signed in user has admin permissions
    const signInName = sessionStorage.getItem("username");
    for (let user of data) {
      if (user.username === signInName) {
        hasAdminPermission = user.admin;
        if (mode === "lite") {
          usersProjects = ["lite"];
        } else {
          usersProjects = user.projects;
        }
      }
    }
    if (mode === "lite") {
      for (let user of data) {
        if (user.projects.includes("lite")) {
          user.projects = ["lite"];
        } else {
          user.projects = [];
        }
      }
    } else {
      for (let user of data) {
        for (let project of user.projects) {
          if (usersProjects.includes(project)) {
            filteredProjects.push(this.props.projectMap[project]);
          }
        }
        user.projects = filteredProjects;
      }
    }
    this.setState({ data, hasAdminPermission, usersProjects });
  };

  handleAdd = () => {
    this.setState({ hasAddClicked: true });
  };

  getUserRole = e => {
    const { value } = e.target;
    const { projectid } = e.target.dataset;
    const roleEdit = { ...this.state.roleEdit };
    roleEdit[projectid] = { role: value };
    this.setState({ roleEdit });
  };
  getUserPermission = e => {
    const { value, checked } = e.target;
    const newPermission = { ...this.state.permissionEdit, [value]: checked };
    this.setState({ permissionEdit: newPermission });
  };
  getUserName = e => {
    const { value } = e.target;
    this.setState({ userToEdit: value });
  };
  updateUserPermission = () => {
    let permissions = "";
    const keys = Object.keys(this.state.permissionEdit);
    const values = Object.values(this.state.permissionEdit);
    for (let i = 0; i < keys.length; i += 1) {
      if (values[i]) {
        permissions = permissions ? permissions + "," + keys[i] : "" + keys[i];
      }
    }
    updateUser(this.state.userToEdit, { permissions: permissions })
      .then(() => {
        this.getUserData();
        this.handleCancel();
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
        console.log(err);
      });
  };

  updateAdmin = async (username, admin) => {
    updateUser(username, {
      admin: !admin,
    })
      .then(() => {
        this.getUserData();
        this.handleCancel();
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
        console.log(err);
      });
  };

  updateUserRole = () => {
    const updates = [];
    const updatedBy = sessionStorage.getItem("username");
    const { roleEdit } = this.state;
    for (let item in roleEdit) {
      if (roleEdit[item].role === "None") {
        updates.push(deleteUserProjectRole(item, this.state.userToEdit));
      } else {
        const body = { ...roleEdit[item], updatedBy };
        updates.push(
          updateUserProjectRole(item, this.state.userToEdit, body)
        );
      }
    }
    Promise.all(updates)
      .then(() => {
        this.getUserData();
        this.handleCancel();
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
        console.log(err);
      });
  };

  handleSingleDelete = () => {
    this.setState({ hasDeleteSingleClicked: true });
  };

  handleDeleteAll = () => {
    this.setState({ hasDeleteAllClicked: true });
  };

  deleteUser = username => {
    deleteUser(this.state.userToEdit)
      .then(() => {
        this.getUserData();
        this.handleCancel();
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
        console.log(err);
      });
  };

  deleteAllSelected = () => {
    const promises = [];
    const usernNames = Object.keys(this.state.selected);
    usernNames.forEach(user => {
      promises.push(deleteUser(user));
    });
    Promise.all(promises)
      .then(() => {
        this.getUserData();
        this.handleCancel();
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
        console.log(err);
      });
  };

  displayUserRoleEdit = () => {
    this.setState(state => ({ showRoleEdit: !state.showRoleEdit }));
  };

  displayUserPermissionEdit = index => {
    this.setState(state => ({
      showPermissionEdit: !state.showPermissionEdit,
    }));
    const obj = {};
    this.state.data[index].permissions.forEach(el => {
      obj[el] = true;
    });
    this.setState({ permissionEdit: obj });
  };

  saveClickedUser = userToEdit => {
    this.setState({ clickedUserIndex: userToEdit.index });
    this.setState({ userToEdit: userToEdit.row.checkbox.username });
  };

  convertArrToStr = arr => {
    const mode = sessionStorage.getItem("mode");
    if (arr.length > 0) {
      const result = [];
      const displayMap = {
        CreateUser: "user",
        CreatePAC: "connection",
        CreateAutoPACQuery: "query",
        CreateProject: "project",
      };
      arr.forEach(el => {
        if (mode === "lite" && el === "CreateProject") {
          return;
        } else {
          result.push(displayMap[el]);
        }
      });
      return result.join(", ");
    } else {
      return "";
    }
  };

  toggleRow = async username => {
    let newSelected = Object.assign({}, this.state.selected);
    if (newSelected[username]) {
      delete newSelected[username];
      let values = Object.values(newSelected);
      if (values.length === 0) {
        this.setState({
          selectAll: 0,
        });
      }
    } else {
      newSelected[username] = true;
      await this.setState({
        selectAll: 2,
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
      selectAll: this.state.selectAll === 0 ? 1 : 0,
    });
  }

  handleCancel = () => {
    this.setState({
      edit: [],
      roleEdit: [],
      permissionEdit: {},
      showRoleEdit: false,
      userToEdit: "",
      clickedUserIndex: null,
      showPermissionEdit: false,
      hasDeleteAllClicked: false,
      hasDeleteSingleClicked: false,
      errorMessage: "",
      hasAddClicked: false,
    });
  };

  handleAdd = () => {
    this.setState({ hasAddClicked: true });
  };

  createUser = () => {
    let body = {};
    const { userToEdit } = this.state;
    if (userToEdit) {
      let permissions = "";
      const keys = Object.keys(this.state.permissionEdit);
      const values = Object.values(this.state.permissionEdit);
      for (let i = 0; i < keys.length; i += 1) {
        if (values[i]) {
          permissions = permissions
            ? permissions + "," + keys[i]
            : "" + keys[i];
        }
      }
      body = permissions
        ? { ...body, username: userToEdit, email: userToEdit, permissions }
        : { ...body, username: userToEdit, email: userToEdit };
      createUser(body)
        .then(async () => {
          await this.updateUserRole();
          this.getUserData();
          this.handleCancel();
        })
        .catch(err => {
          this.setState({ errorMessage: err.response.data.message });
          console.log(err);
        });
    }
  };

  defineColumns = () => {
    const mode = sessionStorage.getItem("mode");
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
        width: 45,
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
        // Cell: original => <div data-name="firstname">{firstname}</div>
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
        // Cell: original => <div data-name="lastname">{lastname}</div>
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
        // Cell: original => <div data-name="email">{email}</div>
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
        Cell: original => {
          const className =
            original.row.projects.length > 0
              ? "wrapped"
              : "wrapped click-to-add";

          const text =
            original.row.projects.length > 0
              ? original.row.projects.join(", ")
              : "Add user to a project";
          return (
            <div
              onClick={() => {
                this.displayUserRoleEdit();
                this.saveClickedUser(original);
              }}
            >
              <p className={className}>{text}</p>
            </div>
          );
        },
      },
      {
        Header: "Admin",
        className: "usersTable-cell",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 20,
        className: "mng-user__cell",
        Cell: original => {
          const { username, admin } = original.row.checkbox;
          return (
            <div
              className="centeredCell"
              onClick={async () => {
                this.updateAdmin(username, admin);
              }}
            >
              {original.row.checkbox.admin ? <FaCheck /> : <FaTimes />}
            </div>
          );
        },
      },

      {
        Header: "Permissions",
        accessor: "permissions",
        className: "usersTable-cell",
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        className: "mng-user__cell",
        Cell: original => {
          let text = this.convertArrToStr(original.row.permissions);
          const className = text ? "wrapped" : "wrapped click-to-add";
          text = text ? text : "Give user permission";
          return (
            <div
              className="menu-clickable"
              onClick={() => {
                this.displayUserPermissionEdit(original.index);
                this.saveClickedUser(original);
              }}
            >
              <p className={className}>{text}</p>
            </div>
          );
        },
      },
      {
        Header: "",
        width: 45,
        minResizeWidth: 20,
        resizable: true,
        Cell: original =>
          this.state.hasAdminPermission ? (
            <div
              onClick={() => {
                this.handleSingleDelete();
                this.saveClickedUser(original);
              }}
            >
              <FaRegTrashAlt className="menu-clickable" />
            </div>
          ) : null,
      },
    ];
  };

  render = () => {
    const {
      data,
      clickedUserIndex,
      usersProjects,
      showRoleEdit,
      showPermissionEdit,
    } = this.state;
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    return (
      <>
        <div className="users menu-display">
          <ToolBar
            onAdd={this.handleAdd}
            onDelete={this.handleDeleteAll}
            selected={checkboxSelected}
          />
          <ReactTable
            className="pro-table"
            data={data}
            columns={this.defineColumns()}
          />
          {showRoleEdit && (
            <UserRoleEditForm
              onSubmit={this.updateUserRole}
              onSelect={this.getUserRole}
              projectMap={this.props.projectMap}
              projects={usersProjects}
              onCancel={this.handleCancel}
              projectToRole={data[clickedUserIndex].projectToRole}
              error={this.state.errorMessage}
            />
          )}
          {showPermissionEdit && (
            <UserPermissionEdit
              userPermission={data[clickedUserIndex].permissions}
              onSelect={this.getUserPermission}
              onCancel={this.handleCancel}
              onSubmit={this.updateUserPermission}
            />
          )}
          {this.state.hasDeleteAllClicked && (
            <DeleteAlert
              message={messages.deleteSelected}
              onCancel={this.handleCancel}
              onDelete={this.deleteAllSelected}
              error={this.state.errorMessage}
            />
          )}
          {this.state.hasDeleteSingleClicked && (
            <DeleteAlert
              message={messages.deleteSingle}
              onCancel={this.handleCancel}
              onDelete={this.deleteUser}
              error={this.state.errorMessage}
            />
          )}
          {this.state.hasAddClicked && (
            <CreateUser
              onCancel={this.handleCancel}
              onSelectRole={this.getUserRole}
              onSelectPermission={this.getUserPermission}
              onSubmit={this.createUser}
              projectMap={this.props.projectMap}
              projects={usersProjects}
              error={this.state.errorMessage}
              getUserName={this.getUserName}
            />
          )}
        </div>
      </>
    );
  };
}

export default Users;
