import React from "react";

const calculationLabel = ({ calculations }) => {
  const labels = [];
  calculations.forEach(el => {
    let desc = "";
    let val =
      el.calculationResultCollection.CalculationResult.value.value ||
      el.calculationResultCollection.CalculationResult.calculationDataCollection
        .CalculationData.value.value;
    let unit =
      el.calculationResultCollection.CalculationResult.unitOfMeasure.value;
    if (el.description.value === "Maximum") {
      desc = "Max";
      val = val.toFixed(3);
    } else if (el.description.value === "Minimum") {
      desc = "Min";
    } else if (el.description.value === "Standard Deviation") {
      desc = "StdDev";
      val = val.toFixed(2);
    } else if (el.description.value === "Length") {
      desc = el.description.value;
      val = val.toFixed(3);
    } else {
      desc = el.description.value;
    }
    let classDesc = desc + "-label";
    let element = (
      <div className="-calculation__label--el">
        <div className={classDesc}>{el.desc}:</div>
        <div className={classDesc}>{el}</div>
      </div>
    );
  });
  return <div className="annotation-calculation__label">{labels}</div>;
};

export default calculationLabel;
