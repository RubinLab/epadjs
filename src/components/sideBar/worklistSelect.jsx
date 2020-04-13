import React from "react";
import "../progressView/proView.css";

const worklistSelect = ({ list, handleRoute, selected, type }) => {
  const result = [];
  list.forEach(worklist => {
    const { workListID } = worklist;
    const className =
      selected === workListID && type === "progress"
        ? "progress-wl __selected"
        : "progress-wl";
    const completeness =
      worklist.progress >= 0 ? Math.round(worklist.progress) + "%" : null;
    result.push(
      <div
        className={className}
        onClick={() => {
          handleRoute("progress", worklist.workListID);
        }}
        key={worklist.workListID}
      >
        <div className="__inner">
          <span>{worklist.name}</span>
          {/* <span>{completeness}</span> */}
        </div>
        <div className="__dueDate">Due: {worklist.duedate}</div>
      </div>
    );
  });
  return result;
};

export default worklistSelect;
