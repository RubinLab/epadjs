import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { openProjectSelectionModal } from "./action";

const message = {
  title: "Not enough ports to open series"
  // explanation: "Please close a view screen before open a new one"
};
const alertMaxViewPort = props => {
  return (
    <Modal.Dialog dialogClassName="alert-maxView">
      <Modal.Body className="-maxView-container">
        <div className="-maxView__header">
          <div className="-maxView__header__text">{message.title}</div>
          {/* <h4 className="-maxView__message--exp">{message.explanation}</h4> */}
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <button
          variant="secondary"
          onClick={() => props.dispatch(openProjectSelectionModal())}
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
