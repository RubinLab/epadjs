import React from "react";
import { Modal } from "react-bootstrap";
import { saveSubject } from "../../services/subjectServices";
import { toast } from "react-toastify";
import "./searchView.css";

class SubjectCreationForm extends React.Component {
  state = { name: "", abbreviation: "", error: "" };
  handleSubmit = () => {
    if (!this.state.name || !this.state.abbreviation) {
      this.setState({ error: "Please fill the required fields!" });
    } else {
      saveSubject(this.props.project, this.state.abbreviation, this.state.name)
        .then(() => {
          this.props.onSubmit();
          this.handleCancel();
          this.props.onResolve();
          toast.success("Subject successfully saved!");
        })
        .catch(error => {
          toast.error(error.response.data.message, { autoClose: false });
          this.props.onResolve();
          this.props.onCancel();
        });
    }
  };

  handleInput = e => {
    this.setState({ [e.target.name]: e.target.value });
  };
  handleCancel = () => {
    this.setState({ name: "", abbreviation: "", error: "" });
    this.props.onCancel();
  };
  render = () => {
    return (
      <Modal.Dialog dialogClassName="add-subject__modal">
        <Modal.Header>
          <Modal.Title>Create a New Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body className="add-subject__mbody">
          <form className="add-subject__modal--form">
            <h5 className="add-subject__modal--label">Name*</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="add-subject__modal--input"
              name="name"
              type="text"
              onChange={this.handleInput}
              id="form-first-element"
            />
            <h5 className="add-subject__modal--label">SubjectID / Abbreviation*</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="add-subject__modal--input"
              name="abbreviation"
              type="text"
              onChange={this.handleInput}
            />
            <h6 className="form-exp">
              One word only, no special characters, '_' is OK
            </h6>
            <h5 className="form-exp required">*Required</h5>
            {this.state.error && (
              <div className="err-message">{this.state.error}</div>
            )}
          </form>
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <button variant="primary" onClick={this.handleSubmit}>
            Submit
          </button>
          <button variant="secondary" onClick={this.handleCancel}>
            Cancel
          </button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

export default SubjectCreationForm;
