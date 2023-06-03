import React from 'react';
import PropTypes from 'prop-types';
import Table from 'react-table-v6';
import { toast } from 'react-toastify';
import ReactTooltip from 'react-tooltip';
import { FaRegTrashAlt, FaEdit, FaRegEye } from 'react-icons/fa';
import ToolBar from '../common/basicToolBar';
import {
  getWorklistsOfCreator,
  deleteWorklist,
  updateWorklist,
  addWorklistRequirement,
  deleteWorklistRequirement
} from '../../../services/worklistServices';
import { getUsers } from '../../../services/userServices';
import DeleteAlert from '../common/alertDeletionModal';
import CreationForm from './worklistCreationForm';
import EditField from '../../sideBar/editField';
import UpdateAssignee from './updateAssigneeModal';
import UpdateDueDateModal from './updateDueDate';
import UpdateRequirement from './updateRequirement';

const messages = {
  deleteSingle: 'Delete the worklist? This cannot be undone.',
  deleteSelected: 'Delete selected worklists? This cannot be undone.',
  fillRequiredFields: 'Please fill the required fields',
  addWorklistError: 'An error occured while saving the worklist.',
  updateWorklistError: 'An error occured while updating the worklist.'
};

class WorkList extends React.Component {
  state = {
    worklists: [],
    userList: [],
    singleDeleteData: {},
    deleteSingleClicked: false,
    hasAddClicked: false,
    deleteAllClicked: false,
    selectAll: 0,
    selected: {},
    cellDoubleClicked: false,
    clickedIndex: null,
    worklistId: null,
    updateAssignee: false,
    updateDueDate: false,
    duedate: null,
    updateRequirement: false,
    requirements: [],
    newRequirement: {},
    userNameMap: {}
  };

  createName = (user) => {
    const { displayname, username, firstname, lastname } = user;
    const fullName = firstname && lastname ? `${firstname} ${lastname}`
      : lastname ? `${lastname}`
        : firstname ? `${firstname}`
          : null;
    const name = fullName || displayname || username;
    return name;
  }

  createUserNameMap = (users) => {
    const userNameMap = users.reduce((all, item) => {
      all[item.username] = this.createName(item);
      return all;
    }, {});
    this.setState({ userNameMap });
  }

  componentDidMount = async () => {
    this.getWorkListData();
    const { data: userList } = await getUsers();
    this.setState({ userList });
    this.createUserNameMap(userList);
    document.addEventListener('mousedown', this.handleClickOutside);
    document.addEventListener('keydown', this.handleKeyboardEvent);
  };

  componentWillUnmount = () => {
    document.removeEventListener('mousedown', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleKeyboardEvent);
  };

  getWorkListData = async () => {
    let { data: worklists } = await getWorklistsOfCreator();
    for (let wl of worklists) {
      let display = wl.requirements.reduce((all, item, i) => {
        const { level, numOfAims, template } = item;
        const templateName = this.props.templateMap[template];
        all.push(`${numOfAims}:${templateName}:${level}`);
        return all;
      }, []);
      wl.requirementDisplay = display.join(', ');
    }
    this.setState({ worklists });
  };

  handleRequirementFormInput = e => {
    const { name, value, options, selectedIndex } = e.target;
    const code = options && options[selectedIndex] ? options[selectedIndex].id : null;
    const newRequirement = { ...this.state.newRequirement };
    if (name === 'template') {
      if (value === 'Any')
        newRequirement[name] = value.toLowerCase()
      else newRequirement[name] = code;
    } else newRequirement[name] = value;
    if (name === 'numOfAims' && !isNaN(parseInt(value))) {
      this.setState({ error: null });
    }
    this.setState({ newRequirement });
  };

  toggleRow = async id => {
    let newSelected = Object.assign({}, this.state.selected);
    if (newSelected[id]) {
      newSelected[id] = false;
      let values = Object.values(newSelected);
      if (values.length === 0) {
        this.setState({
          selectAll: 0
        });
      }
    } else {
      newSelected[id] = true;
      await this.setState({
        selectAll: 2
      });
    }
    this.setState({ selected: newSelected });
  };

