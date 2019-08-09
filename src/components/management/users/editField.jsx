import React from "react";
import { FaSave } from "react-icons/fa";

const editField = props => {
  console.log("here!!!");
  return (
    <>
      <input
        onMouseDown={e => e.stopPropagation()}
        type="text"
        //   className="edit-user__modal--input"
        name={props.name}
        onChange={props.onType}
        defaultValue={props.default}
      />
      <div>
        <FaSave />
      </div>
    </>
  );
};

export default editField;
