import React from 'react';
import { connect } from 'react-redux';
import ReactTable from 'react-table-v6';
import ReactTooltip from 'react-tooltip';
import { toast } from 'react-toastify';
import ToolBar from './toolbar';
import { BsList } from "react-icons/bs";
import { FaRegTrashAlt, FaProjectDiagram } from 'react-icons/fa';
import {
  getTemplatesOfProjects,
  getTemplatesUniversal,
  downloadTemplates,
  deleteTemplate,
  deleteProjectsTemplate,
  addTemplateToProject
} from '../../../services/templateServices';
import { getProjects } from '../../../services/projectServices';
import DeleteAlert from '../common/alertDeletionModal';
import UploadModal from '../../searchView/uploadModal';
import EditTemplates from './projectTable';
import { getTemplates } from '../../annotationsList/action';

let mode;

class Templates extends React.Component {
  mode = sessionStorage.getItem('mode');
  state = {
    templates: [],
    projectList: {},
    hasAddClicked: false,
    delAll: false,
    delOne: false,
    selectAll: 0,
    selected: {},
    selectedOne: {},
    uploadClicked: false,
    hasEditClicked: false,
    templateName: '',
    templateUID: '',
    tempProjects: [],
    tempProSelect: {}
  };

  componentDidMount = async () => {
    if (mode !== 'lite') {
      const { data: projectList } = await getProjects();
      const temp = [];
      for (let project of projectList) {
        const { id, name } = project;
        temp.push({ id, name });
      }
      this.setState({ projectList: temp });
      this.getTemplatesData();
    } else {
      this.getTemplatesData();
    }
  };

  componentDidUpdate = async prevProps => {
    try {
      const { refresh, lastEventId } = this.props;
      if (refresh && lastEventId !== prevProps.lastEventId) {
        await this.getTemplatesData();
      }
    } catch (err) {
      console.log(err);
    }
  };

  renderMessages = input => {
    return {
      deleteAll: 'Delete selected templates? This cannot be undone.',
      deleteOne: `Delete template ${input}? This cannot be undone.`
    };
  };
  getTemplatesData = async () => {
    try {
      if (mode === 'lite') {
        const { data: templates } = await getTemplatesOfProjects();
        this.setState({ templates });
      } else {
        const { data: templates } = await getTemplatesUniversal();
        this.setState({ templates });
      }
    } catch (err) { }
  };

