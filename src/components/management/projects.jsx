import React from 'react';
import Table from 'react-table';
import { FaRegTrashAlt, FaEdit } from 'react-icons/fa';
import './menuStyle.css';
import {
  getProjects,
  deleteProject,
  saveProject,
  updateProject
} from '../../services/projectServices';
import ToolBar from './basicToolBar';
import DeleteAlert from './alertDeletionModal';
import NoSelectionAlert from './alertNoSelectionModal';
import ProjectCreationForm from './projectCreationForm';
import ProjectEditingForm from './projectEditingForm';

const messages = {
  deleteSingle: 'Delete the project? This cannot be undone.',
  deleteSelected: 'Delete selected projects? This cannot be undone.',
  noSelection: 'Please select a project'
};

//TODO projects - post default template nedir
//TODO http response code should be more specific for post
//request in case of duplicate id
//TODO check required fields
//TODO better error message for duplicate project name
//TODO update only if owner
//TODO query string gec post ve put icin / emelle konus
//TODO add a max width for edit/create project popups for the error messages

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
    id: '',
    name: '',
    description: '',
    type: 'Private',
    defaultTemplate: ''
  };

  componentDidMount = () => {
    this.getProjectData();
    this.setState({ user: sessionStorage.getItem('username') });
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

  saveNewProject = async () => {
    const { name, description, defaultTemplate, id, user, type } = this.state;
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
            name: '',
            description: '',
            id: '',
            type: 'Private',
            errorMessage: null
          });
          this.getProjectData();
        }
      })
      .catch(error => {
        this.setState({ errorMessage: error.response.data.message });
      });
  };

  editProject = async () => {
    const { name, description, defaultTemplate, id, type } = this.state;
    console.log('name', name, 'desc', description, type);
    const editData = updateProject(id, name, description, type);

    editData
      .then(res => {
        if (res.status === 200) {
          this.setState({
            hasEditClicked: false,
            name: '',
            description: '',
            id: '',
            type: 'Private',
            errorMessage: null
          });
          this.getProjectData();
        }
      })
      .catch(error => {
        this.setState({ errorMessage: error.response.data.message });
      });
  };

  toggleRow = async id => {
    let newSelected = Object.assign({}, this.state.selected);
    newSelected[id] = !this.state.selected[id];
    await this.setState({
      selected: newSelected,
      selectAll: 2
    });

    let values = Object.values(this.state.selected);
    if (!values.includes(true)) {
      this.setState({
        selectAll: 0
      });
    }
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
      hasDeleteAllClicked: false,
      singleDeleteId: '',
      noSelection: false,
      hasAddClicked: false,
      hasEditClicked: false,
      errorMessage: null
    });
  };

  deleteAllSelected = async () => {
    let newSelected = Object.assign({}, this.state.selected);
    for (let project in newSelected) {
      //TODO catch error set errorMessage and getproject data -- use promise here
      if (newSelected[project]) {
        await deleteProject(project);
        delete newSelected[project];
        this.getProjectData();
      }
    }
    this.setState({ selected: {}, hasDeleteAllClicked: false });
    this.getProjectData();
  };

  deleteSingleProject = async project => {
    await deleteProject(this.state.singleDeleteId);
    this.setState({ singleDeleteId: '', hasDeleteSingleClicked: false });
    this.getProjectData();
  };

  handleDeleteAll = () => {
    let values = Object.values(this.state.selected);
    let isSelected;
    !values.includes(true)
      ? this.setState({ noSelection: true })
      : this.setState({ hasDeleteAllClicked: true });
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
              checked={this.state.selected[original.id] === true}
              onChange={() => this.toggleRow(original.id)}
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
        minResizeWidth: 20,
        width: 45
      },
      {
        Header: 'Name',
        accessor: 'name',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: 'Open',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        width: 45
      },
      {
        Header: 'Description',
        accessor: 'description',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: 'Type',
        accessor: 'type',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50
      },
      {
        Header: 'Users',
        accessor: 'loginNames',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => {
          return (
            <p className="menu-clickable wrapped">
              {original.row.loginNames.join(', ')}
            </p>
          );
        }
      },
      {
        Header: '',
        width: 45,
        minResizeWidth: 20,
        resizable: true,
        Cell: original => (
          <FaEdit
            className="menu-clickable"
            onClick={() => {
              // console.log(original);
              this.setState({
                hasEditClicked: true,
                id: original.row.checkbox.id,
                name: original.row.checkbox.name,
                description: original.row.checkbox.description,
                type: original.row.checkbox.type
              });
            }}
          />
        )
      },
      {
        Header: '',
        width: 45,
        minResizeWidth: 20,
        resizable: true,
        Cell: original => (
          <FaRegTrashAlt
            className="menu-clickable"
            onClick={() => this.handleSingleDelete(original.row.checkbox.id)}
          />
        )
      }
    ];
  };

  render = () => {
    // console.log('projects data', this.state.data);
    console.log(this.state);
    return (
      <div className="projects menu-display" id="projects">
        <ToolBar
          onDelete={this.handleDeleteAll}
          onAdd={this.handleAddProject}
        />
        {this.state.error ? (
          <div>Something went wrong!</div>
        ) : (
          <Table data={this.state.data} columns={this.defineColumns()} />
        )}
        {this.state.hasDeleteAllClicked && (
          <DeleteAlert
            message={messages.deleteSelected}
            onCancel={this.handleCancel}
            onDelete={this.deleteAllSelected}
          />
        )}
        {this.state.hasDeleteSingleClicked && (
          <DeleteAlert
            message={messages.deleteSingle}
            onCancel={this.handleCancel}
            onDelete={this.deleteSingleProject}
          />
        )}
        {this.state.noSelection && (
          <NoSelectionAlert
            message={messages.noSelection}
            onOK={this.handleCancel}
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
          />
        )}
      </div>
    );
  };
}

export default Projects;
