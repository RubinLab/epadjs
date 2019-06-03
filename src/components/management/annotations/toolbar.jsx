import React from "react";
import PropTypes from "prop-types";
import {
  FaDownload,
  FaUpload,
  FaLayerGroup,
  FaLocationArrow,
  FaRegTrashAlt,
  FaFilter,
  FaUndo
} from "react-icons/fa";
import ReactTooltip from "react-tooltip";
import "../menuStyle.css";

const toolBar = props => {
  const { onDelete, onDownload, onUpload, onSelect, selected } = props;
  return (
    <div className="annotations-toolbar">
      <>
        <div onClick={onUpload}>
          <FaUpload className="tool-icon" data-tip data-for="upload-icon" />
        </div>
        <ReactTooltip
          id="upload-icon"
          place="right"
          type="info"
          delayShow={1500}
        >
          <span className="filter-label">Upload selections</span>
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
        <div>
          <FaLayerGroup
            className="tool-icon"
            data-tip
            data-for="applyParalel-icon"
          />
        </div>
        <ReactTooltip
          id="applyParalel-icon"
          place="right"
          type="info"
          delayShow={1500}
        >
          <span className="filter-label">Apply (parallel)</span>
        </ReactTooltip>
      </>
      <>
        <div onClick={onDelete}>
          <FaLocationArrow
            className="tool-icon"
            onClick={onDelete}
            data-tip
            data-for="applyAll-icon"
          />
        </div>
        <ReactTooltip
          id="applyAll-icon"
          place="right"
          type="info"
          delayShow={1500}
        >
          <span className="filter-label">Apply (all together)</span>
        </ReactTooltip>
      </>
      <>
        <div onClick={onDelete}>
          <FaRegTrashAlt
            className="tool-icon"
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
      <select
        className="annotations-projectSelect"
        name="project"
        onChange={onSelect}
        defaultValue="default"
      >
        {/* {options} */}
      </select>
      <div className="filter-group">
        <div className="filter-container">
          <span className="filter-label">Name:</span>
          <input type="text" className="filter-text" />
        </div>
        <div className="filter-container">
          <span className="filter-label">Subject:</span>
          <input type="text" className="filter-text" />
        </div>
        <div className="filter-container">
          <span className="filter-label">Template:</span>
          <input type="text" className="filter-text" />
        </div>
        <div className="filter-container">
          <span className="filter-label">Created:</span>
          <input type="text" className="filter-text" />
          <span>{" - "}</span>
          <input type="text" className="filter-text" />
        </div>
      </div>
      <>
        <div>
          <FaFilter className="tool-icon" data-tip data-for="filter-icon" />
        </div>
        <ReactTooltip
          id="filter-icon"
          place="right"
          type="info"
          delayShow={1500}
        >
          <span className="filter-label">Filter annotations</span>
        </ReactTooltip>
      </>
      <>
        <div>
          <FaUndo className="tool-icon" data-tip data-for="undo-icon" />
        </div>
        <ReactTooltip id="undo-icon" place="right" type="info" delayShow={1500}>
          <span className="filter-label">Clear filter</span>
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
