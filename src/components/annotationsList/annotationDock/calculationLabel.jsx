import React from "react";

const calculationLabel = ({ calculations, name }) => {
  const labelArr = [];
  if (calculations) {
    calculations = Object.values(calculations);
    for (let k = 0; k < calculations.length; k++) {
      labelArr.push(
        <div key={k + "markupType"} className="-calculation__label--title ">
          {calculations[k].markupType}
        </div>
      );
      let calcArr = calculations[k].calculations;
      for (let i = 0; i < calcArr.length; i++) {
        let classDesc = calcArr[i].type + "-label";
        let val = parseFloat(calcArr[i].value);
        val = isNaN(val) ? val : val.toFixed(3);

        let unit =
          calcArr[i].type === "Length" && !isNaN(val) ? calcArr[i].unit : null;

        let type =
          calcArr[i].type === "Standard Deviation"
            ? "Std Dev"
            : calcArr[i].type === "Maximum"
              ? "Max"
              : calcArr[i].type === "Minimum"
                ? "Min"
                : calcArr[i].type;
        labelArr.push(
          <li key={k + i + calcArr[i].type}>
            <b>{`${type}`}:</b> {val}{unit}
          </li>
        );
      }
    }
  }
  return labelArr;
};

export default calculationLabel;
