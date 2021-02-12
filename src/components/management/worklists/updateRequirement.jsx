import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import RequirementForm from "./requirementForm";
import RequirementEdit from "./requirementEditTable";

import "../menuStyle.css";

const buttonStyle = {
  width: "80%",
  margin: "0.5rem",
  fontSize: "1.1rem",
};
class UpdateRequirement extends React.Component {
  state = { requirements: [], page: 0 };

  componentDidMount = () => {
    const requirements = _.cloneDeep(this.props.requirements);
    this.setState({ requirements }); 
  }

  addRequirement = newReq => {
    this.setState({ requirements: newReq });
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

  onSubmit = () => {
    const { page } = this.state;
    if (page === 1) {
      this.props.onAddNew();
    }
  };

  render = () => {
    const { page, requirements } = this.state;
    const { error } = this.props;
    const changeStarted = page === 1 || page === 2;
    const secondButton = changeStarted ? "Back" : "Cancel";
    return (
      // <Modal.Dialog dialogClassName="updateReq__modal">
      <Modal.Dialog id="modal-fix" className="in-modal">
        <Modal.Header>
          <Modal.Title>Update Requirements</Modal.Title>
        </Modal.Header>
        <Modal.Body className="updateReq__mbody">
          {page === 0 && (
            <>
              <Button
                variant="light"
                name="addNew"
                style={buttonStyle}
                onClick={this.changePage}
                className="updateReq__btn"
              >
                Add New Requirement
              </Button>
              <Button
                variant="light"
                name="edit"
                style={buttonStyle}
                onClick={this.changePage}
                disabled={requirements.length < 2}
              >
                Delete Requirement
              </Button>
            </>
          )}
          {page === 1 && (
            <>
              <RequirementForm
                requirements={requirements}
                onNewReqInfo={this.props.onNewReqInfo}
              />
              {error && <div className="err-message __field">{error}</div>}
            </>
          )}
          {page === 2 && (
            <RequirementEdit
              requirements={requirements}
              onDelete={this.props.onDelete}
            />
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <div className="updateReq__modal--buttons">
            {changeStarted && (
              <button
                className="updateReq__modal--button"
                variant="secondary"
                onClick={this.onSubmit}
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
  error: PropTypes.string,
  onAddNew: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onNewReqInfo: PropTypes.func,
  requirements: PropTypes.array,
  worklistID: PropTypes.string,

};

export default UpdateRequirement;
