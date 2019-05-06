import React from "react";
import { FaEye, FaDownload } from "react-icons/fa";

const toolBar = props => {
  console.log(props);
  return (
    <div className="searchView-toolbar">
      <div className="searchView-toolbar__icon">
        <div>
          <FaEye />
        </div>
      </div>
      <div className="searchView-toolbar__icon" onClick={props.onDownload}>
        <div>
          <FaDownload />
        </div>
      </div>
    </div>
  );
};

export default toolBar;
