import React from "react";
import ReactTable from "react-table";
import {
  FaEdit,
  FaCheck,
  FaSave,
  FaRegTrashAlt,
  FaUserLock,
  FaTimesCircle,
  FaMinus,
  FaTimes
} from "react-icons/fa";
import "../menuStyle.css";
import {
  getUsers,
  updateUserProjectRole,
  updateUser
} from "../../../services/userServices";
import ToolBar from "../common/basicToolBar";
import EditField from "./editField";
import UserRoleEditForm from "./userRoleEdit";
import UserPermissionEdit from "./userPermissionEdit";
class Users extends React.Component {
  state = {
    data: [],
    hasAdminPermission: false,
    deleteAllClicked: false,
    selectAll: 0,
    selected: {},
    edit: [],
    roleEdit: [],
    permissionEdit: {},
    showRoleEdit: false,
    userToEdit: "",
    userClicked: null,
    showPermissionEdit: false
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

  getUserRole = e => {
    const { value } = e.target;
    const { projectid } = e.target.dataset;
    if (this.state.roleEdit.length > 0) {
      this.setState(state => ({
        roleEdit: state.roleEdit.concat([{ [projectid]: { role: value } }])
      }));
    } else {
      this.setState({ roleEdit: [{ [projectid]: { role: value } }] });
    }
  };
  getUserPermission = e => {
    const { value, checked } = e.target;
    const newPermission = { ...this.state.permissionEdit, [value]: checked };
    this.setState({ permissionEdit: newPermission });
  };
  updateUserPermission = () => {
    let string = "";
    const keys = Object.keys(this.state.permissionEdit);
    const values = Object.values(this.state.permissionEdit);
    for (let i = 0; i < keys.length; i += 1) {
      if (values[i]) {
        string = string ? string + "," + keys[i] : "" + keys[i];
      }
    }
    updateUser(this.state.userToEdit, { permissions: string })
      .then(() => {
        this.getUserData();
        this.handleCancel();
      })
      .catch(err => {
        console.log(err);
      });
  };

  updateAdmin = async username => {
    updateUser(username, {
      admin: !this.state.hasAdminPermission
    })
      .then(() => {
        this.getUserData();
        this.handleCancel();
      })
      .catch(err => {
        console.log(err);
      });
  };

  updateUserRole = () => {
    const updates = [];
    const updatedBy = sessionStorage.getItem("username");
    for (let item of this.state.roleEdit) {
      const projectid = Object.keys(item);
      const role = Object.values(item);
      const body = { ...role[0], updatedBy };
      updates.push(
        updateUserProjectRole(projectid[0], this.state.userToEdit, body)
      );
    }
    this.handleCancel();
    Promise.all(updates)
      .then(() => {
        this.getUserData();
        this.handleCancel();
      })
      .catch(err => {
        console.log(err);
      });
  };

  handleOutClick = () => {
    this.setState({ edit: [] });
  };

  displayUserRoleEdit = userToEdit => {
    this.setState(state => ({ showRoleEdit: !state.showRoleEdit }));
  };

  displayUserPermissionEdit = index => {
    this.setState(state => ({
      showPermissionEdit: !state.showPermissionEdit
    }));
    const obj = {};
    this.state.data[index].permissions.forEach(el => {
      obj[el] = true;
    });
    this.setState({ permissionEdit: obj });
  };

  saveUserClicked = userToEdit => {
    this.setState({ userClicked: userToEdit.index });
    this.setState({ userToEdit: userToEdit.row.checkbox.username });
  };

  getUserData = async () => {
    const { data } = await getUsers();
    let usersProjects = [];
    let hasAdminPermission = false;
    //check if the signed in user has admin permissions
    const signInName = sessionStorage.getItem("username");
    for (let user of data) {
      if (user.username === signInName) {
        hasAdminPermission = user.admin;
        usersProjects = user.projects;
      }
    }
    for (let user of data) {
      let filteredProjects = [];
      for (let project of user.projects) {
        if (usersProjects.includes(project)) {
          filteredProjects.push(this.props.projectMap[project]);
        }
      }
      user.projects = filteredProjects;
    }
    this.setState({ data, hasAdminPermission, usersProjects });
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

  setWrapperRef = (node, id) => {
    this.wrapperRef = node;
  };

  handleClickOutside = event => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.handleOutClick();
    }
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
      showRoleEdit: false,
      edit: [],
      roleEdit: [],
      userToEdit: "",
      userClicked: null,
      showPermissionEdit: false
    });
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
      // {
      //   Header: "Color",
      //   className: "usersTable-cell",
      //   resizable: true,
      //   minResizeWidth: 20,
      //   minWidth: 20,
      //   className: "mng-user__cell",
      //   Cell: original => {
      //     const { username } = original.row.checkbox;
      //     const className =
      //       this.state.edit.color === username ? "user-color" : "";
      //     let color = original.row.checkbox.colorpreference;
      //     color = color ? `#${color}` : `#19ff75`;
      //     return (
      //       <p
      //         className={`menu-clickable wrapped ${className}`}
      //         style={{ color }}
      //         data-name="color"
      //         onClick={() => {
      //           this.handleEditField("color", username);
      //         }}
      //       >
      //         {original.row.checkbox.username}
      //       </p>
      //     );
      //   }
      // },
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
          <div
            onClick={() => {
              this.displayUserRoleEdit();
              this.saveUserClicked(original);
            }}
          >
            <p className="menu-clickable wrapped">
              {original.row.projects.join(", ")}
            </p>
          </div>
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
          return (
            <div
              className="centeredCell"
              onClick={async () => {
                this.updateAdmin(original.row.checkbox.username);
              }}
            >
              {original.row.checkbox.admin ? <FaCheck /> : <FaTimes />}
            </div>
          );
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
        Cell: original => {
          let text = this.convertArrToStr(original.row.permissions);
          const className = text ? "wrapped" : "wrapped add-permission";
          text = text ? text : "Change permissions";
          return (
            <div
              className="menu-clickable"
              onClick={() => {
                console.log("clicked in div");
                this.displayUserPermissionEdit(original.index);
                this.saveUserClicked(original);
              }}
            >
              <p className={className}>{text}</p>
            </div>
          );
        }
      },
      {
        Header: "",
        width: 45,
        minResizeWidth: 20,
        resizable: true,
        Cell: original =>
          this.state.hasAdminPermission ? (
            <div
              onClick={() => this.handleSingleDelete(original.row.checkbox.id)}
            >
              <FaRegTrashAlt className="menu-clickable" />
            </div>
          ) : null
      }
    ];
  };

  render = () => {
    const {
      data,
      userClicked,
      usersProjects,
      showRoleEdit,
      showPermissionEdit
    } = this.state;

    return (
      <>
        <div className="users menu-display">
          <ToolBar />
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
              projectToRole={data[userClicked].projectToRole}
            />
          )}
          {showPermissionEdit && (
            <UserPermissionEdit
              userPermission={data[userClicked].permissions}
              onSelect={this.getUserPermission}
              onCancel={this.handleCancel}
              onSubmit={this.updateUserPermission}
            />
          )}
        </div>
      </>
    );
  };
}

export default Users;
