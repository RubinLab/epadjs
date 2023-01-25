import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./infoMenu.css";

let mode;
let apiUrl;

class Help extends React.Component {

  triggerBrowserDownload = (blob, fileName) => {
    console.log(blob);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.style = 'display: none';
    link.href = url;
    link.download = `${fileName}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  downloadManual = async () => {
    try {
      const result = await fetch(`${process.env.PUBLIC_URL}/STELLA_User_Manual.pdf`)
      const json = await result.json();
      console.log(json);
      let blob = new Blob([json], { type: 'application/pdf' });
      this.triggerBrowserDownload(blob, `STELLA_User_Manual`);
    } catch (err) {
      console.error("Reading STELLA_User_Manual", err);
    }
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
            {`To read more about the features of ${mode === 'teaching' ? 'STELLA' : 'EPAD'}`}
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
                Get help with STELLA
              </button>)}
            </div>
            <div>

              To give feedback, recommandations, or report issues
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
            <div>
              If you need to resolve your issue as soon as possible, please call the service desk
              <div>

                <button
                  className="info-about__button"
                  onClick={() => console.log("help desk")}
                >
                  Service Desk
                </button>
              </div>
            </div>
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
