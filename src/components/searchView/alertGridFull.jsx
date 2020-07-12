import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";

const message = "Maximum number of series has been reached.";

const alertGridFull = ({ onOK }) => {
  return (
    // <Modal.Dialog dialogClassName="alert-gridFull">
    <Modal.Dialog id="modal-fix">
      <Modal.Body>
        <p className="-gridFull__message">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <button variant="secondary" onClick={onOK}>
          OK
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

alertGridFull.propTypes = {
  onOK: PropTypes.func
};

export default alertGridFull;
