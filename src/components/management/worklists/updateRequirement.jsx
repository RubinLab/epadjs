import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import RequirementForm from "./requirementForm";
import RequirementEdit from "./requirementEditTable";

import "../menuStyle.css";

const buttonStyle = {
  width: "-webkit-fill-available",
  marginBottom: "0.5rem",
  background: "rgb(241, 241, 241)",
  color: "#272b30",
  fontSize: "1.1rem"
};
class UpdateRequirement extends React.Component {
  state = { requirements: this.props.requirements, page: 0 };

  addRequirement = newReq => {
    this.setState({ requirements: newReq });
  };
  clearRequirement = index => {
    const newRequirements = [...this.state.requirements];
    newRequirements.splice(index, 1);
    this.setState({ requirements: newRequirements });
  };

  changePage = e => {
    const { name } = e.target;
    if (name === "addNew") {
      this.setState({ page: 1 });
    } else if (name === "edit") {
      this.setState({ page: 2 });
    } else {
      this.setState({ page: 0 });
    }
  };

  onClose = () => {
    const { page } = this.state;
    if (page === 0) {
      this.props.onCancel();
    } else {
      this.setState({ page: 0 });
    }
  };
  render = () => {
    const { page } = this.state;
    const changeStarted = page === 1 || page === 2;
    const secondButton = changeStarted ? "Back" : "Cancel";
    return (
      <Modal.Dialog dialogClassName="updateReq__modal">
        <Modal.Header>
          <Modal.Title>Update Assignees</Modal.Title>
        </Modal.Header>
        <Modal.Body className="updateReq__mbody">
          {page === 0 && (
            <>
              <Button
                variant="dark"
                name="addNew"
                style={buttonStyle}
                onClick={this.changePage}
              >
                Add New Requirement
              </Button>
              <Button
                variant="dark"
                name="edit"
                style={buttonStyle}
                onClick={this.changePage}
              >
                Edit-Delete Requirement
              </Button>
            </>
          )}
          {page === 1 && (
            <RequirementForm
              onAddRequirement={this.addRequirement}
              requirements={this.state.requirements}
              deleteRequirement={this.clearRequirement}
            />
          )}
          {page === 2 && (
            <RequirementEdit requirements={this.state.requirements} />
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <div className="updateReq__modal--buttons">
            {changeStarted && (
              <button
                className="updateReq__modal--button"
                variant="secondary"
                onClick={() => this.props.onSubmit(this.state.requirements)}
              >
                Submit
              </button>
            )}
            <button
              className="edit-permission__modal--button"
              variant="secondary"
              onClick={this.onClose}
            >
              {secondButton}
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
