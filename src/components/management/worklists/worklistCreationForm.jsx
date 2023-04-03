import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import ReactTooltip from 'react-tooltip';
import { toast } from "react-toastify";
import FormButton from "../users/formButton";
import UserList from "./userList";
import RequirementForm from "./requirementForm";
import { saveWorklist } from "../../../services/worklistServices";
import "../menuStyle.css";
import "../../infoMenu/infoMenu.css";

let mode;

const messages = {
  fillRequiredFields: "Please fill the required fields",
  missingReqField:
    // "Please fill or clear all worklist"s requirement fields before submit",
    "Please fill all worklist's requirement fields before submit",
  noSpace: "No space in worklist ID!"
};

class WorklistCreationForm extends React.Component {
  constructor(props) {
    super(props);
    mode = sessionStorage.getItem('mode');
    this.state = {
      page: 0,
      assigneeList: {},
      name: "",
      id: "",
      description: "",
      duedate: "",
      error: "",
      requirements: {},
      isSelectedAll: false,
    };
  }

  goPrevPage = () => {
    const { page } = this.state;
    if (page >= 1) {
      this.setState(state => ({
        page: state.page - 1
      }));
      if (page === 1) {
        this.setState({ assigneeList: {} });
      } else if (page === 2) {
        this.setState({ requirements: {} });
      }
    }
  };

  handleCancel = () => {
    this.setState({
      assigneeList: {},
      name: "",
      id: "",
      description: "",
      duedate: "",
      error: ""
    });
  };
  goNextPage = () => {
    if (this.state.page <= 1) {
      this.setState(state => ({
        page: state.page + 1
      }));
    }
  };

  handleSaveWorklist = () => {
    const promise = [];
    let {
      name,
      id,
      assigneeList,
      description,
      duedate,
      requirements
    } = this.state;
    assigneeList = Object.keys(assigneeList);
    if (!name || !id || !assigneeList.length) {
      this.setState({ error: messages.fillRequiredFields });
    } else {
      description = description ? description : "";
      const { level, template, numOfAims } = requirements;
      const unselectedLevel =
        level === undefined || level.includes("Select Level");
      const unselectedTemplate =
        template === undefined || template.includes("Select Template");
      const unselectedAims = numOfAims === undefined || numOfAims === "";
      const hasReqCleared =
        unselectedAims && unselectedTemplate && unselectedLevel;
      const body = {};
      if (Object.keys(requirements).length > 0 && !hasReqCleared) {
        promise.push(
          saveWorklist(id, name, assigneeList, description, duedate, [
            requirements
          ])
        );
      } else {
        promise.push(
          saveWorklist(id, name, assigneeList, description, duedate)
        );
      }

      Promise.all(promise)
        .then(() => {
          this.props.onSubmit();
          this.handleCancel();
          this.props.onCancel();
        })
        .catch(error => {
          if (
            error.response.data &&
            error.response.data === "Validation error"
          ) {
            let errMesage = `${errMesage} - ID "${id}" might already exist`;
            this.setState({ error: errMesage });
          }
          this.setState({ error: error.response.data.message });
          this.setState({ page: 0 });
        });
    }
  };

  validateRequirements = reqs => {
    const { level, template, numOfAims } = reqs
      ? reqs
      : this.state.requirements;
    const validLevel = level && level !== "--- Select Level ---";
    const validTemplate = template && template !== "--- Select Template ---";
    const validNumOfAims =
      numOfAims && !isNaN(parseInt(numOfAims)) && parseInt(numOfAims);
    const unselectedLevel =
      level === undefined || level.includes("Select Level");
    const unselectedTemplate =
      template === undefined || template.includes("Select Template");
    const unselectedAims = numOfAims === undefined || numOfAims === "";
    const noneSelected =
      unselectedLevel && unselectedTemplate && unselectedAims;
    const allSelected = validLevel && validTemplate && validNumOfAims;
    // return noneSelected || allSelected;
    return allSelected;
  };

  handleFormInput = e => {
    const isName = e.target.name === "name";
    const isID = e.target.name === "id";
    const properID = isID && !e.target.value.trim().includes(" ");

    if (isID && e.target.value.trim().includes(" ")) {
      this.setState({ error: messages.noSpace });
    }
    if (properID) {
      if (this.state.error === messages.noSpace) this.setState({ error: "" });
    }
    if ((isName || isID) && properID) {
      if (this.state.error === messages.fillRequiredFields) {
        this.setState({ error: "" });
      }
    }
    const { name, value } = e.target;
    this.setState({ [name]: value.trim() });
  };

  handleNameChange = (e) => {
    const name = e.target.value;
    const idInput = document.getElementById("addWorklist-id");
    const newId = name.replace(/[^a-z0-9_]/gi, '');
    idInput.value = name.replace(/[^a-z0-9_]/gi, '');
    this.setState({ id: newId });
  }

  selectUser = e => {
    const assigneeList = { ...this.state.assigneeList };
    const { name, checked } = e.target;
    checked ? (assigneeList[name] = true) : delete assigneeList[name];
    this.setState({ assigneeList }, this.checkAllSelected);
  };

  selectAll = () => {
    const { users } = this.props;
    const assigneeList = {};
    if (!this.state.isSelectedAll) {
      users.forEach(({ username }) => {
        assigneeList[username] = true;
      });
      this.setState({ assigneeList, isSelectedAll: true });
    } else {
      users.forEach(({ username }) => {
        assigneeList[username] = false;
      })
      console.log("Assignee list", assigneeList);
      this.setState({ assigneeList, isSelectedAll: false });
    }
  }

