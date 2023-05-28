import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Table from 'react-table-v6';
import ReactTooltip from 'react-tooltip';
import { FaRegTrashAlt, FaEdit, FaRegEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../menuStyle.css';
import {
  getProjects,
  deleteProject,
  saveProject,
  updateProject,
  getProjectUsers,
  editUserRole
} from '../../../services/projectServices';
import { getTemplatesUniversal } from '../../../services/templateServices';
import { getUsers } from '../../../services/userServices';
import ToolBar from '../common/basicToolBar';
import DeleteAlert from '../common/alertDeletionModal';
import ProjectCreationForm from './projectCreationForm';
import ProjectEditingForm from './projectEditingForm';
import UserRoleEditingForm from './userRoleEditingForm';
import ProtectedRoute from '../../common/protectedRoute';
import SearchView from '../../searchView/searchView';
const messages = {
  deleteSingle: 'Delete the project? This cannot be undone.',
  deleteSelected: 'Delete selected projects? This cannot be undone.'
};

//NICE TO HAVES
//TODO projects - add default template feature
//TODO show one error message only
//TODO change the no selection behavior
//TODO change the color of the row if the check box is selected
/*TODO api will be updated to return permission info 
  in response. UI will be updated accordingly with conditional rendering 
  to disable the checkbox if user doesn"t have any permission to edit that project */
//TODO add project names to delete project and user roles editing pop ups
//TODO Add tool tip for icons/button

class Projects extends React.Component {
  state = {
    user: '',
    data: [],
    selected: {},
    selectAll: 0,
    errorMessage: null,
    singleDeleteId: '',
    hasDeleteSingleClicked: false,
    hasDeleteAllClicked: false,
    noSelection: false,
    hasAddClicked: false,
    hasEditClicked: false,
    hasUserRolesClicked: false,
    id: '',
    name: '',
    description: '',
    type: 'Private',
    defaulttemplate: null,
    userRoles: [],
    newRoles: {},
    templates: [],
    projectIndex: null,
    userNameMap: {}
  };

  componentDidMount = () => {
    this.getProjectData();
    this.getTemplateData();
    this.getUserData();
    this.setState({ user: sessionStorage.getItem('username') });
  };

  getDefaultTemplate = (e, template) => {
    e.target.checked
      ? this.setState({
        defaulttemplate: template
      })
      : this.setState({
        defaulttemplate: null
      });
  };

  createName = (user) => {
    const { displayname, username, firstname, lastname } = user;
    const fullName = firstname && lastname ? `${firstname} ${lastname}`
      : lastname ? `${lastname}`
        : firstname ? `${firstname}`
          : null;
    const nullDisplayName = displayname.toLowerCase().includes('null');
    const escapedDisplayName = nullDisplayName && displayname.length > 0 ? username : displayname;
    const name = fullName || escapedDisplayName || username;
    return name;
  }

  handleClickUSerRoles = async id => {
    const userRoles = [];
    try {
      const { data: users } = await getUsers();
      const { data: roles } = await getProjectUsers(id);
      for (let i = 0; i < users.length; i++) {
        for (let k = 0; k < roles.length; k++) {
          if (users[i].username === roles[k].username) {
            const name = this.createName(users[i]);
            userRoles.push({ name, username: users[i].username, role: roles[k].role });
            break;
          }
        }
        if (userRoles.length < i + 1 && i < users.length) {
          userRoles.push({ name: users[i].username, username: users[i].username, role: 'None' });
        }
      }
      await this.setState({ userRoles });
      this.setState({ hasUserRolesClicked: true });
    } catch (err) {
      // this.setState({ error: true });
    }
  };

  getProjectData = async () => {
    try {
      const { data } = await getProjects();
      this.setState({ data });
    } catch (err) {
      // this.setState({ error: true });
    }
  };

  getUserData = async () => {
    try {
      const { data: users } = await getUsers();
      const userNameMap = users.reduce((all, item) => {
        all[item.username] = this.createName(item);
        return all;
      }, {});
      this.setState({ userNameMap });
    } catch (err) {
      // this.setState({ error: true });
    }
  };

  getTemplateData = async () => {
    try {
      const { data: templates } = await getTemplatesUniversal();
      this.setState({ templates });
    } catch (err) {
      // this.setState({ error: true });
    }
  };

  // clearProjectInfo = () => {
  //   this.setState({
  //     name: "",
  //     description: "",
  //     id: "",
  //     type: "Private",
  //   });
  // };

  updateDefaultTemplate = () => {
    const { id, name, description, type, defaulttemplate } = this.state;
    updateProject(id, name, description, type, defaulttemplate)
      .then(res => {
        this.getProjectData();
        this.handleCancel();
      })
      .catch(err => console.log(err));
  };

  saveNewProject = async () => {
    const { name, description, defaulttemplate, id, user, type } = this.state;
    if (!name || !id) {
      this.setState({ errorMessage: 'Please fill the required fields' });
    } else {
      const postData = saveProject(
        name,
        description,
        defaulttemplate,
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
            this.handleCancel();
            this.getProjectData();
            this.props.getProjectAdded();
          }
        })
        .catch(error => {
          this.setState({ errorMessage: error.response.data.message });
        });
    }
  };

  editProject = async () => {
    const { name, description, defaulttemplate, id, type } = this.state;

    const editData = updateProject(
      id,
      name,
      description,
      type,
      defaulttemplate
    );
    editData
      .then(res => {
        if (res.status === 200) {
          this.setState({
            hasEditClicked: false,
            errorMessage: null
          });
          this.handleCancel();
          this.getProjectData();
          this.props.getProjectAdded();
        }
      })
      .catch(error => {
        this.setState({
          errorMessage: error.response.data.message
        });
        this.handleCancel();
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
      id: '',
      name: '',
      description: '',
      type: 'Private',
      hasDeleteAllClicked: false,
      singleDeleteId: '',
      noSelection: false,
      hasAddClicked: false,
      hasEditClicked: false,
      hasUserRolesClicked: false,
      errorMessage: null,
      projectIndex: null,
      defaulttemplate: null
    });
  };

  deleteAllSelected = async () => {
    let newSelected = Object.assign({}, this.state.selected);
    const notDeleted = [];
    const promises = [];
    //call single delete to an array
    //Call Promise.all to array
    //then => refresh the page
    //catch => push
    for (let project in newSelected) {
      promises.push(deleteProject(project));
    }
    Promise.all(promises)
      .then(() => {
        this.setState({ selected: {}, hasDeleteAllClicked: false });
        this.props.getProjectAdded();
      })
      .catch(err => {
        this.setState({
          errorMessage: err.response.data.message
        });
      })
      .finally(() => {
        this.getProjectData();
      });
  };

  deleteSingleProject = async () => {
    deleteProject(this.state.singleDeleteId)
      .then(() => {
        this.setState({ singleDeleteId: '', hasDeleteSingleClicked: false });
        this.getProjectData();
        this.props.getProjectAdded();
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

  handleFormInput = (e, isId = false) => {
    const { name, value } = e.target;
    if (name === 'defaulttemplate' && (value === 'none' || value === null)) {
      this.setState({ [name]: null });
    } else {
      this.setState({ [name]: value });
    }
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
        console.log(error);
        this.setState({ errorMessage: error.response.data.message });
      });
  };

  concatenateNames = (nameArr) => {
    const fullNames = [];
    nameArr.forEach(el => fullNames.push(this.state.userNameMap[el]))
    return fullNames.join(', ')
  }

  defineColumns = () => {
    return [
      {
        id: 'checkbox',
        accessor: '',
        width: 30,
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selected[original.id]}
              onChange={() => this.toggleRow(original.id, original.name)}
              id={original.id}
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
        Header: 'Name',
        accessor: 'name',
        id: 'namePr',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: 'Open',
        sortable: true,
        minResizeWidth: 20,
        width: 30,
        Cell: original => (
          <Link className="open-link" to={'/list/' + original.row.checkbox.id}>
            <div onClick={this.props.onClose} data-tip data-for="project-open">
              <FaRegEye className="menu-clickable" />
            </div>
            <ReactTooltip
              id="project-open"
              place="right"
              type="info"
              delayShow={1000}
            >
              <span className="filter-label">Jump to project</span>
            </ReactTooltip>
          </Link>
        )
      },
      {
        Header: 'Description',
        accessor: 'description',
        id: 'descriptionPr',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: 'Type',
        accessor: 'type',
        id: 'typePr',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 40
      },
      {
        Header: 'Users',
        accessor: 'loginNames',
        id: 'loginNamesnPr',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 30,
        Cell: original => {
          const { loginNames } = original.row;
          const className =
            loginNames?.length > 0 ? 'wrapped' : 'wrapped click-to-add';
          const text =
            loginNames?.length > 0 ? this.concatenateNames(loginNames) : 'Add user';
          return (
            <>
              <p
                className={className}
                data-tip
                data-for="project-user-assign"
                onClick={() => {
                  this.handleClickUSerRoles(original.row.checkbox.id);
                  this.setState({
                    id: original.row.checkbox.id
                  });
                }}
              >
                {text}
              </p>
              <ReactTooltip
                id="project-user-assign"
                place="right"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Add users to project</span>
              </ReactTooltip>
            </>
          );
        }
      },
      {
        Header: 'Template',
        id: 'TemplatePr',
        minWidth: 80,
        minResizeWidth: 20,
        resizable: true,
        Cell: original => {
          const { defaultTemplate } = original.row.checkbox;
          const none =
            defaultTemplate === 'null' || defaultTemplate === 'undefined';
          const temp = defaultTemplate && !none ? this.props.templates[defaultTemplate] : null;
          const templateName = temp ? temp.TemplateContainer.Template[0].name : '';
          return <div>{templateName}</div>;
        }
      },
      {
        Header: '',
        width: 45,
        minResizeWidth: 20,
        // resizable: true,
        Cell: original => {
          return (
            <>
              <div
                data-tip
                data-for="project-edit"
                onClick={() => {
                  this.setState({
                    hasEditClicked: true,
                    id: original.row.checkbox.id,
                    name: original.row.checkbox.name,
                    description: original.row.checkbox.description,
                    type: original.row.checkbox.type,
                    projectIndex: original.index,
                    defaulttemplate: original.row.checkbox.defaultTemplate
                  });
                }}
              >
                <FaEdit className="menu-clickable" />
              </div>
              <ReactTooltip
                id="project-edit"
                place="left"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Edit project</span>
              </ReactTooltip>
            </>
          );
        }
      },
      {
        Header: '',
        width: 45,
        minResizeWidth: 20,
        // resizable: true,
        Cell: original => (
          <>
            <div
              data-tip
              data-for="project-delete"
              id={`delete-${original.row.checkbox.id}`}
              onClick={() => this.handleSingleDelete(original.row.checkbox.id)}
            >
              <FaRegTrashAlt className="menu-clickable" />
            </div>
            <ReactTooltip
              id="project-delete"
              place="left"
              type="info"
              delayShow={1000}
            >
              <span className="filter-label">Delete project</span>
            </ReactTooltip>
          </>
        )
      }
    ];
  };

  render = () => {
    const checkboxSelected = Object.values(this.state.selected).length > 0;
    const { templates, projectIndex, data, defaulttemplate } = this.state;

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
          defaultPageSize={10}
          NoDataComponent={() => null}
        />
        <DeleteAlert
          show={this.state.hasDeleteAllClicked}
          message={messages.deleteSelected}
          onCancel={this.handleCancel}
          onDelete={this.deleteAllSelected}
          error={this.state.errorMessage}
        />
        <DeleteAlert
          show={this.state.hasDeleteSingleClicked}
          message={messages.deleteSingle}
          onCancel={this.handleCancel}
          onDelete={this.deleteSingleProject}
          error={this.state.errorMessage}
        />
        {this.state.hasAddClicked && (
          <ProjectCreationForm
            onType={this.handleFormInput}
            onSubmit={this.saveNewProject}
            error={this.state.errorMessage}
            onCancel={this.handleCancel}
            templates={templates}
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
            type={this.state.type}
            templates={templates}
            defaultTemplate={
              data[projectIndex] ? data[projectIndex].defaultTemplate : null
            }
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
          <ProtectedRoute from="/" exact to="/list" component={SearchView} />
        )}
      </div>
    );
  };
}

Projects.propTypes = {
  selection: PropTypes.string,
  onClose: PropTypes.func
};

const mapsStateToProps = state => {
  return {
    templates: state.annotationsListReducer.templates,
  };
};

export default connect(mapsStateToProps)(Projects);
