import React from 'react';
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

export default managementHeader;
