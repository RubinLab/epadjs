import React from "react";
import PropTypes from "prop-types";
import {
  FaDownload,
  FaUpload,
  FaShareSquare,
  FaLocationArrow,
  FaRegTrashAlt,
  FaFilter,
  FaUndo,
} from "react-icons/fa";
import ReactTooltip from "react-tooltip";
import "../menuStyle.css";
const mode = sessionStorage.getItem("mode");

const toolBar = props => {
  const {
    onDelete,
    onDownload,
    onUpload,
    onSelect,
    onType,
    onClear,
    onFilter,
    onKeyDown,
  } = props;
  const { selected, projects } = props;

  const firstOption = (
    <option key="default" value="all_aims">
      All Annotations
    </option>
  );
  const options = [firstOption];
  for (let project of projects) {
    options.push(
      <option key={project.id} value={project.id}>
        {project.name}
      </option>
    );
  }

  let name = React.createRef();
  let subject = React.createRef();
  let template = React.createRef();
  let createdStart = React.createRef();
  let createdEnd = React.createRef();

  function clearFilters() {
    name.current.value = "";
    subject.current.value = "";
    template.current.value = "";
    createdStart.current.value = "";
    createdEnd.current.value = "";
  }

  return (
    <div className="annotations-toolbar">
      <div className="annotations-toolbar-basic" align="left">
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
            <span className="filter-label">Upload files</span>
          </ReactTooltip>
        </>
        <>
          <div onClick={onDownload}>
            <FaDownload
              className="tool-icon"
              data-tip
              data-for="download-icon"
            />
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

        {mode !== "lite" && (
          <select
            className="annotations-projectSelect"
            name="project"
            onChange={onSelect}
            defaultValue="default"
          >
            {options}
          </select>
        )}
      </div>
      <div className="filter-group">
        <div className="filter-group__sec1">
          <div className="filter-container">
            <span className="filter-label">Name:</span>
            <input
              onMouseDown={e => e.stopPropagation()}
              onChange={onType}
              type="text"
              className="filter-text"
              name="name"
              ref={name}
              onKeyDown={onKeyDown}
            />
          </div>
          <div className="filter-container">
            <span className="filter-label">Subject:</span>
            <input
              onMouseDown={e => e.stopPropagation()}
              onChange={onType}
              type="text"
              className="filter-text"
              name="patientName"
              ref={subject}
              onKeyDown={onKeyDown}
            />
          </div>
          <div className="filter-container">
            <span className="filter-label">Template:</span>
            <input
              onMouseDown={e => e.stopPropagation()}
              onChange={onType}
              type="text"
              className="filter-text"
              name="template"
              ref={template}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>
        <div className="filter-group__sec2">
          <div className="filter-container nowrap">
            <span className="filter-label">Created:</span>
            <input
              onMouseDown={e => e.stopPropagation()}
              onChange={onType}
              type="text"
              className="filter-text"
              name="createdStart"
              ref={createdStart}
              onKeyDown={onKeyDown}
            />
            <span className="filter-space">{" - "}</span>
            <input
              onMouseDown={e => e.stopPropagation()}
              onChange={onType}
              type="text"
              className="filter-text"
              name="createdEnd"
              ref={createdEnd}
              onKeyDown={onKeyDown}
            />
          </div>
          <div className="filter-icons">
            <div>
              <div className="annotation-toolbar__icon" onClick={onFilter}>
                <FaFilter
                  className="tool-icon"
                  data-tip
                  data-for="filter-icon"
                />
              </div>
              <ReactTooltip
                id="filter-icon"
                place="left"
                type="info"
                delayShow={1500}
              >
                <span className="filter-label">Filter annotations</span>
              </ReactTooltip>
            </div>
            <div>
              <div
                className="annotation-toolbar__icon"
                onClick={() => {
                  clearFilters();
                  onClear();
                }}
              >
                <FaUndo className="tool-icon" data-tip data-for="undo-icon" />
              </div>
              <ReactTooltip
                id="undo-icon"
                place="left"
                type="info"
                delayShow={1500}
              >
                <span className="filter-label">Clear filter</span>
              </ReactTooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

toolBar.propTypes = {
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  selected: PropTypes.bool,
};
export default toolBar;
