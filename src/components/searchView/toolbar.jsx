import React from "react";
import { FaEye, FaDownload } from "react-icons/fa";

const toolBar = props => {
  return (
    <div className="searchView-toolbar">
      <div className="searchView-toolbar__icon" onClick={props.onView}>
        <div>
          <FaEye style={{ fontSize: "1.2rem" }} />
        </div>
      </div>
      <div className="searchView-toolbar__icon" onClick={props.onDownload}>
        <div>
          <FaDownload style={{ fontSize: "1.2rem" }} />
        </div>
      </div>
    </div>
  );
};

export default toolBar;
