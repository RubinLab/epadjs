import React from 'react';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';

const managementHeader = ({ selection, onClose }) => {
  return (
    <div className="mng-header">
      <div className="mng-header__title">{selection}</div>
      <div className="mng-header__close">
        <FaTimes className="menu-clickable" onClick={onClose} />
      </div>
    </div>
  );
};

managementHeader.propTypes = {
  selection: PropTypes.string,
  onClose: PropTypes.func
};
export default managementHeader;
