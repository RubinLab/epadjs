import React, { useState } from "react";
import {
  FaCaretDown,
  FaCaretUp,
} from "react-icons/fa";
import Button from 'react-bootstrap/Button';
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import AimEntityData from "./aimEntityData";
import CalculationLabel from "./calculationLabel";

const annotation = (props) => {
  const mode = sessionStorage.getItem("mode");
  const [showMore, setShowMore] = useState(false);
  //conditional borderstyling
  let buttonStyle = { ...props.style.button };
  let labelStyle = { ...props.style.label };
  // let borderStyle = `0.15rem solid ${props.style.button.background}`;
  // buttonStyle.border = borderStyle;
  // labelStyle.border = borderStyle;
  // const singleButtonBorder = {
  //   borderBottomLeftRadius: "0em",
  //   borderBottomRightRadius: "0em",
  // };
  const singleButtonStyle = Object.assign({}, buttonStyle);

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
  let displayEyeIcon = true;
  if (props.aim.markupType && props.aim.markupType[0])
    displayEyeIcon = true;

  let comment = props.aim.comment.value;
  let narrative = comment.split("~~")[1];
  const narrativeExists = narrative && narrative !== "";
  const isShortNarrative = narrativeExists && narrative.length < 200;

  const content = isShortNarrative || showMore ? narrative : `${narrative?.substring(0, 180)}...`;
  const linkElement = (<Button style={{'padding': '0px', 'marginLeft': '2rem'}} variant="link" onClick={() => setShowMore(!showMore)}>{showMore ? 'show less' : 'show more'}</Button>);
  const narrativeElement = (<li key={"narrative"}>
    <b>Narrative:</b> {content} {isShortNarrative ? '' : linkElement}
  </li>)

  return (
    <>
      {/* <div className={className} style={finalButtonStyle}> */}
      <div
        className="annotation-header" style={finalButtonStyle}
        data-id={props.id}
      >
        {props.name}
        <div className="annotation-icon" style={{ float: 'right' }}>
          <span onClick={() => props.onEdit(props.id, props.serie)}><FiEdit className="clickable-icon" /></span>
          {/* <span class="tooltiptext">Edit annotation</span> */}
          <span onClick={() => props.onDelete(props.aim)} ><RiDeleteBin6Line className="clickable-icon" /></span>
          {displayEyeIcon && props.displayed && (
            <span id={props.id} onClick={props.onClick}><AiOutlineEye id={props.id} className="clickable-icon" /></span>
          )}
          {displayEyeIcon && !props.displayed && (
            <span id={props.id} onClick={props.onClick}><AiOutlineEyeInvisible id={props.id} className="clickable-icon" /></span>
          )}
          {/* <span class="tooltiptext">Hide/show markup</span> */}

          {props.showLabel ? (
            <span data-id={props.id} onClick={props.onSingleToggle}><FaCaretUp className="clickable-icon" /></span>
          ) : (
            <span data-id={props.id} onClick={props.onSingleToggle}><FaCaretDown className="clickable-icon" /></span>
          )}
        </div>
      </div>
      {/* </div> */}
      {props.showLabel && (
        <div className={'annotation-back'} style={labelStyle}>
          <div className="annotation-text">
            {props.user} - {props.aim.typeCode[0].code}
            <ul>

              {hasEntityData && (
                <AimEntityData aimData={props.aim} id={props.id} />
              )}
              {/* {calculations.length > 0 && calculations.length <= 10 && ( */}
              <CalculationLabel
                calculations={props.label}
                name={props.name}
                markupType={props.markupType}
              />
              {/* )} */}

              {mode === "teaching" && narrativeElement}
            </ul>




          </div>
        </div>
      )}
    </>
  );
};

export default annotation;
