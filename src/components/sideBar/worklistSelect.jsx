import React from "react";
import "../progressView/proView.css";

const worklistSelect = ({ list, handleRoute, selected, type }) => {
  const result = [];
  list.forEach(({ workListID, progress, name, duedate }) => {
    const isSelected = (selected === workListID && type === "progress");
    const completeness = progress >= 0 ? Math.round(progress) + "%" : null;
    result.push(
      <div className="progress-text"
        style={{ cursor: 'pointer' }} onClick={() => {
          handleRoute("progress", workListID);
        }}
        key={workListID}>
        <ul style={{ listStyle: 'none' }}><li><b>{name}</b></li></ul>
        Due: {duedate}
      </div>
    );
  });
  return <div className="progress-expanded">{result}</div>;
};

export default worklistSelect;
