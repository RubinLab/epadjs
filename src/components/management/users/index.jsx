import React from 'react';
import ReactTable from 'react-table-v6';
import { FaCheck, FaRegTrashAlt, FaTimes } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import { connect } from 'react-redux';
import '../menuStyle.css';
import {
  getUsers,
  updateUserProjectRole,
  deleteUserProjectRole,
  updateUser,
  deleteUser,
  createUser
} from '../../../services/userServices';
import ToolBar from '../common/basicToolBar';
import UserRoleEditForm from './userRoleEdit';
import UserPermissionEdit from './userPermissionEdit';
import DeleteAlert from '../common/alertDeletionModal';
import CreateUser from './CreateUserForm';

const messages = {
  deleteSingle: 'Delete the user? This cannot be undone.',
  deleteSelected: 'Delete selected users? This cannot be undone.'
};

let mode;

class Users extends React.Component {
  mode = sessionStorage.getItem('mode');
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
    userToEdit: '',
    clickedUserIndex: null,
    showPermissionEdit: false,
    errorMessage: '',
    hasAddClicked: false
  };

  componentDidMount = () => {
    this.getUserData();
  };

  getUserData = async () => {
    const { data } = await getUsers();
    let usersProjects = [];
    let hasAdminPermission = false;
    const filteredProjects = [];
    //check if the signed in user has admin permissions
    const signInName = sessionStorage.getItem('username');
    for (let user of data) {
      if (user.username === signInName) {
        hasAdminPermission = user.admin;
        if (mode === 'lite') {
          usersProjects = ['lite'];
        } else {
          usersProjects = user.projects;
        }
      }
    }
    if (mode === 'lite') {
      for (let user of data) {
        if (user.projects.includes('lite')) {
          user.projects = ['lite'];
        } else {
          user.projects = [];
        }
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
    let permissions = '';
    const keys = Object.keys(this.state.permissionEdit);
    const values = Object.values(this.state.permissionEdit);
    for (let i = 0; i < keys.length; i += 1) {
      if (values[i]) {
        permissions = permissions ? permissions + ',' + keys[i] : '' + keys[i];
      }
    }
    updateUser(this.state.userToEdit, { permissions: permissions })
      .then(() => {
        this.getUserData();
        this.handleCancel();
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
        console.error(err);
      });
  };

  updateAdmin = async (username, admin) => {
    updateUser(username, {
      admin: !admin
    })
      .then(() => {
        this.getUserData();
        this.handleCancel();
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
        console.error(err);
      });
  };

  updateUserRole = () => {
    const updates = [];
    const updatedBy = sessionStorage.getItem('username');
    const { roleEdit } = this.state;
    if (Object.keys(roleEdit).length > 0) {
      for (let item in roleEdit) {
        if (roleEdit[item].role === 'None') {
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
          console.error(err);
        });
    } else {
      this.setState({ errorMessage: 'Please change role before submit!' });
    }
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
        console.error(err);
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
        this.setState({ selectAll: 0 });
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
        console.error(err);
      });
  };

  displayUserRoleEdit = () => {
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

  saveClickedUser = userToEdit => {
    this.setState({ clickedUserIndex: userToEdit.index });
    this.setState({ userToEdit: userToEdit.row.checkbox.username });
  };

  convertArrToStr = arr => {
    if (arr.length > 0) {
      const result = [];
      const displayMap = {
        CreateUser: 'user',
        CreatePAC: 'connection',
        CreateAutoPACQuery: 'query',
        CreateProject: 'project',
        CreateWorklist: 'worklist'
      };
      arr.forEach(el => {
        if (mode === 'lite' && el === 'CreateProject') {
          return;
        } else {
          result.push(displayMap[el]);
        }
      });
      return result.join(', ');
    } else {
      return '';
    }
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

  handleCancel = () => {
    this.setState({
      edit: [],
      roleEdit: [],
      permissionEdit: {},
      showRoleEdit: false,
      userToEdit: '',
      clickedUserIndex: null,
      showPermissionEdit: false,
      hasDeleteAllClicked: false,
      hasDeleteSingleClicked: false,
      errorMessage: '',
      hasAddClicked: false
    });
  };

  handleAdd = () => {
    this.setState({ hasAddClicked: true });
  };

  createUser = () => {
    let roleEdit = [];
    let body = {};
    const mode = sessionStorage.getItem('mode');
    const { userToEdit } = this.state;
    if (userToEdit) {
      let permissions = '';
      const keys = Object.keys(this.state.permissionEdit);
      const values = Object.values(this.state.permissionEdit);
      for (let i = 0; i < keys.length; i += 1) {
        if (values[i]) {
          permissions = permissions
            ? permissions + ',' + keys[i]
            : '' + keys[i];
        }
      }
      body = permissions
        ? { ...body, username: userToEdit, permissions: permissions }
        : { ...body, username: userToEdit };

      if (mode === 'lite' && Object.keys(this.state.roleEdit).length === 0)
        roleEdit = [{ role: 'Member', project: 'lite' }];
      else {
        const projectIds = Object.keys(this.state.roleEdit);
        const roles = Object.values(this.state.roleEdit);
        projectIds.forEach((el, i) => {
          roleEdit.push({ role: roles[i].role, project: el });
        });
      }

      if (roleEdit.length > 0) {
        body.projects = roleEdit;
      }

      createUser(body)
        .then(async () => {
          // await this.updateUserRole();
          this.getUserData();
          this.handleCancel();
        })
        .catch(err => {
          this.setState({ errorMessage: err.response.data.message });
          console.error(err);
        });
    }
  };

  defineColumns = () => {
    return [
      {
        id: 'checkbox',
        accessor: '',
        Cell: ({ original }) => {
          return (
            <input
              type="checkbox"
              className="checkbox"
              checked={this.state.selected[original.username]}
              onChange={() => this.toggleRow(original.username)}
              id={original.username}
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
        Header: 'First',
        accessor: 'firstname',
        className: 'usersTable-cell',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 35,
        className: 'mng-user__cell'
      },
      {
        Header: 'Last',
        accessor: 'lastname',
        className: 'usersTable-cell',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 35,
        className: 'mng-user__cell'
      },
      {
        Header: 'User Name',
        accessor: 'username',
        className: 'usersTable-cell',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 35,
        className: 'mng-user__cell'
      },
      {
        Header: 'Email',
        accessor: 'email',
        className: 'usersTable-cell',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        className: 'mng-user__cell'
      },
      {
        Header: 'Projects',
        className: 'usersTable-cell',
        accessor: 'projects',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        className: 'mng-user__cell',
        Cell: original => {
          const { projects } = original.row;
          const { projectMap } = this.props;
          const className =
            projects.length > 0 ? 'wrapped' : 'wrapped click-to-add';
          const text =
            projects.length > 0
              ? projects.reduce((all, item, i) => {
                const comma = projects.length - 1 > i ? ', ' : '';
                return `${all}${projectMap[item] ? projectMap[item].projectName : item
                  }${comma}`;
              }, '')
              : 'Add user to a project';
          return (
            <>
              <div
                id={`projects-${original.row.checkbox.username}`}
                data-tip
                data-for="users-projects"
                onClick={() => {
                  this.displayUserRoleEdit();
                  this.saveClickedUser(original);
                }}
              >
                <p className={className}>{text}</p>
              </div>
              <ReactTooltip
                id="users-projects"
                place="right"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Edit user's project</span>
              </ReactTooltip>
            </>
          );
        }
      },
      {
        Header: 'Admin',
        className: 'usersTable-cell',
        resizable: true,
        minResizeWidth: 20,
        minWidth: 20,
        className: 'mng-user__cell',
        Cell: original => {
          const { username, admin } = original.row.checkbox;
          return (
            <>
              <div
                className="centeredCell"
                data-tip
                data-for="users-admin"
                onClick={async () => {
                  this.updateAdmin(username, admin);
                }}
              >
                {original.row.checkbox.admin ? <FaCheck /> : <FaTimes />}
              </div>
              <ReactTooltip
                id="users-admin"
                place="right"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Change admin status</span>
              </ReactTooltip>
            </>
          );
        }
      },

      {
        Header: 'Permissions',
        accessor: 'permissions',
        className: 'usersTable-cell',
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        className: 'mng-user__cell',
        Cell: original => {
          let text = this.convertArrToStr(original.row.permissions);
          const className = text ? 'wrapped' : 'wrapped click-to-add';
          text = text ? text : 'Give user permission';

          return (
            <>
              <div
                className="menu-clickable"
                data-tip
                data-for="users-permission"
                id={`permissions-${original.row.checkbox.username}`}
                onClick={() => {
                  this.displayUserPermissionEdit(original.index);
                  this.saveClickedUser(original);
                }}
              >
                <p className={className}>{text}</p>
              </div>
              <ReactTooltip
                id="users-permission"
                place="left"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Edit user's permissions</span>
              </ReactTooltip>{' '}
            </>
          );
        }
      },
      {
        Header: '',
        width: 45,
        minResizeWidth: 20,
        resizable: true,
        Cell: original =>
          this.state.hasAdminPermission ? (
            <>
              <div
                id={`delete-${original.row.checkbox.username}`}
                data-tip
                data-for="users-singleDelete"
                onClick={() => {
                  this.handleSingleDelete();
                  this.saveClickedUser(original);
                }}
              >
                <FaRegTrashAlt className="menu-clickable" />
              </div>
              <ReactTooltip
                id="users-singleDelete"
                place="left"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Delete user</span>
              </ReactTooltip>{' '}
            </>
          ) : null
      }
    ];
  };

  render = () => {
    const {
      data,
      clickedUserIndex,
      usersProjects,
      showRoleEdit,
      showPermissionEdit
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
            NoDataComponent={() => null}
            className="pro-table"
            data={data}
            columns={this.defineColumns()}
            defaultPageSize={10}
          />
          {showRoleEdit && (
            <UserRoleEditForm
              onSubmit={this.updateUserRole}
              onSelect={this.getUserRole}
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

const mapsStateToProps = state => {
  return {
    projectMap: state.annotationsListReducer.projectMap
  };
};

export default connect(mapsStateToProps)(Users);
