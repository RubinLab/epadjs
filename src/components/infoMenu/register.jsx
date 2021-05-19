import React from "react";
import { Fragment } from "react";
import { Modal } from "react-bootstrap";
import { registerServerForAppKey } from "../../services/registerServices";
const mode = sessionStorage.getItem("mode");
const apiUrl = sessionStorage.getItem("apiUrl");

class Register extends React.Component {
  state = {
    registerFormElements: {
      name: "",
      email: "",
      emailagain: "",
      organization: "",
      emailvalidationcode: "",
    },
    formError: "",
    showEmailValidationInput: false,
    apikeysent: false,
    showform: true,
  };

  registerFormOnChangeHandler = (e) => {
    //alert(e.currentTarget.id);
    let tmpFormError = "";
    const tempFormElements = { ...this.state.registerFormElements };
    tempFormElements[e.currentTarget.name] = e.currentTarget.value;
    this.setState({
      registerFormElements: tempFormElements,
      formError: tmpFormError,
    });
  };
  submitForm = async () => {
    let tmpFormError = "";
    let serverReponse = "";
    let tmpState = { ...this.state };
    if (tmpState.registerFormElements.name === "") {
      tmpFormError = `${tmpFormError} name field is empty \n`;
    }

    if (tmpState.registerFormElements.email === "") {
      tmpFormError = `${tmpFormError} email field is empty \n`;
    }

    if (tmpState.registerFormElements.emailagain === "") {
      tmpFormError = `${tmpFormError} retype email is empty \n`;
    }

    if (tmpState.registerFormElements.organization === "") {
      tmpFormError = `${tmpFormError} organization field is empty \n`;
    }

    if (
      tmpState.registerFormElements.email !== "" &&
      tmpState.registerFormElements.emailagain !== "" &&
      tmpState.registerFormElements.email !==
        tmpState.registerFormElements.emailagain
    ) {
      tmpFormError = `${tmpFormError}email and retype email fields don't match`;
    }
    this.setState({
      formError: tmpFormError,
    });
    tmpState.formError = tmpFormError;

    if (tmpState.formError === "") {
      try {
        serverReponse = await registerServerForAppKey(
          tmpState.registerFormElements
        );

        this.setState({
          showEmailValidationInput: true,
        });
        console.log("server response returned: ", serverReponse);
        if (serverReponse.data === "validated") {
          this.setState({
            apikeysent: true,
            showEmailValidationInput: false,
          });
        } else if (serverReponse.data === "invalid") {
          this.setState({
            apikeysent: false,
            showEmailValidationInput: false,
            showform: false,
            formError:
              "the information provided is not correct please retry to register",
          });
        }
      } catch (error) {
        console.log("stat returned ", error);
        this.setState({
          apikeysent: false,
          showEmailValidationInput: false,
          showform: false,
          formError:
            "Encountered an issue while sending the email. Please check Notificatios for further detail",
        });
      }
    }
  };

  render = () => {
    const registerAppstyle = {
      color: "white",
      backgroundColor: "DodgerBlue",
      padding: "10px",
      fontFamily: "Arial",
    };
    return (
      <Modal.Dialog id="modal-fix">
        <Modal.Header>
          <Modal.Title>Register to ePAD</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={registerAppstyle}>
            <table style={{ width: "400px" }}>
              <tbody>
                {!this.state.showEmailValidationInput &&
                  !this.state.apikeysent &&
                  this.state.showform && (
                    <Fragment>
                      <tr>
                        <td>
                          <h5 className="add-project__modal--label">Name*</h5>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <input
                            onMouseDown={(e) => e.stopPropagation()}
                            className="add-project__modal--input"
                            name="name"
                            type="text"
                            onChange={this.registerFormOnChangeHandler}
                            id="registerName"
                            value={this.state.registerFormElements.name}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <h5 className="add-project__modal--label">
                            Organization*
                          </h5>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <input
                            onMouseDown={(e) => e.stopPropagation()}
                            className="add-project__modal--input"
                            name="organization"
                            type="text"
                            onChange={this.registerFormOnChangeHandler}
                            id="registerOrganization"
                            value={this.state.registerFormElements.organiation}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <h5 className="add-project__modal--label">Email*</h5>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <input
                            onMouseDown={(e) => e.stopPropagation()}
                            className="add-project__modal--input"
                            name="email"
                            type="text"
                            value={this.state.registerFormElements.email}
                            id="registerEmail"
                            onChange={this.registerFormOnChangeHandler}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <h5 className="add-project__modal--label">
                            Retype Email*
                          </h5>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <input
                            onMouseDown={(e) => e.stopPropagation()}
                            className="add-project__modal--input"
                            name="emailagain"
                            type="text"
                            onChange={this.registerFormOnChangeHandler}
                            id="registerEmailAgain"
                            value={this.state.registerFormElements.emailagain}
                          />
                          <h5 className="form-exp required">*Required</h5>
                        </td>
                      </tr>
                    </Fragment>
                  )}
                {this.state.showEmailValidationInput && !this.state.apikeysent && (
                  <Fragment>
                    <tr>
                      <td>
                        <h5 className="add-project__modal--label">
                          We sent a Validation Code to your email. {"\n"}
                          Please type it in the field below and submit.
                        </h5>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <input
                          onMouseDown={(e) => e.stopPropagation()}
                          className="add-project__modal--input"
                          name="emailvalidationcode"
                          type="text"
                          onChange={this.registerFormOnChangeHandler}
                          id="emailvalidationcode"
                          value={
                            this.state.registerFormElements.emadilvalidationcode
                          }
                        />
                      </td>
                    </tr>
                  </Fragment>
                )}
                {this.state.apikeysent && (
                  <Fragment>
                    <tr>
                      <td>
                        <h5 className="add-project__modal--label">
                          We sent an api key to your email
                        </h5>
                      </td>
                    </tr>
                  </Fragment>
                )}
                <tr>
                  <td>
                    {this.state.formError && (
                      <div className="err-message">
                        <table id="2">
                          {this.state.formError.split("\n").map((str) => (
                            <tr id="{str}">
                              <td>{str}</td>
                            </tr>
                          ))}
                        </table>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <button variant="secondary" onClick={this.props.onOK}>
            close
          </button>
          {!this.state.apikeysent && (
            <button variant="secondary" onClick={this.submitForm}>
              submit
            </button>
          )}
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

export default Register;
