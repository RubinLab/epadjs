import React from "react";

const updatePasswordForm = ({ onSubmit, onType, error }) => {
  return (
    <form className="update-profile__modal--form">
      <h5 className="update-profile__modal--label">Old Password*</h5>
      <input
        onMouseDown={e => e.stopPropagation()}
        className="update-profile__modal--input"
        name="oldPassord"
        type="password"
        data-form="pw"
        onChange={onType}
      />
      <h5 className="update-profile__modal--label">New Password*</h5>
      <input
        onMouseDown={e => e.stopPropagation()}
        className="update-profile__modal--input"
        name="newPassword"
        type="password"
        data-form="pw"
        onChange={onType}
      />
      <h5 className="update-profile__modal--label">Confirm New Password*</h5>
      <input
        onMouseDown={e => e.stopPropagation()}
        className="update-profile__modal--input"
        name="confirmPassword"
        type="password"
        data-form="pw"
        onChange={onType}
      />
      <button
        className="update-profile__modal--input"
        onClick={onSubmit}
        data-form="pw"
      >
        Submit
      </button>
      <h5 className="form-exp required">*Required</h5>
      {error && <div className="err-message">{error}</div>}
    </form>
  );
};

export default updatePasswordForm;
