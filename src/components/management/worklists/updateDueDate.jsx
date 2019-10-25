import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import UserList from "./userList";
import AssgineeDeletetionWarning from "./assigneeDeletionWarning";
import "../menuStyle.css";

const updateDueDate = props => {
  let today;
  console.log(props);
  if (!props.dueDate) {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    today = `${year}-${month + 1}-${day}`;
  }
  const defaultDate = props.dueDate || today;
  return (
    <Modal.Dialog dialogClassName="updateDueDate__modal">
      <Modal.Header>
        <Modal.Title>Update Due Date</Modal.Title>
      </Modal.Header>
      <Modal.Body className="updateDueDate__mbody">
        <input
          type="date"
          name="duedate"
          onChange={props.onChange}
          defaultValue={defaultDate}
        />
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <div className="updateDueDate__modal--buttons">
          <button
            className="updateDueDate__modal--button"
            variant="secondary"
            onClick={props.onSubmit}
          >
            Submit
          </button>
          <button
            className="edit-permission__modal--button"
            variant="secondary"
            onClick={props.onCancel}
          >
            Cancel
          </button>
        </div>
      </Modal.Footer>
    </Modal.Dialog>
  );
};

updateDueDate.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  error: PropTypes.string
};

export default updateDueDate;
