import React from "react";
import { Modal, Button } from "react-bootstrap";
import ListItem from "./common/listItem";
import "./infoMenu.css";

class Notifications extends React.Component {
  render = () => {
    const { onOK, list, title } = this.props;
    return (
      // <Modal.Dialog dialogClassName="response__modal">
      <Modal id="modal-fix" show={true} >
        <Modal.Header className="modal-header">
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="response__mbody notification-modal" >
          {!list.length
            ? `There is not any ${title.toLowerCase()} yet`
            : list.map((item, index) => (
              <ListItem item={item} key={item.time + index} />
            ))}
        </Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button className={"modal-button"} variant="secondary" size="sm" onClick={() => onOK(true)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
}

export default Notifications;
