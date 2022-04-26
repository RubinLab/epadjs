import React from "react";
import {
  FaRegEye,
  FaRegEyeSlash,
  FaReply,
  FaCaretDown,
  FaCaretUp,
  FaEdit,
  FaTrashAlt
} from "react-icons/fa";
import AimEntityData from "./aimEntityData";
import CalculationLabel from "./calculationLabel";

const annotation = (props) => {
  //conditional borderstyling
  let buttonStyle = { ...props.style.button };
  let labelStyle = { ...props.style.label };
  let borderStyle = `0.15rem solid ${props.style.button.background}`;
  buttonStyle.border = borderStyle;
  labelStyle.border = borderStyle;
  const singleButtonBorder = {
    borderBottomLeftRadius: "0em",
    borderBottomRightRadius: "0em",
  };
  const singleButtonStyle = Object.assign({}, buttonStyle, singleButtonBorder);

  //getting aim details
  const hasEntityData =
    props.aim.imagingObservationEntityCollection ||
    props.aim.imagingPhysicalEntityCollection;
  const finalButtonStyle = !props.showLabel ? singleButtonStyle : buttonStyle;
  const className =
    props.id === props.openSeriesAimID
      ? "annotation-button__container --selected"
      : "annotation-button__container";

  const labelClass =
    props.id === props.openSeriesAimID
      ? "annotation-label__container --selected"
      : "annotation-label__container";
  let displayEyeIcon = false;
  if (props.aim.markupType && props.aim.markupType[0])
    displayEyeIcon = true;
  return (
    <div className="annotation-container">
      <div className={className} style={finalButtonStyle}>
        <div
          className="annotation-name__container"
          data-id={props.id}
          onClick={props.onSingleToggle}
        >
          {props.name}
        </div>
        <div
          className="annotation-icon"
          onClick={() => props.onEdit(props.id, props.serie)}
        >
          <FaEdit className="clickable-icon" />
          {/* <span class="tooltiptext">Edit annotation</span> */}
        </div>
        <div
          className="annotation-icon"
          onClick={() => props.onDelete(props.aim)}
        >
          <FaTrashAlt className="clickable-icon" />
          {/* <span class="tooltiptext">Delete annotation</span> */}
        </div>
        {displayEyeIcon && (
          <div
            className="annotation-icon"
            onClick={props.onClick}
            data-id={props.id}
            id={props.id}
          >
            {props.displayed ? (
              <FaRegEye id={props.id} className="clickable-icon" />
            ) : (
              <FaRegEyeSlash id={props.id} className="clickable-icon" />
            )}
            {/* <span class="tooltiptext">Hide/show markup</span> */}
          </div>
        )}
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
      </div>
      {props.showLabel && (
        <div className={labelClass} style={labelStyle}>
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
          <CalculationLabel
            calculations={props.label}
            name={props.name}
            markupType={props.markupType}
          />
          {/* )} */}
        </div>
      )}
    </div>
  );
};

export default annotation;
