import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";


const warningModal = props => {
  return (
    <Modal.Dialog dialogClassName="alert-maxView">
      <Modal.Body className="-maxView-container">
        {/* <div className="-maxView__header--icon">
          <FaExclamationTriangle />
        </div> */}
        <div className="-maxView__header">
          <div className="-maxView__header__text" style={{color: 'orangered'}} >{props.title}</div>
          <h4 className="-maxView__message--exp">{props.message}</h4>
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <button
          variant="secondary"
          onClick={props.onOK}
        >
          OK
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

warningModal.propTypes = {
  onOK: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string

};

export default warningModal;