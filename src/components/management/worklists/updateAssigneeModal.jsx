import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import UserList from "./userList";
import AssgineeDeletetionWarning from "./assigneeDeletionWarning";
import "../menuStyle.css";

class UpdateAssignee extends React.Component {
  state = { showWarning: false, warningList: [] };
  checkWorklistDeletion = () => {
    const warningList = [];
    const assigneeList = Object.keys(this.props.assigneeList);
    for (let i = 0; i < assigneeList.length; i += 1) {
      if (
        !this.props.assigneeList[assigneeList[i]] &&
        this.props.initialAssignees.includes(assigneeList[i])
      ) {
        warningList.push(assigneeList[i]);
      }
    }
    if (warningList.length > 0)
      this.setState({ showWarning: true, warningList });
    else this.props.onSubmit();
  };

  handleCancel = () => {
    this.setState({ showWarning: false, warningList: [] });
  };

  render = () => {
    console.log(this.state);
    return (
      <Modal.Dialog dialogClassName="updateAssignee__modal">
        <Modal.Header>
          <Modal.Title>Update Assignees</Modal.Title>
        </Modal.Header>
        <Modal.Body className="updateAssignee__mbody">
          <>
            {this.state.showWarning && (
              <AssgineeDeletetionWarning
                warningList={this.state.warningList}
                onCancel={this.handleCancel}
                onSubmit={this.props.onSubmit}
              />
            )}
            <UserList
              users={this.props.users}
              onChange={this.props.selectAssignee}
              assignees={this.props.assigneeList}
            />
          </>
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <div className="updateAssignee__modal--buttons">
            <button
              className="updateAssignee__modal--button"
              variant="secondary"
              onClick={this.checkWorklistDeletion}
            >
              Submit
            </button>
            <button
              className="edit-permission__modal--button"
              variant="secondary"
              onClick={() => {
                this.props.onCancel();
              }}
            >
              Cancel
            </button>
          </div>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

UpdateAssignee.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  error: PropTypes.string
};

export default UpdateAssignee;
