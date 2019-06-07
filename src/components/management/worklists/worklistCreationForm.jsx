import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import "../menuStyle.css";

<<<<<<< HEAD
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
    // console.log(user);
=======
const worklistCreationForm = ({ users, onCancel, onSubmit, onType, error }) => {
  const options = [];
  let index = 0;
  for (let user of users) {
>>>>>>> temp
    options.push(
      <option key={`${index}-${user.username}`} value={user.username}>
        {user.displayname}
      </option>
    );
    index++;
  }

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
<<<<<<< HEAD
            onChange={onChange}
=======
            onChange={onType}
>>>>>>> temp
            id="form-first-element"
          />
          <h5 className="add-worklist__modal--label">ID*</h5>
          <input
            onMouseDown={e => e.stopPropagation()}
            className="add-worklist__modal--input"
            name="id"
            type="text"
<<<<<<< HEAD
            onChange={onChange}
=======
            onChange={onType}
>>>>>>> temp
          />
          <h6 className="form-exp">
            One word only, no special characters, '_' is OK
          </h6>
          <h5 className="add-worklist__modal--label">User*</h5>

<<<<<<< HEAD
          <select
            className="add-worklist__modal--select"
            name="user"
            onChange={onChange}
            defaultValue="default"
          >
            {options}
          </select>
=======
          <select className="add-worklist__modal--select">{options}</select>
>>>>>>> temp
          <h5 className="add-worklist__modal--label">Description</h5>
          <textarea
            onMouseDown={e => e.stopPropagation()}
            className="add-worklist__modal--input"
            name="description"
<<<<<<< HEAD
            onChange={onChange}
          />
          <h5 className="form-exp required">*Required</h5>
          {error ? <div className="err-message">{error}</div> : null}
=======
            onChange={onType}
          />
          <h5 className="form-exp required">*Required</h5>
          {error && <div className="err-message">{error}</div>}
>>>>>>> temp
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
<<<<<<< HEAD
// }
=======
>>>>>>> temp

worklistCreationForm.propTypes = {
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
<<<<<<< HEAD
  onChange: PropTypes.func,
=======
  onType: PropTypes.func,
>>>>>>> temp
  error: PropTypes.string
};

export default worklistCreationForm;
