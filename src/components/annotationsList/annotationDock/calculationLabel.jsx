import React from "react";

const calculationLabel = ({ calculations, name }) => {
  const labelArr = [];
  console.log(calculations);
  if (calculations) {
    for (let k = 0; k < calculations.length; k++) {
      for (let i = 0; i < calculations[k].length; i++) {
        let item = calculations[k][i];

        let classDesc = item.type + "-label";
        let val = parseFloat(item.value);
        val = isNaN(val) ? val : val.toFixed(3);

        let unit = item.type === "Length" ? item.unit : null;

        let type =
          item.type === "Standard Deviation"
            ? "Std Dev"
            : item.type === "Maximum"
            ? "Max"
            : item.type === "Minimum"
            ? "Min"
            : item.type;
        labelArr.push(
          <div className="-calculation__label--el" key={k + i + item.type}>
            <div className={classDesc}>{`${type}: `}</div>
            <div className={classDesc}>
              {val}
              {unit}
            </div>
          </div>
        );
      }
    }
  }

  return <div className="annotation-calculation__label">{labelArr}</div>;
};

export default calculationLabel;
