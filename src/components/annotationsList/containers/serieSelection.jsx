import React from "react";

const serieSelection = ({ itemArr, onSelect, limit, checkList }) => {
  let itemList = [];

  itemArr.forEach((item, index) => {
    let { seriesUID } = item;
    let disabled = !checkList[index] && limit >= 6;
    let desc = item.seriesDescription || item.name;
    desc = desc ? desc : "Unnamed serie";

    itemList.push(
      <div className="serieSelection-item" key={index + seriesUID}>
        <input
          className="serieSelection-check"
          type="checkbox"
          name="item"
          data-index={index}
          onClick={onSelect}
          disabled={disabled}
        />
        <span className="serieSelection-text">{desc}</span>
      </div>
    );
  });
  return <div className="serieSelection-container">{itemList}</div>;
};

export default serieSelection;
