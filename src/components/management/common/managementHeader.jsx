import React from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { FaTimes } from "react-icons/fa";

const managementHeader = ({ selection, onClose }) => {
  selection = selection === "Worklists" ? "Worklists Created by Me" : selection;
  return (
    <div className="mng-header">
      <div className="mng-header__title">{selection}</div>
      <div className="mng-header__close" onClick={onClose}>
        <FaTimes
          className="menu-clickable"
          onClick={onClose}
          data-tip
          data-for="close-icon"
        />
      </div>
      <ReactTooltip id="close-icon" place="left" type="info" delayShow={1500}>
        <span>Close Window</span>
      </ReactTooltip>
    </div>
  );
};

managementHeader.propTypes = {
  selection: PropTypes.string,
  onClose: PropTypes.func
};
export default managementHeader;
