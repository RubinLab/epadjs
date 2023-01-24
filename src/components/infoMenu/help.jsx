import React from "react";
import { Modal, Button } from "react-bootstrap";
import http from "../../services/httpService";
import "./infoMenu.css";

let mode;
let apiUrl;

class About extends React.Component {

  render = () => {
    const mode = sessionStorage.getItem("mode");
    const feedback = sessionStorage.getItem("feedback");
    return (
      // <Modal.Dialog dialogClassName="info-about__modal">
      <Modal id="modal-fix" show={true}>
        <Modal.Header className="modal-header">
          {/* <Modal.Title>Help with {mode === 'teaching' ? "Stella" : "ePAD"} {mode === "lite" ? "Lite" : ""}</Modal.Title> */}
          <Modal.Title>Help</Modal.Title>

        </Modal.Header>
        <Modal.Body className={"notification-modal"}>
          <div >
            {mode !== 'teaching' && (
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
              </button>)}
            {mode === 'teaching' && (<button
              className="info-about__button"
              onClick={() => {
                window.open(
                  "https://epad.stanford.edu/ways-contact-us",
                  "_blank",
                  ""
                );
              }}
            >
              Get help with STELLA
            </button>)}
            <button
              className="info-about__button"
              onClick={() => {
                {
                  mode !== 'teaching' ? window.open(
                    "https://epad.stanford.edu/ways-contact-us",
                    "_blank",
                    ""
                  ) :
                    window.open(
                      feedback,
                      "_blank",
                      ""
                    )
                }
              }}
            >
              Report an issue
            </button>
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