  toggleSelectAll() {
    let newSelected = {};
    if (this.state.selectAll === 0) {
      this.state.worklists.forEach(project => {
        newSelected[project.workListID] = true;
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
      name: null,
      id: '',
      user: '',
      description: null,
      error: '',
      duedate: null,
      deleteSingleClicked: false,
      deleteAllClicked: false,
      selected: {},
      user: '',
      cellDoubleClicked: false,
      worklistId: '',
      updateAssignee: false,
      assigneeMap: {},
      initialAssignees: [],
      updateDueDate: false,
      updateRequirement: false,
      requirements: []
    });
  };

  deleteAllSelected = () => {
    let newSelected = Object.assign({}, this.state.selected);
    const promiseArr = [];
    for (let worklist in newSelected) {
      promiseArr.push(deleteWorklist(worklist));
    }
    Promise.all(promiseArr)
      .then(() => {
        this.getWorkListData();
        this.setState({ selectAll: 0 });
        this.props.updateProgress();
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getWorkListData();
      });
    this.handleCancel();
  };

  deleteSingleWorklist = async () => {
    deleteWorklist(this.state.singleDeleteData)
      .then(() => {
        this.setState({ deleteSingleClicked: false, singleDeleteData: null });
        this.getWorkListData();
        this.props.updateProgress();
      })
      .catch(err => {
        this.setState({ errorMessage: err.response.data.message });
      });
  };

  handleDeleteAll = () => {
    this.setState({ deleteAllClicked: true });
  };

  handleAddWorklist = () => {
    this.setState({ hasAddClicked: true });
  };

  handleFormInput = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSaveWorklist = () => {
    this.getWorkListData();
    this.props.updateProgress();
  };

  handleSingleDelete = id => {
    this.setState({
      deleteSingleClicked: true,
      singleDeleteData: id
    });
  };

  handleUpdateField = (index, fieldName, worklistId, defaultValue) => {
    this.setState({
      cellDoubleClicked: fieldName,
      clickedIndex: index,
      worklistId: worklistId
    });
    fieldName === 'name'
      ? this.setState({ name: defaultValue })
      : // fieldName === "description"?
      this.setState({ description: defaultValue });
    // : this.setState({ duedate: defaultValue });
  };

  handleKeyboardEvent = e => {
    const {
      name,
      description,
      // duedate,
      worklistId,
      cellDoubleClicked
    } = this.state;
    const nameNotEmpty = name && name.trim().length > 0;
    const fieldUpdateValidation = worklistId && cellDoubleClicked;
    if (e.key === 'Escape') {
      this.handleUpdateField(null, null);
    } else if (e.key === 'Enter' && fieldUpdateValidation) {
      if (cellDoubleClicked === 'name') {
        if (nameNotEmpty) this.updateWorklist();
      }
      this.updateWorklist();
    }
  };

  setWrapperRef = (node, id) => {
    this.wrapperRef = node;
  };

  handleClickOutside = event => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.handleUpdateField(null);
    }
  };

  getUpdate = e => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  updateWorklist = () => {
    const { name, description, duedate, worklistId } = this.state;
    const body = name
      ? { name }
      : description === '' || description
        ? { description }
        : { duedate };
    updateWorklist(worklistId, body)
      .then(() => this.getWorkListData())
      .catch(error =>
        toast.error(
          messages.updateWorklistError + ': ' + error.response.data.message,
          {
            autoClose: false
          }
        )
      );
    this.handleCancel();
  };

  handleUpdateDueDate = () => {
    this.setState({ updateDueDate: true });
  };

  handleUpdateAssignee = (assignee, worklistId) => {
    const assigneeMap = {};
    for (let i = 0; i < assignee.length; i += 1) {
      assigneeMap[assignee[i]] = true;
    }
    this.setState({
      updateAssignee: true,
      assigneeMap,
      worklistId
    });
  };

  selectAssignee = (e, map) => {
    if (e) {
      const { name, checked } = e.target;
      const newAssigneeMap = { ...this.state.assigneeMap };
      newAssigneeMap[name] = checked;
      this.setState({ assigneeMap: newAssigneeMap });
    } else {
      this.setState({ assigneeMap: map });
    }
  };

  submitUpdateAssignees = () => {
    const assigneeList = [];
    const assigneeListKeys = Object.keys(this.state.assigneeMap);
    const assigneeListValues = Object.values(this.state.assigneeMap);
    for (let i = 0; i < assigneeListKeys.length; i += 1) {
      if (assigneeListValues[i]) assigneeList.push(assigneeListKeys[i]);
    }
    updateWorklist(this.state.worklistId, { assigneeList })
      .then(() => {
        this.getWorkListData();
        this.props.updateProgress();
        toast.info('Update successful!', { autoClose: true });
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getWorkListData();
      });
    this.handleCancel();
  };

  saveUpdatedRequirements = requirements => {
    updateWorklist(this.state.worklistId, { requirements })
      .then(() => {
        this.getWorkListData();
        this.setState({ updateRequirement: false });
        toast.info('Update successful!', { autoClose: true });
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getWorkListData();
      });
    this.handleCancel();
  };

  deleteRequirement = requirementId => {
    deleteWorklistRequirement(this.state.worklistId, requirementId)
      .then(() => {
        this.getWorkListData();
        this.setState({ updateRequirement: false });
        toast.info('Delete successful!', { autoClose: true });
      })
      .catch(error => {
        toast.error(error.response.data.message, { autoClose: false });
        this.getWorkListData();
      });
  };

  addNewRequirement = () => {
    const { level, template, numOfAims } = this.state.newRequirement;
    const unselectedLevel = !level || level === `--- Select Level ---`;
    const intAims = parseInt(numOfAims);
    const unSelectedTemplate =
      !template || template === '--- Select Template ---';
    if (unselectedLevel || unSelectedTemplate || !numOfAims) {
      this.setState({ error: 'Please fill all fields!' });
      return;
    } else if (isNaN(parseInt(intAims)) || intAims === 0) {
      this.setState({
        error: 'No of aims should be a non-zero number!'
      });
      return;
    } else {
      this.setState({ error: null });
      addWorklistRequirement(this.state.worklistId, [this.state.newRequirement])
        .then(() => {
          this.getWorkListData();
          this.setState({ updateRequirement: false });
          toast.info('Update successful!', { autoClose: true });
        })
        .catch(error => {
          toast.error(error.response.data.message, { autoClose: false });
          this.getWorkListData();
        });
    }
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
              checked={this.state.selected[original.workListID]}
              onChange={() => this.toggleRow(original.workListID)}
              id={original.workListID}
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
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => {
          const { cellDoubleClicked, clickedIndex } = this.state;
          return cellDoubleClicked === 'name' &&
            clickedIndex === original.index ? (
            <div
              ref={this.setWrapperRef}
              className="--commentInput menu-clickable wrapped"
            >
              <EditField
                name="name"
                onType={this.getUpdate}
                default={this.state.name}
              />
            </div>
          ) : (
            <>
              <div
                className="--commentCont menu-clickable wrapped"
                data-tip
                data-for="worklist-name"
                id={`name-${original.row.checkbox.workListID}`}
                onClick={() =>
                  this.handleUpdateField(
                    original.index,
                    'name',
                    original.row.checkbox.workListID,
                    original.row.checkbox.name
                  )
                }
              >
                {original.row.checkbox.name}
              </div>
              <ReactTooltip
                id="worklist-name"
                place="right"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Click to edit name</span>
              </ReactTooltip>
            </>
          );
        }
      },
      {
        Header: 'Assignees',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => {
          const { assignees, workListID } = original.row.checkbox;
          const className =
            assignees.length > 0
              ? 'wrapped menu-clickable'
              : 'wrapped click-to-add menu-clickable';
          return (
            <>
              <div
                data-tip
                data-for="worklist-assignee"
                onClick={() => {
                  this.handleUpdateAssignee(assignees, workListID);
                  this.setState({
                    initialAssignees: [...assignees]
                  });
                }}
                className={className}
                id={`assignees-${original.row.checkbox.workListID}`}
              >
                {assignees.length > 0 ? this.concatenateNames(assignees) : `Add assignees`}
              </div>
              <ReactTooltip
                id="worklist-assignee"
                place="right"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Click to edit assignees</span>
              </ReactTooltip>
            </>
          );
        }
      },
      {
        Header: 'Due Date',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => {
          const { duedate, workListID } = original.row.checkbox;
          const className = duedate
            ? 'wrapped menu-clickable'
            : 'wrapped click-to-add menu-clickable';
          return (
            <>
              <div
                className={`--commentCont ${className}`}
                data-tip
                data-for="worklist-dueDate"
                onClick={async () => {
                  await this.setState({
                    duedate: duedate,
                    worklistId: workListID
                  });
                  this.handleUpdateDueDate();
                }}
                id={`due-${original.row.checkbox.workListID}`}
              >
                {duedate || 'Add due date'}
              </div>
              <ReactTooltip
                id="worklist-dueDate"
                place="right"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Click to edit due date</span>
              </ReactTooltip>
            </>
          );
        }
      },
      {
        Header: 'Requirement',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => {
          const { requirements, workListID, requirementDisplay } = original.row.checkbox;
          const className = requirements.length
            ? 'wrapped menu-clickable'
            : 'wrapped click-to-add menu-clickable';
          return (
            <>
              <div
                className={`--commentCont ${className}`}
                data-tip
                data-for="worklist-requirement"
                onClick={() => {
                  this.setState({
                    worklistId: workListID,
                    requirements,
                    updateRequirement: true
                  });
                }}
                id={`req-${workListID}`}

              >
                {requirementDisplay || 'Define requirement'}
              </div>
              <ReactTooltip
                id="worklist-requirement"
                place="right"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Click to edit requirements</span>
              </ReactTooltip>
            </>
          );
        }
      },
      {
        Header: 'Description',
        sortable: true,
        resizable: true,
        minResizeWidth: 20,
        minWidth: 50,
        Cell: original => {
          let { description } = original.row.checkbox;
          description = description || '';
          const className = original.row.checkbox.description
            ? 'wrapped menu-clickable'
            : 'wrapped click-to-add menu-clickable';
          const { cellDoubleClicked, clickedIndex } = this.state;
          return cellDoubleClicked === 'description' &&
            clickedIndex === original.index ? (
            <div
              ref={this.setWrapperRef}
              className="--commentInput"
            >
              <EditField
                name="description"
                onType={this.getUpdate}
                default={this.state.description}
              />
            </div>
          ) : (
            <>
              <div
                className={`--commentCont ${className}`}
                data-tip
                data-for="worklist-description"
                id={`desc-${original.row.checkbox.workListID}`}
                onClick={() =>
                  this.handleUpdateField(
                    original.index,
                    'description',
                    original.row.checkbox.workListID,
                    description
                  )
                }
              >
                {description || 'Add description'}
              </div>
              <ReactTooltip
                id="worklist-description"
                place="left"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Click to edit description</span>
              </ReactTooltip>
            </>
          );
        }
      },
      {
        Header: '',
        width: 45,
        minResizeWidth: 20,
        resizable: true,
        Cell: original => {
          return (
            <>
              <div
                data-tip
                data-for="worklist-delete"
                onClick={() =>
                  this.handleSingleDelete(original.row.checkbox.workListID)
                }
                id={`delete-${original.row.checkbox.workListID}`}
              >
                <FaRegTrashAlt className="menu-clickable" />
              </div>
              <ReactTooltip
                id="worklist-delete"
                place="left"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Delete worklist</span>
              </ReactTooltip>
            </>
          );
        }
      }
    ];
  };

  render = () => {
    const checkboxSelected = Object.values(this.state.selected).length > 0;

    return (
      <div className="worklist menu-display" id="worklist">
        <ToolBar
          onDelete={this.handleDeleteAll}
          onAdd={this.handleAddWorklist}
          selected={checkboxSelected}
        />
        <Table
          NoDataComponent={() => null}
          className="pro-table"
          data={this.state.worklists}
          columns={this.defineColumns()}
          pageSizeOptions={[10, 20, 50]}
          defaultPageSize={10}
        />
        <DeleteAlert
          show={this.state.deleteSingleClicked}
          message={messages.deleteSingle}
          onCancel={this.handleCancel}
          onDelete={this.deleteSingleWorklist}
          error={this.state.errorMessage}
        />
        {this.state.hasAddClicked && (
          <CreationForm
            users={this.state.userList}
            onCancel={this.handleCancel}
            onSubmit={this.handleSaveWorklist}
            error={this.state.error}
          />
        )}
        <DeleteAlert
          show={this.state.deleteAllClicked}
          message={messages.deleteSelected}
          onCancel={this.handleCancel}
          onDelete={this.deleteAllSelected}
          error={this.state.errorMessage}
        />
        {this.state.updateAssignee && (
          <UpdateAssignee
            onCancel={this.handleCancel}
            selectAssignee={this.selectAssignee}
            assigneeList={this.state.assigneeMap}
            users={this.state.userList}
            onSubmit={this.submitUpdateAssignees}
            initialAssignees={this.state.initialAssignees}
          />
        )}
        {this.state.updateDueDate && (
          <UpdateDueDateModal
            onCancel={this.handleCancel}
            onSubmit={this.updateWorklist}
            onChange={this.handleFormInput}
            duedate={this.state.duedate}
          />
        )}
        {this.state.updateRequirement && (
          <UpdateRequirement
            requirements={this.state.requirements}
            onCancel={this.handleCancel}
            worklistID={this.state.worklistId}
            onAddNew={this.addNewRequirement}
            onEdit={this.saveUpdatedRequirements}
            onDelete={this.deleteRequirement}
            onNewReqInfo={this.handleRequirementFormInput}
            error={this.state.error}
            templateMap={this.props.templateMap}
          />
        )}
      </div>
    );
  };
}

WorkList.propTypes = {
  selection: PropTypes.string,
  onClose: PropTypes.func,
  templateMap: PropTypes.object,
};
export default WorkList;
