import React from "react";
import PropTypes from "prop-types";
import { FaDownload, FaUpload, FaRegTrashAlt } from "react-icons/fa";
import ReactTooltip from "react-tooltip";
import "../menuStyle.css";

const toolBar = props => {
  const { onDelete, onDownload, onUpload, onSelect } = props;
  const { selected, projects } = props;

  return (
    <div className="templates-toolbar mng-toolbar">
      <>
        <div onClick={onUpload} id="mng-upload">
          <FaUpload className="tool-icon" data-tip data-for="upload-icon" />
        </div>
        <ReactTooltip
          id="upload-icon"
          place="right"
          type="info"
          delayShow={1500}
        >
          <span className="filter-label">Upload files</span>
        </ReactTooltip>
      </>
      <>
        <div onClick={onDownload}>
          <FaDownload className="tool-icon" data-tip data-for="download-icon" />
        </div>
        <ReactTooltip
          id="download-icon"
          place="right"
          type="info"
          delayShow={1500}
        >
          <span className="filter-label">Download selections</span>
        </ReactTooltip>
      </>
      <>
        <div onClick={onDelete} className="template-toolbar__icon">
          <FaRegTrashAlt
            className="tool-icon"
            id="delete-icon"
            onClick={onDelete}
            data-tip
            data-for="trash-icon"
          />
        </div>
        <ReactTooltip
          id="trash-icon"
          place="right"
          type="info"
          delayShow={1500}
        >
          <span className="filter-label">Delete selections</span>
        </ReactTooltip>
      </>
    </div>
  );
};

toolBar.propTypes = {
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  selected: PropTypes.bool
};
export default toolBar;
