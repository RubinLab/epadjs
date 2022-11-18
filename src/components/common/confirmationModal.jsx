import React from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";


const confirmationModal = props => {
  return (
    <Modal.Dialog id="modal-fix">
      <Modal.Body className="-maxView-container notification-modal">
        <div className="-maxView__header">
          <div className="-maxView__header__text" style={{ color: 'orangered' }} >{props.title}</div>
          <h4 className="-maxView__message--exp">{props.message}</h4>
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons notification-modal">
        <Button
          variant="secondary"
          onClick={props.onSubmit}
        >
          {props.button || "Submit"}
        </Button>
        <Button
          variant="secondary"
          onClick={props.onCancel}
        >
          Cancel
        </Button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

confirmationModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  button: PropTypes.string

};

export default confirmationModal;