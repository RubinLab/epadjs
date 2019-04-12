import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { alertViewPortFull } from "./action";

const message = {
  title: "Maximum number of views has been reached!",
  explanation: "Please close a view screen to open a new one"
};
const alertMaxViewPort = props => {
  return (
    <Modal.Dialog dialogClassName="alert-maxView">
      <Modal.Body>
        <h2 className="-maxView__message--title">{message.title}</h2>
        <h4 className="-maxView__message--exp">{message.explanation}</h4>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
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
