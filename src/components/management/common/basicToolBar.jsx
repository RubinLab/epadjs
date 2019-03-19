import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { FaPlusCircle, FaRegTrashAlt } from 'react-icons/fa';
import '../menuStyle.css';

const baseToolBar = ({ onAdd, onDelete, selected }) => {
  return (
    <div className="basic-toolbar">
      <FaPlusCircle
        data-tip="New Project"
        className="tool-icon"
        data-tip
        data-for="plus-icon"
        onClick={onAdd}
      />
      <ReactTooltip id="plus-icon" place="right" type="info" delayShow={1500}>
        <span>New Project</span>
      </ReactTooltip>
      {selected && (
        <>
          <FaRegTrashAlt
            className="tool-icon"
            onClick={onDelete}
            data-tip
            data-for="trash-icon"
          />
          <ReactTooltip
            id="trash-icon"
            place="right"
            type="info"
            delayShow={1500}
          >
            <span>Delete selections</span>
          </ReactTooltip>
        </>
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
