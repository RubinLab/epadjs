import React from "react";
import { connect } from "react-redux";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";
const annotation = props => {
  let annName = props.aim.name.value;
  let index = annName.indexOf("~");
  annName = annName.substring(0, index);

  return (
    <div className="annotation-container" style={props.style}>
      <div className="annotation-name__container">
        <span className="annotation__name--text">{annName}</span>
      </div>
      <div className="annotation-icons__container">
        <div
          className="annotation-icon"
          onClick={props.onClick}
          data-id={props.id}
          id={props.id}
        >
          {props.displayed ? (
            <FaRegEye id={props.id} />
          ) : (
            <FaRegEyeSlash id={props.id} />
          )}
        </div>
        <div className="annotation-icon">
          <IoMdInformationCircleOutline />
        </div>
      </div>
    </div>
  );
};

export default annotation;
