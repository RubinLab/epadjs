import React from "react";
import {
  FaRegEye,
  FaRegEyeSlash,
  FaInfoCircle,
  FaCaretDown,
  FaCaretUp
} from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";
import AimEntityData from "./aimEntityData";

const annotation = props => {
  let annName = props.aim.name.value;
  let index = annName.indexOf("~");
  annName = annName.substring(0, index);
  let buttonStyle = { ...props.style.button };
  let labelStyle = { ...props.style.label };
  let borderStyle = `0.15rem solid ${props.style.button.background}`;
  buttonStyle.border = borderStyle;
  labelStyle.border = borderStyle;
  const singleButtonBorder = {
    borderBottomLeftRadius: "1em",
    borderBottomRightRadius: "1em"
  };
  const singleButtonStyle = Object.assign({}, buttonStyle, singleButtonBorder);
  const hasEntityData =
    props.aim.magingObservationEntityCollection ||
    props.aim.imagingPhysicalEntityCollection;
  const finalButtonStyle =
    !hasEntityData && !props.showLabel ? singleButtonStyle : buttonStyle;

  return (
    <div className="annotation-container">
      <div className="annotation-button__container" style={finalButtonStyle}>
        <div
          className="annotation-icon showLabel"
          data-id={props.id}
          onClick={props.onSingleToggle}
        >
          {props.showLabel ? <FaCaretUp /> : <FaCaretDown />}
        </div>
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
      {(hasEntityData || props.showLabel) && (
        <div className="annotation-label__container" style={labelStyle}>
          <div className="annotation-aimData">
            {hasEntityData && <AimEntityData aimData={props.aim} />}
          </div>

          {props.showLabel && (
            <div className="annotation-calculation">
              {" "}
              <div className="annotation__userName">user: {props.user}</div>
              <div className="annotation-calculation__label">
                <div>length: </div>
                <div>mean:</div>
                <div className="-calculation__labelIn">
                  <span>min: </span>
                  <span className="-calculation__labelIn--max">max: </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default annotation;
