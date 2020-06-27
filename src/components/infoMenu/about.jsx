import React from "react";
import { Modal } from "react-bootstrap";
import http from "../../services/httpService";
const mode = sessionStorage.getItem("mode");
const apiUrl = sessionStorage.getItem("apiUrl");

class About extends React.Component {
  state = { data: {} };
  componentDidMount = () => {
    if (mode !== "lite") {
      this.getData();
    }
  };
  getData = () => {
    const url = apiUrl + "/epads/version/";
    http.get(url).then(res => this.setState({ data: res.data }));
  };

  render = () => {
    const version = this.state.data.description
      ? this.state.data.description
      : "beta";
    return (
      // <Modal.Dialog dialogClassName="info-about__modal">
      <Modal.Dialog id="modal-fix">
        <Modal.Header>
          <Modal.Title>About ePAD {mode === "lite" ? "Lite" : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="info-about__mbody">
          <div className="info-about__desc">
            A web-based platform for quantitative imaging in the clinical
            workflow.
          </div>
          <div className="info-about__buttonCont">
            <button
              className="info-about__button"
              onClick={() => {
                window.open(
                  "https://epad.stanford.edu/ways-contact-us",
                  "_blank",
                  ""
                );
              }}
            >
              Get help with ePAD
            </button>
            <button
              className="info-about__button"
              onClick={() => {
                window.open(
                  "https://epad.stanford.edu/ways-contact-us",
                  "_blank",
                  ""
                );
              }}
            >
              Report an issue
            </button>
          </div>

          <div className="info-about__desc">Version {version}</div>
          <div className="info-about__desc">
            ePAD Copyright 2016 Stanford University. All rights reserved.
          </div>
          <div className="info-about__desc">
            ePAD is made possible by the{" "}
            <a
              href="https://rubinlab.stanford.edu/"
              target="_blank"
              className="info-about__link"
            >
              Rubin Lab
            </a>{" "}
            at{" "}
            <a
              href="https://www.stanford.edu/"
              target="_blank"
              className="info-about__link"
            >
              Stanford University.
            </a>{" "}
          </div>
          <div className="info-about__desc">
            ePAD{" "}
            <a
              href="https://epad.stanford.edu/license"
              target="_blank"
              className="info-about__link"
            >
              {" "}
              Terms of Service
            </a>
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

export default About;
