import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";
import { alertViewPortFull, clearGrid } from "./action";

const message = {
  title: "Reached max number of open series!",
  explanation: "Please close a viewport before opening a new one."
};
const alertMaxViewPort = props => {
  return (
    // <Modal.Dialog dialogClassName="alert-maxView">
    <Modal.Dialog id="modal-fix">
      <Modal.Body className="-maxView-container">
        <div className="-maxView__header--icon">
          <FaExclamationTriangle />
        </div>
        <div className="-maxView__header">
          <div className="-maxView__header__text">{message.title}</div>
          <h4 className="-maxView__message--exp">{message.explanation}</h4>
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <button
          size="lg"
          onClick={() => { props.dispatch(clearGrid()); props.dispatch(alertViewPortFull()) }}
        >
          Close all series
        </button>
        <button
          variant="secondary"
          onClick={() => props.dispatch(alertViewPortFull())}
        >
          OK
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

alertMaxViewPort.propTypes = {
  onOK: PropTypes.func
};

export default connect()(alertMaxViewPort);
