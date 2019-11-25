import React from "react";
import { Modal } from "react-bootstrap";
import ListItem from "./listItem";

const responseList = ({ onOK, list, title }) => {
  return (
    <Modal.Dialog dialogClassName="response__modal">
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="response__mbody">
        {list.map(item => (
          <ListItem item={item} />
        ))}
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <button variant="secondary" onClick={onCancel}>
          OK
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

export default responseList;