  checkAllSelected = () => {
    const { assigneeList } = this.state;
    const { users } = this.props;
    if (Object.keys(assigneeList).length === users.length)
      this.setState({ isSelectedAll: true });
    else this.setState({ isSelectedAll: false });
  }

  handleRequirementFormInput = e => {
    const { name, value } = e.target;
    const newRequirement = { ...this.state.requirements };
    name === "template" && value === "Any"
      ? (newRequirement[name] = value.toLowerCase())
      : (newRequirement[name] = value);

    if (name === "numOfAims" && !isNaN(parseInt(value))) {
      this.setState({ error: null });
    }
    this.setState({ requirements: newRequirement });

    this.validateRequirements(newRequirement)
      ? this.setState({ error: "" })
      : this.setState({ error: messages.missingReqField });
  };

  render = () => {
    const { users, onCancel } = this.props;
    const { page, id, name, error, requirements } = this.state;
    let button1Text = "Back";
    let button2Text = "Next";
    let button3Text = "Cancel";
    let button2TextAlt = "Add Requirement";
    let button1Func = this.goPrevPage;
    let button2Func = this.goNextPage;
    let button3Func = onCancel;
    let disableSubmit = false;
    let disableNext = !id || !name || id.includes(" ");

    if (page === 2) {
      button2Text = "Submit";
      const assigneeListArr = Object.keys(this.state.assigneeList);
      button2Func = this.handleSaveWorklist;
      if (assigneeListArr.length === 0 || !this.validateRequirements()) {
        disableSubmit = true;
      }
    }

    const options = [];
    let index = 0;
    options.push(
      <option disabled value="default" key="0-default">
        -- select a user --
      </option>
    );
    for (let user of users) {
      options.push(
        <option key={`${index}-${user.username}`} value={user.username}>
          {user.lastname && user.firstname ? user.displayname : user.email}
        </option>
      );
      index++;
    }
    // let date = new Date();
    // const day = date.getDate() + "";
    // let month = date.getMonth() + 1;
    // month = month < 10 ? `0${month}` : `${month}`;
    // const year = date.getFullYear();
    // date = `${year}-${month}-${day}`;

    return (
      // <Modal.Dialog dialogClassName="add-worklist__modal">
      <Modal.Dialog id="modal-fix" className="in-modal">
        <Modal.Header className="modal-header">
          <Modal.Title>Create worklist</Modal.Title>
        </Modal.Header>
        <Modal.Body className="notification-modal">
          {!this.state.page && (
            <form className="add-worklist__modal--form">
              <label className="add-worklist__modal--label">Name*</label>
              <input
                onMouseDown={e => e.stopPropagation()}
                className="add-worklist__modal--input"
                name="name"
                type="text"
                onChange={(e) => { this.handleFormInput(e); this.handleNameChange(e) }}
                id="addWorklist-name"
                defaultValue={this.state.name}
              />
              <label className="add-worklist__modal--label">ID*</label>
              <input
                onMouseDown={e => e.stopPropagation()}
                className="add-worklist__modal--input"
                name="id"
                type="text"
                onChange={this.handleFormInput}
                defaultValue={this.state.id}
                id="addWorklist-id"
              />
              <span className="form-exp">
                One word only, no special characters, "_" is OK
              </span>
              <label className="form-exp add-worklist__modal--label">Due date:</label>
              <input
                type="date"
                name="duedate"
                onChange={this.handleFormInput}
                defaultValue={this.state.duedate}
                id="addWorklist-due"
              />
              <label className="add-worklist__modal--label">Description</label>
              <textarea
                onMouseDown={e => e.stopPropagation()}
                className="add-worklist__modal--input"
                name="description"
                onChange={this.handleFormInput}
                defaultValue={this.state.description}
                id="addWorklist-desc"
              />
              <span className="form-exp required">*Required</span>
            </form>
          )}
          {this.state.page === 1 && (
            <>
              <h5 className="add-worklist__modal--label" id="addWorklist-users">
                Assign worklist to users
              </h5>
              <UserList
                users={this.props.users}
                onChange={this.selectUser}
                assignees={this.state.assigneeList}
                selectAll={this.selectAll}
                isSelectedAll={this.state.isSelectedAll}
              />
            </>
          )}
          {this.state.page === 2 && (
            <>
              <h5
                className="add-worklist__modal--label"
                id="addWorklist-requirements"
              >
                Add Requirements to monitor progress
              </h5>
              <RequirementForm
                onNewReqInfo={this.handleRequirementFormInput}
                requirements={requirements}
              />
            </>
          )}
          {error ? <div className="err-message">{error}</div> : null}
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <Button variant="secondary"
            onClick={button1Func}
            disabled={page === 0}
          >{button1Text}</Button>
          <>
            <Button variant="secondary"
              data-tip
              data-for="add-requirement-btn"
              onClick={button2Func}
              disabled={page === 0 ? disableNext : disableSubmit}
              id="next-btn"
            >{page === 1 && mode === 'teaching' ? button2TextAlt : button2Text}</Button>
            {page === 1 && mode === 'teaching' && <ReactTooltip
              id="add-requirement-btn"
              place="bottom"
              type="info"
              delayShow={200}
            >
              <span className="filter-label">Add requirement for completing annotations for studies in the worklist</span>
            </ReactTooltip>}
          </>

          {mode === 'teaching' && this.state.page === 1 && (
            <Button variant="secondary"
              onClick={this.handleSaveWorklist}
              id="next-btn"
            >Submit</Button>)}
          <Button variant="secondary" onClick={button3Func}>{button3Text}</Button>
        </Modal.Footer>
      </Modal.Dialog >
    );
  };
}

WorklistCreationForm.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  error: PropTypes.string
};

export default WorklistCreationForm;
