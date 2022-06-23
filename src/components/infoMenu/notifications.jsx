import React from "react";
import { Modal } from "react-bootstrap";
import ListItem from "./common/listItem";

class Notifications extends React.Component {
  render = () => {
    const { onOK, list, title } = this.props;
    return (
      // <Modal.Dialog dialogClassName="response__modal">
      <Modal show={true} centered={true}>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="response__mbody" >
          {!list.length
            ? `There is not any ${title.toLowerCase()} yet`
            : list.map((item, index) => (
              <ListItem item={item} key={item.time + index} />
            ))}
        </Modal.Body>
        <Modal.Footer>
          <button variant="secondary" onClick={() => onOK(true)}>
            OK
          </button>
        </Modal.Footer>
      </Modal>
    );
  };
}

export default Notifications;
