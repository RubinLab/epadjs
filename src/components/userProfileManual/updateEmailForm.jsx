import React from "react";

const updateEmailForm = ({ onSubmit, onType, error }) => {
  return (
    <form className="update-profile__modal--form">
      <h5 className="update-profile__modal--label">New Email*</h5>
      <input
        onMouseDown={e => e.stopPropagation()}
        className="update-profile__modal--input"
        name="newEmail"
        type="text"
        data-form="email"
        onChange={onType}
      />
      <button
        className="update-profile__modal--input"
        onClick={onSubmit}
        data-form="email"
      >
        Submit
      </button>
      <h5 className="form-exp required">*Required</h5>
      {error && <div className="err-message">{error}</div>}
    </form>
  );
};

export default updateEmailForm;
