import React from "react";

const selectionItem = ({ desc, onChange, index, disabled, isChecked }) => {
  return (
    <div className="selectionItem">
      <input
        className="selectionItem-check"
        type="checkbox"
        name="item"
        data-index={index}
        checked={isChecked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="selectionItem-text">{desc}</span>
    </div>
  );
};

export default selectionItem;
