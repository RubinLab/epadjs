import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import RequirementForm from "./requirementForm";
import "../menuStyle.css";

class UpdateRequirement extends React.Component {
  state = { requirements: this.props.requirements };

  addRequirement = newReq => {
    this.setState({ requirements: newReq });
  };
  clearRequirement = index => {
    const newRequirements = [...this.state.requirements];
    newRequirements.splice(index, 1);
    this.setState({ requirements: newRequirements });
  };

  render = () => {
    return (
      <Modal.Dialog dialogClassName="updateReq__modal">
        <Modal.Header>
          <Modal.Title>Update Assignees</Modal.Title>
        </Modal.Header>
        <Modal.Body className="updateReq__mbody">
          <RequirementForm
            onAddRequirement={this.addRequirement}
            requirements={this.state.requirements}
            deleteRequirement={this.clearRequirement}
          />
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <div className="updateReq__modal--buttons">
            <button
              className="updateReq__modal--button"
              variant="secondary"
              onClick={() => this.props.onSubmit(this.state.requirements)}
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

UpdateRequirement.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  error: PropTypes.string
};

export default UpdateRequirement;
