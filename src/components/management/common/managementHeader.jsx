import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { FaTimes } from 'react-icons/fa';

const managementHeader = ({ selection, onClose }) => {
  return (
    <div className="mng-header">
      <div className="mng-header__title">{selection}</div>
      <div className="mng-header__close">
        <FaTimes
          className="menu-clickable"
          onClick={onClose}
          data-tip
          data-for="close-icon"
        />
        <ReactTooltip id="close-icon" place="left" type="info" delayShow={1500}>
          <span>Close Window</span>
        </ReactTooltip>
      </div>
    </div>
  );
};

managementHeader.propTypes = {
  selection: PropTypes.string,
  onClose: PropTypes.func
};
export default managementHeader;
