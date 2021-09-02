import React from "react";

const selectionItem = ({ desc, onSelect, index, disabled, preSelected }) => {
  return (
    <div className="selectionItem">
      <input
        className="selectionItem-check"
        type="checkbox"
        name="item"
        data-index={index}
        checked={preSelected}
        onClick={onSelect}
        disabled={disabled}
      />
      <span className="selectionItem-text">{desc}</span>
    </div>
  );
};

export default selectionItem;