  toggleRow = async (id, projectID) => {
    projectID = projectID ? projectID : 'lite';
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
      newSelected[id] = projectID;
      await this.setState({
        selectAll: 2
      });
    }
    this.setState({ selected: newSelected });
  };

  toggleSelectAll() {
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.templates.forEach(temp => {
        let tempID = temp.Template[0].templateUID;
        let projectID = temp.projectID ? temp.projectID : 'lite';
        newSelected[tempID] = projectID;
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
      name: '',
      id: '',
      user: '',
      description: '',
      error: '',
      delAll: false,
      uploadClicked: false,
      hasEditClicked: false,
      delOne: false,
      templateName: '',
      selectedOne: {},
      templateUID: '',
      tempProjects: [],
      tempProSelect: {}
    });
  };

  deleteAll = async () => {
    let newSelected = Object.assign({}, this.state.selected);
    const promiseArr = [];
    for (let template in newSelected) {
      promiseArr.push(deleteTemplate(template, newSelected[template]));
    }
    Promise.all(promiseArr)
      .then(() => {
        this.getTemplatesData();
        this.setState({ selectAll: 0, selected: {} });
        this.props.dispatch(getTemplates());
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getTemplatesData();
      });
    this.handleCancel();
  };

  handleDeleteAll = () => {
    const selectedArr = Object.keys(this.state.selected);
    if (selectedArr.length === 0) {
      return;
    } else {
      this.setState({ delAll: true });
    }
  };

  handleFormInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleEdit = e => {
    this.setState({ hasEditClicked: true });
  };

  handleDeleteOne = templateData => {
    const projectID = templateData.projectID ? templateData.projectID : 'lite';
    const { templateName, templateUID } = templateData.Template[0];
    this.setState({
      delOne: true,
      templateName,
      selectedOne: { [templateUID]: projectID }
    });
  };

  deleteOne = () => {
    const template = Object.keys(this.state.selectedOne);
    deleteTemplate(template)
      .then(() => {
        const newSelected = { ...this.state.selected };
        if (newSelected[template]) {
          delete newSelected[template];
        }
        const selectAll = Object.keys(newSelected).length > 0 ? 2 : 0;
        this.getTemplatesData();
        this.setState({
          selectAll,
          selected: newSelected,
          selectedOne: {},
          delOne: false
        });
        this.props.dispatch(getTemplates());
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getTemplatesData();
      });
  };

  handleProjectClick = (templateUID, templateName, projects) => {
    this.setState({
      hasEditClicked: true,
      templateUID,
      templateName,
      tempProjects: projects
    });
  };

  handleTemplateProjectSelect = e => {
    const { id, checked } = e.target;
    const tempProSelect = { ...this.state.tempProSelect };
    tempProSelect[id] = checked;
    this.setState({ tempProSelect });
  };

  handleTemplateProjectSubmit = async () => {
    try {
      const promises = [];
      const { tempProSelect, templateUID } = this.state;
      const projectIDs = Object.keys(tempProSelect);
      const values = Object.values(tempProSelect);
      projectIDs.forEach((id, i) => {
        values[i]
          ? promises.push(addTemplateToProject(templateUID, id))
          : promises.push(deleteProjectsTemplate(templateUID, id));
      });
      await Promise.all(promises);
      this.handleCancel();
      this.getTemplatesData();
      this.props.getProjectAdded();
    } catch (err) {
      console.log(err);
    }
  };

  addTemplateToProject = (e, projectID) => {
    const { checked } = e.target;
    if (!checked) {
      // delete template from the project
    } else {
      // add template to the project
    }
  };

  defineColumns = () => {
    const columns = [
      {
        id: 'checkbox',
        accessor: '',
        width: 50,
        Cell: ({ original }) => {
          const { templateUID } = original.Template[0];
          return (
            <input
              type="checkbox"
              className="checkbox-cell"
              checked={this.state.selected[templateUID]}
              onChange={() => this.toggleRow(templateUID)}
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
        // sortable: false,
        resizable: false
      },
      {
        Header: 'Container',
        accessor: 'containerName',
        sortable: true,
        resizable: true
      },
      {
        Header: 'Template Name',
        sortable: true,
        resizable: true,
        Cell: original => {
          return <div>{original.row.checkbox.Template[0].templateName}</div>;
          // return <span>type</span>;
        }
      },
      {
        Header: 'Template Code',
        sortable: true,
        resizable: true,
        Cell: original => {
          return (
            <div>{original.row.checkbox.Template[0].templateCodeValue}</div>
          );
          // return <span>type</span>;
        }
      },

      {
        Header: 'Type',
        sortable: true,
        resizable: true,
        Cell: original => {
          return <div>{original.row.checkbox.Template[0].type}</div>;
          // return <span>type</span>;
        }
      },
      {
        Header: '',
        width: 30,
        Cell: original => {
          const template = original.row.checkbox;
          return (
            <>
              <div
                onClick={() => this.handleDeleteOne(template)}
                data-tip
                data-for="template-trash-icon"
              >
                <FaRegTrashAlt className="menu-clickable" />
              </div>
              <ReactTooltip
                id="template-trash-icon"
                place="left"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Delete template</span>
              </ReactTooltip>
            </>
          );
        }
      }
    ];
    const addToproject = {
      Header: 'Projects',
      Cell: original => {
        const { templateUID, templateName } = original.row.checkbox.Template[0];
        const projects = original.row.checkbox.projects
          ? original.row.checkbox.projects
          : [];
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
            : 'Add template to a project';
        return (
          <>
             <button
              data-tip
              data-for="template-project-relation"
              variant="primary"
              className="btn btn-sm btn-outline-light"
              onClick={() =>
                this.handleProjectClick(templateUID, templateName, projects)
              }
            >
              <BsList className="menu-clickable" />
            </button>
            <ReactTooltip
              id="template-project-relation"
              place="left"
              type="info"
              delayShow={1000}
            >
              <span className="filter-label">Assign template to a project</span>
            </ReactTooltip>
          </>
        );
      }
    };
    if (mode !== 'lite') columns.splice(5, 0, addToproject);
    return columns;
  };

  handleClickProjects = () => {
    this.setState({
      hasEditClicked: true
    });
  };
  handleUpload = () => {
    this.setState({ uploadClicked: true });
  };

  handleDownload = () => {
    const selectedArr = Object.keys(this.state.selected);
    const notSelected = selectedArr.length === 0;
    if (notSelected) {
      return;
    } else {
      downloadTemplates(selectedArr)
        .then(result => {
          let blob = new Blob([result.data], { type: 'application/zip' });
          this.triggerBrowserDownload(blob, 'Templates');
          // this.props.onSubmit();
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

  triggerBrowserDownload = (blob, fileName) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.style = 'display: none';
    link.href = url;
    link.download = `${fileName}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  handleSubmitUpload = () => {
    this.handleCancel();
  };

  handleSubmitDownload = () => {
    this.handleCancel();
  };

  render = () => {
    const {
      templates,
      selected,
      delAll,
      delOne,
      projectList,
      tempProjects,
      templateName,
      errorMessage,
      uploadClicked,
      hasEditClicked,
      tempProSelect
    } = this.state;
    const checkboxSelected = Object.values(selected).length > 0;
    const pageSize =
      templates.length < 10 ? 10 : templates.length >= 40 ? 50 : 20;
    return (
      <>
        <div className="templates menu-display" id="template">
          <ToolBar
            onDelete={this.handleDeleteAll}
            selected={checkboxSelected}
            onUpload={this.handleUpload}
            onDownload={this.handleDownload}
          />
          <ReactTable
            NoDataComponent={() => null}
            className="pro-table"
            data={templates}
            columns={this.defineColumns()}
            pageSizeOptions={[10, 20, 50]}
            defaultPageSize={pageSize}
          />
          {uploadClicked && (
            <UploadModal
              onCancel={this.handleCancel}
              onSubmit={this.handleSubmitUpload}
              pid={this.props.pid}
              className="mng-upload"
            />
          )}
          {hasEditClicked && (
            <EditTemplates
              projectList={projectList}
              onCancel={this.handleCancel}
              templateProjects={tempProjects}
              onSubmit={this.handleTemplateProjectSubmit}
              onSelect={this.handleTemplateProjectSelect}
              selected={tempProSelect}
              templateName={templateName}
            />
          )}
        </div>
        {(delAll || delOne) && (
          <DeleteAlert
            message={
              delAll
                ? this.renderMessages().deleteAll
                : this.renderMessages(templateName).deleteOne
            }
            onCancel={this.handleCancel}
            onDelete={delAll ? this.deleteAll : this.deleteOne}
            error={errorMessage}
          />
        )}
      </>
    );
  };
}

const mapStateToProps = state => {
  const {
    uploadedPid,
    lastEventId,
    refresh,
    projectMap
  } = state.annotationsListReducer;
  return { refresh, uploadedPid, lastEventId, projectMap };
};
export default connect(mapStateToProps)(Templates);
