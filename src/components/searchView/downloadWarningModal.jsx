import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";

const alertDownloadModal = ({ details, onOK }) => {
  console.log(details);
  const clearCarets = string => {
    if (string) {
      for (let i = 0; i < string.length; i++) {
        string = string.replace("^", " ");
      }
      return string;
    }
  };
  const list = [];
  details.forEach((item, i) => {
    list.push(<li key={`${i}item`}>{clearCarets(item)}</li>);
  });

  return (
    <Modal.Dialog dialogClassName="alert-download__modal">
      <Modal.Body>
        <div className="__message--container">
          <p className="alert-download__message">
            No annotations to download for
          </p>
          <ul>{list}</ul>
        </div>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <button variant="secondary" onClick={onOK}>
          OK
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

export default alertDownloadModal;
