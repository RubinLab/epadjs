import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";

const warningModal = props => {
  return (
    // <Modal.Dialog dialogClassName="alert-maxView">
    <Modal.Dialog id="modal-fix">
      <Modal.Body className="-maxView-container">
        {/* <div className="-maxView__header--icon">
          <FaExclamationTriangle />
        </div> */}
        <div className="-maxView__header notification-modal">
          <div
            className="-maxView__header__text"
            style={{ color: "orangered" }}
          >
            {props.title}
          </div>
          <h4 className="-maxView__message--exp">{props.message}</h4>
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <Button variant="secondary" onClick={props.onOK}>
          OK
        </Button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

warningModal.propTypes = {
  onOK: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string
};

export default warningModal;