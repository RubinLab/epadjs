import React from "react";
import { Modal, Button } from "react-bootstrap";
import http from "../../services/httpService";
import "./infoMenu.css";

let mode;
let apiUrl;

class About extends React.Component {
  state = { data: {} };
  componentDidMount = () => {
    mode = sessionStorage.getItem("mode");
    apiUrl = sessionStorage.getItem("apiUrl");
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
      <Modal id="modal-fix" show={true}>
        <Modal.Header className="modal-header">
          <Modal.Title>About ePAD {mode === "lite" ? "Lite" : ""}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={"notification-modal"}>
          <div >
            A web-based platform for quantitative imaging in the clinical
            workflow.
          </div>
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
              Info about ePAD
            </button>
          <div>Version {version}</div>
          <div>
            ePAD Copyright 2016 Stanford University. All rights reserved.
          </div>
          <div>
            ePAD is made possible by the{" "}
            <a
              href="https://rubinlab.stanford.edu/"
              target="_blank"
              className="info-about__link"
              style={{ color: '#E83879' }}
            >
              Rubin Lab
            </a>{" "}
            at{" "}
            <a
              href="https://www.stanford.edu/"
              target="_blank"
              className="info-about__link"
              style={{ color: '#E83879' }}>
              Stanford University.
            </a>{" "}
          </div>
          <div>
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

        <Modal.Footer>
          <Button variant="secondary" onClick={this.props.onOK}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
}

export default About;
