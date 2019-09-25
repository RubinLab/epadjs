import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import "../menuStyle.css";

const worklistCreationForm = props => {
  const { users, onCancel, onSubmit, onChange, error } = props;

  const options = [];
  let index = 0;
  options.push(
    <option disabled value="default" key="0-default">
      -- select a user --
    </option>
  );
  for (let user of users) {
    options.push(
      <option key={`${index}-${user.username}`} value={user.username}>
        {user.lastname && user.firstname ? user.displayname : user.email}
      </option>
    );
    index++;
  }
  // let date = new Date();
  // const day = date.getDate() + "";
  // let month = date.getMonth() + 1;
  // month = month < 10 ? `0${month}` : `${month}`;
  // const year = date.getFullYear();
  // date = `${year}-${month}-${day}`;

  return (
    <Modal.Dialog dialogClassName="add-worklist__modal">
      <Modal.Header>
        <Modal.Title>New worklist</Modal.Title>
      </Modal.Header>
      <Modal.Body className="add-worklist__mbody">
        <form className="add-worklist__modal--form">
          <h5 className="add-worklist__modal--label">Name*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-worklist__modal--input"
            name="name"
            type="text"
            onChange={onChange}
            id="form-first-element"
          />
          <h5 className="add-worklist__modal--label">ID*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-worklist__modal--input"
            name="id"
            type="text"
            onChange={onChange}
          />
          <h6 className="form-exp">
            One word only, no special characters, '_' is OK
          </h6>
          <h5 className="add-worklist__modal--label">User*</h5>
          <select
            className="add-worklist__modal--select"
            name="user"
            onChange={onChange}
            defaultValue="default"
          >
            {options}
          </select>
          <h5 className="form-exp add-worklist__modal--label">Due date:</h5>
          <input type="date" name="dueDate" onChange={onChange} />
          <h5 className="add-worklist__modal--label">Description</h5>
          <textarea
            onMouseDown={e => e.stopPropagation()}
            className="add-worklist__modal--input"
            name="description"
            onChange={onChange}
          />
          <h5 className="form-exp required">*Required</h5>
          {error ? <div className="err-message">{error}</div> : null}
        </form>
      </Modal.Body>
      <Modal.Footer className="modal-footer__buttons">
        <button variant="primary" onClick={onSubmit}>
          Submit
        </button>
        <button variant="secondary" onClick={onCancel}>
          Cancel
        </button>
      </Modal.Footer>
    </Modal.Dialog>
  );
};
// }

worklistCreationForm.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  onChange: PropTypes.func,
  error: PropTypes.string
};

export default worklistCreationForm;
