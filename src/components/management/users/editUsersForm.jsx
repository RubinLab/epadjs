import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import "../menuStyle.css";

const userEditingForm = ({ onCancel, onSubmit, onType, error, userToEdit }) => {
  console.log(userToEdit);
  return (
    <Modal.Dialog dialogClassName="edit-user__modal">
      <Modal.Header>
        <Modal.Title>Edit user</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form className="edit-user__modal--form">
          <div className="edit-user__modal--cont">
            <h5 className="edit-user__modal--label">First</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="edit-user__modal--input"
              name="firstname"
              onChange={onType}
              id="form-first-element"
              defaultValue={userToEdit.firstname}
            />
          </div>
          <div className="edit-user__modal--cont">
            <h5 className="edit-user__modal--label">Last</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="edit-user__modal--input"
              name="lastname"
              onChange={onType}
              defaultValue={userToEdit.lastname}
            />{" "}
          </div>
          <div className="edit-user__modal--cont">
            <h5 className="edit-user__modal--label">Email</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="edit-user__modal--input"
              name="email"
              onChange={onType}
              defaultValue={userToEdit.email}
            />{" "}
          </div>
          <div className="edit-user__modal--cont">
            <h5 className="edit-user__modal--label">Password</h5>
            <input
              onMouseDown={e => e.stopPropagation()}
              className="edit-user__modal--input"
              name="password"
              onChange={onType}
              // defaultValue={userToEdit.email}
            />
          </div>
          {userToEdit.admin && (
            <>
              <div className="edit-user__modal--cont">
                <h5 className="edit-user__modal--label">Color</h5>
                <input
                  onMouseDown={e => e.stopPropagation()}
                  className="edit-user__modal--input"
                  name="colorpreference"
                  onChange={onType}
                  defaultValue={`#${userToEdit.colorpreference}`}
                  style={{ background: `#${userToEdit.colorpreference}` }}
                />{" "}
              </div>
              <div className="edit-user__modal--cont">
                <h5 className="edit-user__modal--label">Projects</h5>
              </div>
              <div className="edit-user__modal--cont">
                <h5 className="edit-user__modal--label">Permissions</h5>
              </div>
              <div className="edit-user__modal--cont">
                <h5 className="edit-user__modal--label">Admin</h5>
              </div>
              <div className="edit-user__modal--cont">
                <h5 className="edit-user__modal--label">Enabled</h5>
              </div>
            </>
          )}
          {error && (
            <div className="err-message project-edit__error">{error}</div>
          )}
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

export default userEditingForm;
