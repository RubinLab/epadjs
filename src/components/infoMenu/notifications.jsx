import React from "react";
import { Modal } from "react-bootstrap";
import Draggable from "react-draggable";
import { FaTimes } from "react-icons/fa";
import ListItem from "./common/listItem";

class Notifications extends React.Component {
  render = () => {
    const { onOK, list, title } = this.props;
    return (
      // <Modal.Dialog dialogClassName="response__modal">
      <Modal.Dialog id="modal-fix" className="notifications">
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="response__mbody">
          {!list.length
            ? `There is not any ${title.toLowerCase()} yet`
            : list.map((item, index) => (
                <ListItem item={item} key={item.time + index} />
              ))}
        </Modal.Body>
        <Modal.Footer className="modal-footer__buttons">
          <button variant="secondary" onClick={() => onOK(true)}>
            OK
          </button>
        </Modal.Footer>
      </Modal.Dialog>
    );
  };
}

export default Notifications;
