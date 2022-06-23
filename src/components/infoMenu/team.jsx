import React from "react";
import { Modal } from "react-bootstrap";
const mode = sessionStorage.getItem("mode");

// import "../menuStyle.css";

const team = props => {
  return (
    <Modal id="modal-fix" show={true}>
      <Modal.Header>
        <Modal.Title>ePAD Team</Modal.Title>
      </Modal.Header>
      <Modal.Body >
        <>
          <p >
            Development of ePAD has been supported through a number of funding
            mechanisms and sources.
          </p>
          <p >
            Major contributors for the ePAD{" "}
            {mode === "lite" ? "Lite Beta " : "4.x "}
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
      <Modal.Footer >
        <button variant="secondary" onClick={props.onOK}>
          OK
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default team;
