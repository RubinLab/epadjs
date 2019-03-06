import React from 'react';
import { FaPlusCircle, FaRegTrashAlt } from 'react-icons/fa';
import './menuStyle.css';

const baseToolBar = ({ onAdd, onDelete }) => {
  return (
    <div className="base-toolbar">
      <FaPlusCircle className="tool-icon" onClick={onAdd} />
      <FaRegTrashAlt className="tool-icon" onClick={onDelete} />
    </div> 
  );
}

export default baseToolBar;