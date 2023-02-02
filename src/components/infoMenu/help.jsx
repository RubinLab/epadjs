import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./infoMenu.css";

let mode;
let apiUrl;

class Help extends React.Component {

  downloadManual = async () => {
    fetch(`${process.env.PUBLIC_URL}/STELLA_User_Manual.pdf`).then(response => {
      response.blob().then(blob => {
        const fileURL = window.URL.createObjectURL(blob);
        let alink = document.createElement('a');
        alink.href = fileURL;
        alink.download = 'STELLA_User_Manual.pdf';
        alink.click();
      }).catch(error => console.error('Reading STELLA_User_Manual', error))
    }).catch(err => console.error("Downloading STELLA_User_Manual", err))
  }

  render = () => {
    const mode = sessionStorage.getItem("mode");
    const feedback = sessionStorage.getItem("feedback");
    return (
      // <Modal.Dialog dialogClassName="info-about__modal">
      <Modal id="modal-fix" show={true}>
        <Modal.Header className="modal-header">
          <Modal.Title>Help</Modal.Title>
        </Modal.Header>
        <Modal.Body className={"notification-modal"}>
          <div>
            {`Learning to use ${mode === 'teaching' ? 'STELLA' : 'ePAD'}?`}
            <div >
              {mode !== 'teaching' && (
                <button
                  className="info-about__button"
                  onClick={() => {
                    window.open(
                      "https://epad.stanford.edu/documentation/user",
                      "_blank",
                      ""
                    );
                  }}
                >
                  Get help with ePAD
                </button>)}
              {mode === 'teaching' && (<button
                className="info-about__button"
                onClick={this.downloadManual}
              >
                Online User Manual
              </button>)}
            </div>
            <div>
              {`Please give your feedback on ${mode === 'teaching' ? 'STELLA' : 'ePAD'} and recommendations for improvements`}
              <div>
                <button
                  className="info-about__button"
                  onClick={() => {
                    {
                      mode !== 'teaching' ? window.open(
                        "https://epad.stanford.edu/ways-contact-us",
                        "_blank",
                        ""
                      ) : feedback !== 'undefined' ?
                        window.open(
                          feedback,
                          "_blank",
                          ""
                        )
                        : null
                    }
                  }}
                >
                  {mode === 'teaching' ? 'Open Feedback Form' : 'Report an issue'}
                </button>
              </div>
            </div>
            {mode === 'teaching' && (<div>
              <p>
                Having technical issues such as login or crashes? <br />
                Please submit a Help Ticket to IT
              </p>
              <div>
                <button
                  className="info-about__button"
                  onClick={() => window.open("https://itcare.stanfordhealthcare.org/", "_blank", "")}
                >
                  Submit Help Ticket
                </button>
              </div>
            </div>)}
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

export default Help;
