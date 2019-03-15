import React from 'react';
import PropTypes from 'prop-types';
import { FaPlusCircle, FaRegTrashAlt } from 'react-icons/fa';
import '../menuStyle.css';

const baseToolBar = ({ onAdd, onDelete, selected }) => {
  return (
    <div className="basic-toolbar">
      <FaPlusCircle className="tool-icon" onClick={onAdd} />
      {selected && <FaRegTrashAlt className="tool-icon" onClick={onDelete} />}
    </div>
  );
};
baseToolBar.propTypes = {
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
  selected: PropTypes.bool
};
export default baseToolBar;
