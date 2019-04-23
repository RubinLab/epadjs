import React from "react";

const serieSelection = ({ itemArr, onSelect, limit, checkList }) => {
  let itemList = [];

  itemArr.forEach((item, index) => {
    let { seriesUID } = item;
    let disabled = !checkList[index] && limit >= 6;
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
        <span className="serieSelection-text">
          {item.seriesDescription || item.name}
        </span>
      </div>
    );
  });
  return <div className="serieSelection-container">{itemList}</div>;
};

export default serieSelection;
