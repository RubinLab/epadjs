import React from "react";
import { FaTimes } from "react-icons/fa";
import "../annotationsList.css";

const header = ({ name, onClick }) => {
  return (
    <div className="annList-header">
      <h5 className="annList-title">Patient: {name}</h5>
      <div className="annList-close" onClick={onClick}>
        <div>
          <FaTimes />
        </div>
      </div>
    </div>
  );
};

export default header;
