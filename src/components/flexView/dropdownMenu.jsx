import React from "react";
import Draggable from "react-draggable";

// import { studyColumns } from "./columns";

const dropDownMenu = ({ order, onChecked, studyColumns }) => {
  const button = document.getElementById("flexMenu-button");
  const { x, y } = button.getBoundingClientRect();

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
        <span className="--text">{item.Header}</span>
      </div>
    );
    options.push(option);
  });

  return (
    <Draggable defaultPosition={{ x, y }}>
      <div className="__dropdown">{options}</div>
    </Draggable>
  );
};

export default dropDownMenu;
