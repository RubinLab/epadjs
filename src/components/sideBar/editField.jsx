import React from "react";
import PropTypes from "prop-types";

const editField = props => {
  return (
    <input
      onMouseDown={e => e.stopPropagation()}
      type="text"
      className="--commentField"
      className="edit-user__modal--input"
      name={props.name}
      onChange={props.onType}
      defaultValue={props.default}
      autoFocus
    />
  );
};

editField.propTypes = {
  name: PropTypes.string,
  onType: PropTypes.func,
  default: PropTypes.string
};

export default editField;
