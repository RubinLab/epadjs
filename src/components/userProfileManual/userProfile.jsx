import React from "react";
import { Modal } from "react-bootstrap";
import UpdatePasswordForm from "./updatePasswordForm";
import UpdateEmailForm from "./updateEmailForm";
// import "../menuStyle.css";
const messages = {
  inValidEmail: "Email format is invalid",
  confirmPassword: "New password and confirmation password do not match",
  fillRequired: "Please fill required fields"
};
class UserProfile extends React.Component {
  state = {
    data: {},
    updatePasswordClicked: false,
    updateEmailClicked: false,
    pw: {},
    email: {},
    pwError: null,
    emailError: null
  };

  handleUpdatePasswordClick = () => {
    this.setState(state => ({
      updatePasswordClicked: !state.updatePasswordClicked
    }));
  };

  handleUpdateEmailClick = () => {
    this.setState(state => ({
      updateEmailClicked: !state.updateEmailClicked
    }));
  };

  handleFormInput = e => {
    const { name, value } = e.target;
    const { form } = e.target.dataset;
    if (form === "pw") {
      const obj = { ...this.state.pw };
      obj[name] = value;
      this.setState({ pw: obj });
    } else if (form === "email") {
      const obj = { ...this.state.email };
      obj[name] = value;
      this.setState({ email: obj });
    }
  };

  validateEmail = string => {
    return string.includes("@") && string.includes(".");
  };

  handleSubmit = e => {
    e.preventDefault();
    const { oldPassord, newPassword, confirmPassword } = this.state.pw;
    const { form } = e.target.dataset;
    if (form === "pw") {
      if (!oldPassord || !newPassword || !confirmPassword) {
        this.setState({ pwError: messages.fillRequired });
      } else if (newPassword !== confirmPassword) {
        this.setState({ pwError: messages.confirmPassword });
      } else {
        this.setState({ pwError: "" });
      }
    } else if (form === "email") {
      if (!this.state.email.newEmail) {
        this.setState({ emailError: messages.fillRequired });
      } else if (!this.validateEmail(this.state.email["newEmail"])) {
        this.setState({ emailError: messages.inValidEmail });
      } else {
        this.setState({ emailError: "" });
      }
    }
  };
  render = () => {
    return (
      // <Modal.Dialog dialogClassName="user-profile__modal">
      <Modal.Dialog id="modal-fix">
        <Modal.Header>
          <Modal.Title>User Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="user-profile__mbody">
          <div className="user-profile__desc">{this.props.user.username}</div>
          <div className="user-profile__buttonCont">
            <div className="-updatePw">
              <div
                className={
                  this.state.updatePasswordClicked
                    ? "user-profile__button clicked"
                    : "user-profile__button"
                }
                onClick={this.handleUpdatePasswordClick}
              >
                Update Password
              </div>
              {this.state.updatePasswordClicked && (
                <UpdatePasswordForm
                  onType={this.handleFormInput}
                  error={this.state.pwError}
                  onSubmit={this.handleSubmit}
                />
              )}
            </div>
            <div className="-updateEmail">
              <div
                className={
                  this.state.updateEmailClicked
                    ? " user-profile__button clicked"
                    : "user-profile__button"
                }
                onClick={this.handleUpdateEmailClick}
              >
                Update Email
              </div>
              {this.state.updateEmailClicked && (
                <UpdateEmailForm
                  onType={this.handleFormInput}
                  error={this.state.emailError}
                  onSubmit={this.handleSubmit}
                />
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <button variant="secondary" onClick={this.props.onOK}>
            OK
          </button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

export default UserProfile;
