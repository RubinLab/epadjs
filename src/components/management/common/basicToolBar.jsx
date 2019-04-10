import React from "react";
import PropTypes from "prop-types";
import { FaPlusCircle, FaRegTrashAlt } from "react-icons/fa";
import "../menuStyle.css";

const baseToolBar = ({ onAdd, onDelete, selected }) => {
  return (
    <div className="basic-toolbar">
      <div onClick={onAdd}>
        <FaPlusCircle className="tool-icon" />
      </div>
      {selected && (
        <div onClick={onDelete}>
          <FaRegTrashAlt className="tool-icon" />
        </div>
      )}
    </div>
  );
};
baseToolBar.propTypes = {
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  selected: PropTypes.bool
};
export default baseToolBar;
