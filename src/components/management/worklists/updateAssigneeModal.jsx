import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import UserList from "./userList";
import AssgineeDeletetionWarning from "./assigneeDeletionWarning";
import "../menuStyle.css";

class UpdateAssignee extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showWarning: false, warningList: [], isSelectedAll: 0 };
  }

  componentDidMount = () => {
    if (Object.keys(this.props.assigneeList).length === this.props.users.length) {
      this.setState({ isSelectedAll: 1})
    } else if (Object.keys(this.props.assigneeList).length > 0) {
      this.setState({ isSelectedAll: 2})
    } else {
      this.setState({ isSelectedAll: 0})
    }
  }
  
  toggleSelectAll = (e) => {  
    let newSelected = {};
    const event = null;
    if (e.target.checked) {
      this.setState({ isSelectedAll: 1 });
      newSelected = this.props.users.reduce((all, item) => {
        all[item.username] = true;
        return all;
      }, {});
    } else 
      this.setState({ showWarning: false, warningList: {'all users': true}, isSelectedAll: 0 });    
    this.props.selectAssignee(event, newSelected);
    
  }

  selectAssignee = (e) => {
    this.setState({ isSelectedAll: 2});
    this.props.selectAssignee(e);
  }

  checkWorklistDeletion = () => {
    const warningList = [];
    const assigneeListKeys = Object.keys(this.props.assigneeList);
    for (let i = 0; i < assigneeListKeys.length; i += 1) {
      if (
        !this.props.assigneeList[assigneeListKeys[i]] &&
        this.props.initialAssignees.includes(assigneeListKeys[i])
      ) {
        warningList.push(this.props.userNameMap[assigneeListKeys[i]]);
      }
    }
    if (warningList.length > 0 || this.state.isSelectedAll === 0)
      this.setState({ showWarning: true, warningList });
    else this.props.onSubmit();
  };

  handleCancel = () => {
    this.setState({ showWarning: false, warningList: [] });
    this.props.onCancel();
  };

  render = () => {
    return (
      // <Modal.Dialog dialogClassName="updateAssignee__modal">
      <>
        <Modal.Dialog id="modal-fix" className="in-modal">
          <Modal.Header>
            <Modal.Title>Update Assignees</Modal.Title>
          </Modal.Header>
          <Modal.Body className="updateAssignee__mbody">
              <UserList
                users={this.props.users}
                onChange={this.selectAssignee}
                selectAll={this.toggleSelectAll}
                assignees={this.props.assigneeList}
                isSelectedAll={this.state.isSelectedAll}
              />
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
        {this.state.showWarning && (
          <AssgineeDeletetionWarning
            warningList={this.state.warningList}
            onCancel={this.handleCancel}
            onSubmit={this.props.onSubmit}
            allSelected={this.state.isSelectedAll === 0}
          />
        )}
      </>
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
