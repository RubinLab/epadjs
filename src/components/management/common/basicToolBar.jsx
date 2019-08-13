import React from "react";
import PropTypes from "prop-types";
import { FaPlusCircle, FaRegTrashAlt } from "react-icons/fa";
import ReactTooltip from "react-tooltip";

import "../menuStyle.css";

const baseToolBar = ({ onAdd, onDelete, selected }) => {
  return (
    <div className="basic-toolbar">
      <div onClick={onAdd} className="tool-icon">
        <FaPlusCircle
          data-tip="New Project"
          data-tip
          data-for="plus-icon"
          onClick={onAdd}
        />
      </div>
      <ReactTooltip id="plus-icon" place="right" type="info" delayShow={1500}>
        <span>Add new</span>
      </ReactTooltip>
      <div
        onClick={onDelete}
        className={selected ? "tool-icon" : "hide-delete "}
      >
        <FaRegTrashAlt
          className="tool-icon"
          onClick={onDelete}
          data-tip
          data-for="trash-icon"
        />
      </div>
      <ReactTooltip id="trash-icon" place="right" type="info" delayShow={1500}>
        <span>Delete selections</span>
      </ReactTooltip>
    </div>
  );
};
baseToolBar.propTypes = {
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  selected: PropTypes.bool
};
export default baseToolBar;
