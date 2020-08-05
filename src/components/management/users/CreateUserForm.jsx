import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import "../menuStyle.css";
import FormButton from "./formButton";
import UserPermissionEdit from "./permissionTable";
import UserRoleEditTable from "./projectTable";

class CreateUserForm extends React.Component {
  state = {
    page: 0,
    email: false,
  };

  goNextPage = () => {
    if (this.state.page < 2) {
      this.setState(state => ({ page: state.page + 1 }));
    }
  };

  goPrevPage = () => {
    if (this.state.page > 0) {
      this.setState(state => ({ page: state.page - 1 }));
    }
  };

  validateEmail = e => {
    const includesAt = e.target.value.includes("@");
    if (includesAt) {
      const domain1 = e.target.value.substring(e.target.value.indexOf("@"));
      if (domain1.includes(".")) {
        const domain2 = domain1.substring(domain1.indexOf("."));
        if (domain2.length >= 2) {
          this.setState({ email: true, error: "" });
          this.props.getUserName(e);
        }
      }
    } else {
      this.setState({ email: false });
      // this.setState({ error: "Enter a valid email address" });
    }
  };
  render = () => {
    const { page, email } = this.state;
    let button1Text = "Back";
    let button2Text = "Next";
    let button3Text = "Cancel";
    let button1Func = this.goPrevPage;
    let button2Func = this.goNextPage;
    let button3Func = this.props.onCancel;
    const mode = sessionStorage.getItem("mode");

    if (page === 2) {
      button2Text = "Submit";
      button2Func = this.props.onSubmit;
    }

    const projectToRole = mode === "lite" ? ["lite:Member"] : [];
    return (
      // <Modal.Dialog dialogClassName="create-user__modal">
      <Modal.Dialog id="modal-fix" className="in-modal create-user">
        <Modal.Header>
          <Modal.Title>Create User</Modal.Title>
        </Modal.Header>
        <Modal.Body className="create-user__modal --body">
          {this.state.page === 0 && (
            <div className="create-user__p1">
              <span className="--label">New user email</span>
              <input
                onMouseDown={e => e.stopPropagation()}
                className="--email"
                type="text"
                onChange={e => {
                  this.validateEmail(e);
                }}
              />
            </div>
          )}
          {this.state.page === 1 && (
            <UserPermissionEdit onSelect={this.props.onSelectPermission} />
          )}
          {this.state.page === 2 && (
            <UserRoleEditTable
              onSelect={this.props.onSelectRole}
              projects={this.props.projects}
              projectToRole={projectToRole}
            />
          )}
          <div className="err-message">
            {this.props.error || this.state.error}
          </div>
        </Modal.Body>
        <Modal.Footer className="create-user__modal--footer">
          <div className="create-user__modal--buttons">
            <FormButton
              onClick={button1Func}
              text={button1Text}
              disabled={page === 0}
            />
            <FormButton
              onClick={button2Func}
              text={button2Text}
              disabled={page === 0 && !email}
            />
            <FormButton onClick={button3Func} text={button3Text} />
          </div>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

CreateUserForm.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  error: PropTypes.string,
  onSelect: PropTypes.func,
  userPermission: PropTypes.array,
};

export default CreateUserForm;
