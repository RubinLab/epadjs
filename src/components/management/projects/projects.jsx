import React from "react";
import PropTypes from "prop-types";
import Table from "react-table";
import { FaRegTrashAlt, FaEdit, FaRegEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../menuStyle.css";
import {
  getProjects,
  deleteProject,
  saveProject,
  updateProject,
  getProjectUsers,
  editUserRole
} from "../../../services/projectServices";
import { getUsers } from "../../../services/userServices";
import ToolBar from "../common/basicToolBar";
import DeleteAlert from "./alertDeletionModal";
import ProjectCreationForm from "./projectCreationForm";
import ProjectEditingForm from "./projectEditingForm";
import UserRoleEditingForm from "./userRoleEditingForm";
import ProtectedRoute from "../../common/protectedRoute";
import SearchView from "../../searchView/searchView";

const messages = {
  deleteSingle: "Delete the project? This cannot be undone.",
  deleteSelected: "Delete selected projects? This cannot be undone."
};

//NICE TO HAVES
//TODO projects - add default template feature
//TODO show one error message only
//TODO change the no selection behavior
//TODO change the color of the row if the check box is selected
/*TODO api will be updated to return permission info 
  in response. UI will be updated accordingly with conditional rendering 
  to disable the checkbox if user doesn't have any permission to edit that project */
//TODO add project names to delete project and user roles editing pop ups
//TODO Add tool tip for icons/button

class Projects extends React.Component {
  state = {
    user: "",
    data: [],
    selected: {},
    selectAll: 0,
    errorMessage: null,
    singleDeleteId: "",
    hasDeleteSingleClicked: false,
    hasDeleteAllClicked: false,
    noSelection: false,
    hasAddClicked: false,
    hasEditClicked: false,
    hasUserRolesClicked: false,
    id: "",
    name: "",
    description: "",
    type: "Private",
    defaultTemplate: "",
    userRoles: [],
    newRoles: {}
  };

  componentDidMount = () => {
    this.getProjectData();
    this.setState({ user: sessionStorage.getItem("username") });
  };

  handleClickUSerRoles = async id => {
    const userRoles = [];
    try {
      const {
        data: {
          ResultSet: { Result: users }
        }
      } = await getUsers();

      const {
        data: {
          ResultSet: { Result: roles }
        }
      } = await getProjectUsers(id);
      for (let i = 0; i < users.length; i++) {
        for (let k = 0; k < roles.length; k++) {
          if (users[i].username === roles[k].username) {
            userRoles.push({ name: users[i].username, role: roles[k].role });
            break;
          }
        }
        if (userRoles.length !== i + 1) {
          userRoles.push({ name: users[i].username, role: "None" });
        }
      }
      this.setState({ userRoles });
    } catch (err) {
      // this.setState({ error: true });
    }
  };

  getProjectData = async () => {
    try {
      const {
        data: {
          ResultSet: { Result: data }
        }
      } = await getProjects();
      this.setState({ data });
    } catch (err) {
      // this.setState({ error: true });
    }
  };

  clearProjectInfo = () => {
    this.setState({
      name: "",
      description: "",
      id: "",
      type: "Private"
    });
  };

  saveNewProject = async () => {
    const { name, description, defaultTemplate, id, user, type } = this.state;
    if (!name || !id) {
      this.setState({ errorMessage: "Please fill the required fields" });
    } else {
      const postData = saveProject(
        name,
        description,
        defaultTemplate,
        id,
        user,
        type
      );
      postData
        .then(res => {
          if (res.status === 200) {
            this.setState({
              hasAddClicked: false,
              errorMessage: null
            });
            this.clearProjectInfo();
            this.getProjectData();
          }
        })
        .catch(error => {
          this.setState({ errorMessage: error.response.data.message });
        });
    }
  };

  editProject = async () => {
    const { name, description, defaultTemplate, id, type } = this.state;
    const editData = updateProject(id, name, description, type);
    editData
      .then(res => {
        if (res.status === 200) {
          this.setState({
            hasEditClicked: false,
            errorMessage: null
          });
          this.clearProjectInfo();
          this.getProjectData();
        }
      })
      .catch(error => {
        this.setState({
          errorMessage: error.response.data.message
        });
        this.clearProjectInfo();
      });
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
      hasDeleteSingleClicked: false,
      id: "",
      hasDeleteAllClicked: false,
      singleDeleteId: "",
      noSelection: false,
      hasAddClicked: false,
      hasEditClicked: false,
      hasUserRolesClicked: false,
      errorMessage: null
    });
  };

  deleteAllSelected = async () => {
    let newSelected = Object.assign({}, this.state.selected);
    const notDeleted = [];
    for (let project in newSelected) {
      await deleteProject(project)
        .then(() => {
          delete newSelected[project];
          this.setState({ selected: newSelected });
        })
        .catch(err => {
          notDeleted.push(newSelected[project]);
          let names = notDeleted.join(", ");
          this.setState({
            errorMessage: err.response.data.message + ": " + names
          });
        })
        .finally(() => {
          this.getProjectData();
        });
    }
  };

  deleteSingleProject = async () => {
    deleteProject(this.state.singleDeleteId)
      .then(() => {
        this.setState({ singleDeleteId: "", hasDeleteSingleClicked: false });
        this.getProjectData();
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
      });
  };

  handleDeleteAll = () => {
    this.setState({ hasDeleteAllClicked: true });
  };

  handleSingleDelete = id => {
    this.setState({ hasDeleteSingleClicked: true, singleDeleteId: id });
  };

  handleAddProject = () => {
    this.setState({ hasAddClicked: true });
  };

  handleFormInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleRoleEditing = e => {
    const { name, value } = e.target;
    const newObj = { [name]: value };
    const oldState = Object.assign({}, this.state.newRoles);
    const newRoles = Object.assign(oldState, newObj);
    this.setState({ newRoles });
  };

  editRoles = async () => {
    const { id } = this.state;
    const editList = [];
    const roles = Object.assign({}, this.state.newRoles);
    for (let prop in roles) {
      editList.push(editUserRole(id, prop, roles[prop]));
      delete roles[prop];
    }
    Promise.all(editList)
      .then(() => {
        this.setState({ newRoles: roles, hasUserRolesClicked: false });
        this.getProjectData();
      })
      .catch(error => {
        this.setState({ errorMessage: error.response.data.message });
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
              checked={this.state.selected[original.id]}
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
        Header: "Description",
        accessor: "description",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: "Type",
        accessor: "type",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: "Users",
        accessor: "loginNames",
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => {
          return (
            <p
              className="menu-clickable wrapped"
              onClick={async () => {
                await this.handleClickUSerRoles(original.row.checkbox.id);
                this.setState({
                  hasUserRolesClicked: true,
                  id: original.row.checkbox.id
                });
              }}
            >
              {original.row.loginNames.join(", ")}
            </p>
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
            onClick={() => {
              this.setState({
                hasEditClicked: true,
                id: original.row.checkbox.id,
                name: original.row.checkbox.name,
                description: original.row.checkbox.description,
                type: original.row.checkbox.type
              });
            }}
          >
            <FaEdit className="menu-clickable" />
          </div>
        )
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
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    return (
      <div className="projects menu-display" id="projects">
        <ToolBar
          onDelete={this.handleDeleteAll}
          onAdd={this.handleAddProject}
          selected={checkboxSelected}
        />
        <Table
          className="pro-table"
          data={this.state.data}
          columns={this.defineColumns()}
        />
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
            onDelete={this.deleteSingleProject}
            error={this.state.errorMessage}
          />
        )}
        {this.state.hasAddClicked && (
          <ProjectCreationForm
            onType={this.handleFormInput}
            onSubmit={this.saveNewProject}
            error={this.state.errorMessage}
            onCancel={this.handleCancel}
          />
        )}
        {this.state.hasEditClicked && (
          <ProjectEditingForm
            onType={this.handleFormInput}
            onSubmit={this.editProject}
            error={this.state.errorMessage}
            onCancel={this.handleCancel}
            name={this.state.name}
            desc={this.state.description}
          />
        )}
        {this.state.hasUserRolesClicked && (
          <UserRoleEditingForm
            users={this.state.userRoles}
            onCancel={this.handleCancel}
            error={this.state.errorMessage}
            onType={this.handleRoleEditing}
            onSubmit={this.editRoles}
          />
        )}
        {this.state.hasOpenClicked && (
          <ProtectedRoute from="/" exact to="/search" component={SearchView} />
        )}
      </div>
    );
  };
}

Projects.propTypes = {
  selection: PropTypes.string,
  onClose: PropTypes.func
};
export default Projects;
