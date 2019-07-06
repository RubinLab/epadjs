import React from "react";
import {
  FaRegEye,
  FaRegEyeSlash,
  FaReply,
  FaCaretDown,
  FaCaretUp
} from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";
import AimEntityData from "./aimEntityData";
import CalculationLabel from "./calculationLabel";

const annotation = props => {
  //conditional borderstyling
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

  //getting aim details
  const hasEntityData =
    props.aim.imagingObservationEntityCollection ||
    props.aim.imagingPhysicalEntityCollection;
  const finalButtonStyle = !props.showLabel ? singleButtonStyle : buttonStyle;

  return (
    <div className="annotation-container">
      <div className="annotation-button__container" style={finalButtonStyle}>
        <div
          className="annotation-icon showLabel"
          data-id={props.id}
          onClick={props.onSingleToggle}
        >
          {props.showLabel ? (
            <FaCaretUp className="clickable-icon" />
          ) : (
            <FaCaretDown className="clickable-icon" />
          )}
        </div>
        <div
          className="annotation-name__container"
          data-id={props.id}
          onClick={props.onSingleToggle}
        >
          {props.name}
        </div>
        <div
          className="annotation-icon"
          onClick={props.jumpToAim}
          data-id={props.id}
          data-serie={props.serie}
        >
          <FaReply className="clickable-icon" />
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
      {props.showLabel && (
        <div className="annotation-label__container" style={labelStyle}>
          <div className="annotation-label__desc">
            <div className="annotation__userName">{props.user}</div>
            <div>-</div>
            <div className="annotation__type">{props.aim.typeCode[0].code}</div>
          </div>
          {hasEntityData && (
            <div className="annotation-aimData">
              <AimEntityData aimData={props.aim} id={props.id} />
            </div>
          )}
          {/* {calculations.length > 0 && calculations.length <= 10 && ( */}
          <CalculationLabel calculations={props.label} name={props.name} />
          {/* )} */}
        </div>
      )}
    </div>
  );
};

export default annotation;
