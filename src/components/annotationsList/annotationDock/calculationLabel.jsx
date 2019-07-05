import React from "react";

const calculationLabel = ({ calculations, name }) => {
  const labelArr = [];

  if (calculations) {
    for (let i = 0; i < calculations.length; i++) {
      let item = calculations[i];

      let classDesc = item.type + "-label";
      let val = parseFloat(item.value);
      val = isNaN(val) ? val : val.toFixed(3);

      let unit = item.type === "Length" ? item.unit : null;

      labelArr.push(
        <div className="-calculation__label--el" key={i + item.type}>
          <div className={classDesc}>{`${item.type}: `}</div>
          <div className={classDesc}>
            {val}
            {unit}
          </div>
        </div>
      );
    }
  }

  return <div className="annotation-calculation__label">{labelArr}</div>;
};

export default calculationLabel;
