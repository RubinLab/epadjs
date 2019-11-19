import React from "react";

const worklistSelect = ({ list, handleRoute }) => {
  const result = [];
  list.forEach(worklist =>
    result.push(
      <div key={worklist.workListID}>
        <p
          onClick={() => {
            handleRoute("progress", worklist.workListID);
          }}
        >
          {worklist.name}
        </p>
      </div>
    )
  );
  return result;
};

export default worklistSelect;
