import React from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";
import AimEntityData from "./aimEntityData";

const annotation = props => {
  let annName = props.aim.name.value;
  let index = annName.indexOf("~");
  annName = annName.substring(0, index);
  let buttonStyle = { ...props.style.button };
  let labelStyle = { ...props.style.label };
  let borderStyle = `0.15rem solid ${props.style.button.background}`;
  // buttonStyle.border = borderStyle;
  // labelStyle.border = borderStyle;
  const hasEntityData =
    props.aim.magingObservationEntityCollection ||
    props.aim.imagingPhysicalEntityCollection;

  return (
    <div className="annotation-container">
      <div className="annotation-button__container" style={buttonStyle}>
        <div className="annotation-name__container">
          <span className="annotation__name--text">{annName}</span>
        </div>
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
      </div>
      {/* if label is hidden and there is no entity data dont show the part below
          change button style here to have bottom edges to be rounded
      */}
      <div className="annotation-label__container" style={labelStyle}>
        <div className="annotation-aimData" />
        {hasEntityData && <AimEntityData aimData={props.aim} />}
        <div className="annotation-calculation">
          {" "}
          <span>length</span> <span>mean</span> <span>max</span>
        </div>
      </div>
    </div>
  );
};

export default annotation;
