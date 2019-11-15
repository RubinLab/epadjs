import React from "react";
import PropTypes from "prop-types";

const formButton = ({ text, onClick, disabled }) => {
  return disabled ? (
    <button className="user-create__button" onClick={onClick} disabled>
      {text}
    </button>
  ) : (
    <button className="user-create__button" onClick={onClick}>
      {text}
    </button>
  );
};

formButton.propTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func
};

export default formButton;
