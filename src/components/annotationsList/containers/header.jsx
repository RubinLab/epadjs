import React from "react";
import { FaTimes } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";
import "../annotationsList.css";

const header = props => {
  return (
    <div className="annList-header">
      <h5 className="annList-title">Patient: {props.name}</h5>
      <div className="annList-close" onClick={props.onClick}>
        <div>
          <IoMdCloseCircleOutline />
        </div>
      </div>
    </div>
  );
};

export default header;
