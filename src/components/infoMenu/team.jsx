import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./infoMenu.css";

const team = props => {
  const mode = sessionStorage.getItem("mode");
  return (
    <Modal id="modal-fix" show={true}>
      <Modal.Header className="modal-header">
        <Modal.Title>ePAD Team</Modal.Title>
      </Modal.Header>
      <Modal.Body className="notification-modal" >
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
        <Button variant="secondary" onClick={props.onOK}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default team;
