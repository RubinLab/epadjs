import React from "react";
import { Modal } from "react-bootstrap";
import { isLite } from "../../config.json";

// import "../menuStyle.css";

const team = props => {
  return (
    <Modal.Dialog dialogClassName="info-team__modal">
      <Modal.Header>
        <Modal.Title>ePAD Team</Modal.Title>
      </Modal.Header>
      <Modal.Body className="info-team__mbody">
        <>
          <p className="info-team__desc">
            Development of ePAD has been supported through a number of funding
            mechanisms and sources.
          </p>
          <p className="info-team__desc">
            Major contributors for the ePAD {isLite ? "Lite Beta " : "4.x "}
            release include (in alphabetic order):
          </p>
          <ul>
            <li>Mete Ugur Akdogan</li>
            <li>Emel Alkim</li>
            <li>Cavit Altindag</li>
            <li>Ozge Ikiz Yurtsever</li>
          </ul>
        </>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <button variant="secondary" onClick={props.onOK}>
          OK
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

export default team;
