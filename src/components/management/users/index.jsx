import React from "react";
import ReactTable from "react-table";
import { FaEdit, FaCheck, FaSave } from "react-icons/fa";
import "../menuStyle.css";
import {
  getUsers,
  updateUserProjectRole
} from "../../../services/userServices";
import ToolBar from "../common/basicToolBar";
import EditField from "./editField";
import UserRoleEditForm from "./userRoleEdit";
class Users extends React.Component {
  state = {
    data: [],
    hasAdminPermission: false,
    deleteAllClicked: false,
    selectAll: 0,
    selected: {},
    edit: [],
    roleEdit: [],
    showUserRoleEdit: false,
    userToEdit: ""
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

  getUserRole = async e => {
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
  updateUserRole = () => {
    const updates = [];
    const updatedBy = sessionStorage.getItem("username");
    for (let item of this.state.roleEdit) {
      const projectid = Object.keys(item);
      const role = Object.values(item);
      const body = { ...role[0], updatedBy };
      updates.push(
        updateUserProjectRole(projectid, this.state.userToEdit, body)
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
    console.log(userToEdit);
    this.setState(state => ({ showUserRoleEdit: !state.showUserRoleEdit }));
    this.setState({ userToEdit });
  };

  saveUSerClicked = index => {
    this.setState({ userClicked: index });
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
      showUserRoleEdit: false,
      edit: [],
      roleEdit: []
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
              this.displayUserRoleEdit(original.row.checkbox.username);
              this.saveUSerClicked(original.index);
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
      }
    ];
  };

  render = () => {
    const { data, userClicked, usersProjects } = this.state;

    return (
      <>
        <div className="users menu-display">
          <ToolBar />
          <ReactTable
            className="pro-table"
            data={data}
            columns={this.defineColumns()}
          />
          {this.state.showUserRoleEdit && (
            <UserRoleEditForm
              onSubmit={this.updateUserRole}
              onSelect={this.getUserRole}
              projectMap={this.props.projectMap}
              projects={usersProjects}
              onCancel={this.handleCancel}
              projectToRole={data[userClicked].projectToRole}
            />
          )}
        </div>
      </>
    );
  };
}

export default Users;
