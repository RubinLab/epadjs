import React from "react";
import Draggable from "react-draggable";
import { FaTimes } from "react-icons/fa";

// import { studyColumns } from "./columns";

const dropDownMenu = ({ order, onChecked, studyColumns, onClose }) => {
  const button = document.getElementById("flexMenu-button");
  let { x, y } = button.getBoundingClientRect();
  y = 70 + 40;
  const options = [];
  studyColumns.forEach((item, index) => {
    let option = (
      <div key={item + " - " + index} className="--option">
        <input
          type="checkbox"
          defaultChecked={order.includes(index)}
          value={index}
          onChange={onChecked}
        />
        <span className="--text">{item}</span>
      </div>
    );
    options.push(option);
  });

  return (
    <Draggable defaultPosition={{ x, y }}>
      <div className="__dropdown">
        <div className="flexCol-close" onClick={onClose}>
          <FaTimes />
        </div>
        <div className="--options">{options}</div>
      </div>
    </Draggable>
  );
};

export default dropDownMenu;
