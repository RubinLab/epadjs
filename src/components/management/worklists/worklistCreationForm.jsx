import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import FormButton from "../users/formButton";
import UserList from "./userList";
import RequirementForm from "./requirementForm";
import { saveWorklist } from "../../../services/worklistServices";
import "../menuStyle.css";

const messages = {
  fillRequiredFields: "Please fill the required fields",
};

class WorklistCreationForm extends React.Component {
  state = {
    page: 0,
    assigneeList: {},
    name: "",
    id: "",
    description: "",
    duedate: "",
    error: "",
    requirements: {},
  };

  goPrevPage = () => {
    if (this.state.page >= 1) {
      this.setState(state => ({
        page: state.page - 1,
      }));
    }
  };

  handleCancel = () => {
    this.setState({
      assigneeList: {},
      name: "",
      id: "",
      description: "",
      duedate: "",
      error: "",
    });
  };
  goNextPage = () => {
    if (this.state.page <= 1) {
      this.setState(state => ({
        page: state.page + 1,
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
      requirements,
    } = this.state;
    assigneeList = Object.keys(assigneeList);
    if (!name || !id || !assigneeList.length) {
      this.setState({ error: messages.fillRequiredFields });
    } else {
      description = description ? description : "";

      const body = {};
      if (Object.keys(requirements).length > 0) {
        promise.push(
          saveWorklist(id, name, assigneeList, description, duedate, [
            requirements,
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

  handleFormInput = e => {
    if (this.state.id && this.state.name) this.setState({ error: "" });
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  selectUser = e => {
    const assigneeList = { ...this.state.assigneeList };
    const { name, checked } = e.target;
    checked ? (assigneeList[name] = true) : delete assigneeList[name];
    this.setState({ assigneeList });
  };

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
  };

  render = () => {
    const { users, onCancel } = this.props;
    const { page, id, name, error, requirements } = this.state;
    let button1Text = "Back";
    let button2Text = "Next";
    let button3Text = "Cancel";
    let button1Func = this.goPrevPage;
    let button2Func = this.goNextPage;
    let button3Func = onCancel;
    let disableSubmit = false;
    let disableNext = !id || !name;

    if (page === 2) {
      button2Text = "Submit";
      const assigneeListArr = Object.keys(this.state.assigneeList);
      button2Func = this.handleSaveWorklist;
      if (assigneeListArr.length === 0) disableSubmit = true;
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
      <Modal.Dialog dialogClassName="add-worklist__modal">
        <Modal.Header>
          <Modal.Title>New worklist</Modal.Title>
        </Modal.Header>
        <Modal.Body className="add-worklist__mbody">
          {!this.state.page && (
            <form className="add-worklist__modal--form">
              <h5 className="add-worklist__modal--label">Name*</h5>
              <input
                onMouseDown={e => e.stopPropagation()}
                className="add-worklist__modal--input"
                name="name"
                type="text"
                onChange={this.handleFormInput}
                id="form-first-element"
                defaultValue={this.state.name}
              />
              <h5 className="add-worklist__modal--label">ID*</h5>
              <input
                onMouseDown={e => e.stopPropagation()}
                className="add-worklist__modal--input"
                name="id"
                type="text"
                onChange={this.handleFormInput}
                defaultValue={this.state.id}
              />
              <h6 className="form-exp">
                One word only, no special characters, "_" is OK
              </h6>
              <h5 className="form-exp add-worklist__modal--label">Due date:</h5>
              <input
                type="date"
                name="duedate"
                onChange={this.handleFormInput}
                defaultValue={this.state.duedate}
              />
              <h5 className="add-worklist__modal--label">Description</h5>
              <textarea
                onMouseDown={e => e.stopPropagation()}
                className="add-worklist__modal--input"
                name="description"
                onChange={this.handleFormInput}
                defaultValue={this.state.description}
              />
              <h5 className="form-exp required">*Required</h5>
            </form>
          )}
          {this.state.page === 1 && (
            <>
              <h5 className="add-worklist__modal--label">
                Assign worklist to users
              </h5>
              <UserList
                users={this.props.users}
                onChange={this.selectUser}
                assignees={this.state.assigneeList}
              />
            </>
          )}
          {this.state.page === 2 && (
            <>
              <h5 className="add-worklist__modal--label">
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
          <div className="create-user__modal--buttons">
            <FormButton
              onClick={button1Func}
              text={button1Text}
              disabled={page === 0}
            />
            <FormButton
              onClick={button2Func}
              text={button2Text}
              disabled={page === 0 ? disableNext : disableSubmit}
            />
            <FormButton onClick={button3Func} text={button3Text} />
          </div>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

WorklistCreationForm.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  error: PropTypes.string,
};

export default WorklistCreationForm;
