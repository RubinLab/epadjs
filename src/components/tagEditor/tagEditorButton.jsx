import React from "react";

const tagEditorButton = ({ disabled, value, onClick, name }) =>
  disabled ? (
    <input
      className="tagEditForm-btn"
      onClick={onClick}
      value={value}
      name={name}
      type="button"
      disabled
    />
  ) : (
    <input
      className="tagEditForm-btn"
      onClick={onClick}
      value={value}
      name={name}
      type="button"
    />
  );

export default tagEditorButton;
