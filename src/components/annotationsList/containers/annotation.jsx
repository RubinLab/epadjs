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
      <div className="annotation-container__name">
        <span className="annotation-container__name--text">{annName}</span>
      </div>
      <div className="annotation-container-icons">
        <div className="-container-icon">
          <FaRegEye />
        </div>
        <div className="-container-icon">
          <IoMdInformationCircleOutline />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort,
    aimList: state.annotationsListReducer.aimList
  };
};
export default connect(mapStateToProps)(annotation);
