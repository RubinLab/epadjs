import React from "react";
import "../progressView/proView.css";

const worklistSelect = ({ list, handleRoute }) => {
  const result = [];
  list.forEach(worklist => {
    console.log();

    const completeness =
      worklist.progress >= 0 ? Math.round(worklist.progress) + "%" : null;
    result.push(
      <div
        className="progress-wl"
        onClick={() => {
          handleRoute("progress", worklist.workListID);
        }}
        key={worklist.workListID}
      >
        <div className="__inner">
          <span>{worklist.name}</span>
          <span>{completeness}</span>
        </div>
        <div className="__dueDate">Due: {worklist.duedate}</div>
      </div>
    );
  });
  return result;
};

export default worklistSelect;
