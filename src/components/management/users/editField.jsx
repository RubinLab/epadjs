import React from "react";

const editField = props => {
  return (
    <>
      <input
        onMouseDown={e => e.stopPropagation()}
        type="text"
        className="--commentField"
        //   className="edit-user__modal--input"
        style={{ color: "black" }}
        name={props.name}
        onChange={props.onType}
        defaultValue={props.default}
        autoFocus
      />
    </>
  );
};

export default editField;
