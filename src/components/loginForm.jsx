import React from "react";
import Joi from "joi-browser";
import Form from "./common/form";
import auth from "../services/authService";
import logo from "../images/logo.png";
import TermsModal from "./termsModal";
import SweetAlert from "react-bootstrap-sweetalert";

class LoginForm extends Form {
  constructor(props) {
    super(props);
    this.state = {
      data: { username: "", password: "", agreement: "false" },
      errors: {},
      modalShow: false,
      passwordShow: false
    };
  }

  schema = {
    username: Joi.string()
      .required()
      .label("Username"),
    password: Joi.string()
      .required()
      .label("Password"),
    agreement: Joi.boolean()
      .invalid(false)
      .label("Licence Agreement")
  };

  doSubmit = async () => {
    try {
      const { data } = this.state;
      await auth.login(data.username, data.password);
      window.location = "/";
    } catch (ex) {
      if (ex.response && ex.response.status === 400) {
        const errors = { ...this.state.errors };
        errors.username = ex.response.data;
        this.setState({ errors });
      }
    }
  };

  render() {
    let modalClose = () => this.setState({ modalShow: false });

    return (
      <div className="col-4 mx-auto center-block">
        <img src={logo} className="mx-auto d-block" alt={"logo"} width="40px" />
        <h4 className="text-center">Welcome to ePAD</h4>
        <h5 className="text-center">Please login to continue!</h5>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("username", "Username")}
          {this.renderInput("password", "Password", "password")}
          <label className="label-not-bold">
            <input type="checkbox" name="agree" /> I agree to{" "}
          </label>
          <p
            className="btn btn-sm btn-link"
            onClick={() => {
              this.setState({ modalShow: true });
            }}
          >
            eAPD Licence Agreement
          </p>
          <br />
          {this.renderButton("Login")}
        </form>
        <TermsModal show={this.state.modalShow} onHide={modalClose} />
        <hr />
        <p>
          Lost your password? Click the button below to receive an email with
          information about recovering your password.
        </p>
        <button
          className="btn btn-primary btn-sm center-block"
          onClick={() => this.setState({ passwordShow: true })}
        >
          Recover Password
        </button>
        <SweetAlert
          input
          show={this.state.passwordShow}
          cancelBtnBsStyle="default"
          title="An input!"
          text="sadfasdfasdfasdfasdfasdfsadfdsfasdfasdfasdfasdfsdf"
          onConfirm={() => {
            console.log("confirm");
            this.setState({ passwordShow: false });
          }}
          onCancel={() => {
            console.log("cancel");
            this.setState({ passwordShow: false });
          }}
          onEscapeKey={() => this.setState({ passwordShow: false })}
          onOutsideClick={() => this.setState({ passwordShow: false })}
        />
      </div>
    );
  }
}

export default LoginForm;
