import React from "react";

const selectionItem = ({ desc, onChange, index, disabled, isChecked, isSignificant }) => {
  let className;
  isSignificant ? className = "selectionItem-text significant-series" : "selectionItem-text"
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
      <span className={className}>{desc}</span>
    </div>
  );
};

export default selectionItem;
