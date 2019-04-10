import React from "react";
import PropTypes from "prop-types";
import { FaTimes } from "react-icons/fa";

const managementHeader = ({ selection, onClose }) => {
  return (
    <div className="mng-header">
      <div className="mng-header__title">{selection}</div>
      <div className="mng-header__close" onClick={onClose}>
        <FaTimes className="menu-clickable" />
      </div>
    </div>
  );
};

managementHeader.propTypes = {
  selection: PropTypes.string,
  onClose: PropTypes.func
};
export default managementHeader;
