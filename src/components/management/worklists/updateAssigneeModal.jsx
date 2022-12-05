import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import UserList from "./userList";
import AssgineeDeletetionWarning from "./assigneeDeletionWarning";
import "../menuStyle.css";

class UpdateAssignee extends React.Component {
  state = { showWarning: false, warningList: [], selectAll: 0 };

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
    // if all selected iterate over the props.users and push all  as username = true 
    // and call selectAssignee as (null, object)
    // is unselects the checkbox call selectAssignee(null, {});
    
  }

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
    return (
      // <Modal.Dialog dialogClassName="updateAssignee__modal">
      <Modal.Dialog id="modal-fix" className="in-modal">
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
              selectAll={() => console.log("select all here!!!")}
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
