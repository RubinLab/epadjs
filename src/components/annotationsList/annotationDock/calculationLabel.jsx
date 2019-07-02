import React from "react";

const calculationLabel = ({ calculations, name, shape }) => {
  const labels = [];
  const longAxisLabels = [];
  const shortAxisLabels = [];
  let i = 0;
  for (let el of calculations) {
    const labelType =
      el.calculationResultCollection.CalculationResult[0].dimensionCollection
        .Dimension[0].label;
    let desc = "";
    let upperLevel = el.calculationResultCollection.CalculationResult[0].value;
    let val = upperLevel
      ? upperLevel.value
      : el.calculationResultCollection.CalculationResult[0]
          .calculationDataCollection.CalculationData[0].value.value;
    let unit =
      el.calculationResultCollection.CalculationResult[0].unitOfMeasure.value;
    const { value } = el.description;
    if (value === "Maximum") {
      desc = "Max";
      unit = null;
    } else if (value === "Minimum") {
      desc = "Min";
      unit = null;
    } else if (value === "Standard Deviation") {
      desc = "StdDev";
      val = parseFloat(val);
      val = isNaN(val) ? val : val.toFixed(3);
      unit = null;
    } else if (
      value === "Length" ||
      value === "LongAxis" ||
      value === "ShortAxis"
    ) {
      desc = "Length";
      val = parseFloat(val);
      val = isNaN(val) ? val : val.toFixed(3);
    } else if (value === "Mean") {
      desc = value;
      unit = null;
      val = parseFloat(val);
      val = isNaN(val) ? val : val.toFixed(2);
    } else if (value === "Volume") {
      desc = value;
      val = parseFloat(val);
      val = isNaN(val) ? val : val.toFixed(3);
    }

    let classDesc = desc + "-label";
    let measurement = (
      <div className="-calculation__label--el" key={i + desc}>
        <div className={classDesc}>{`${desc}: `}</div>
        <div className={classDesc}>
          {val}
          {unit}
        </div>
      </div>
    );
    i++;

    if (labelType.value.toLowerCase().includes("long")) {
      longAxisLabels.push(measurement);
    } else if (labelType.value.toLowerCase().includes("short")) {
      shortAxisLabels.push(measurement);
    } else {
      labels.push(measurement);
    }
  }
  //   });
  return (
    <div className="annotation-calculation__label">
      {labels.length > 0 && (
        <div className="-calculation__label--list">{labels}</div>
      )}
      {shortAxisLabels.length > 0 && (
        <>
          <div className="-calculation__label--title">Short Axis</div>
          <div className="-calculation__label--list">{shortAxisLabels}</div>
        </>
      )}
      {longAxisLabels.length > 0 && (
        <>
          <div className="-calculation__label--title">Long Axis</div>
          <div className="-calculation__label--list">{longAxisLabels}</div>
        </>
      )}
    </div>
  );
};

export default calculationLabel;
