import React from "react";

const aimEntityData = ({ aimData }) => {
  console.log(aimData);
  let observationEnt =
    aimData.imagingObservationEntityCollection.ImagingObservationEntity;
  let physicalEnt =
    aimData.imagingPhysicalEntityCollection.ImagingPhysicalEntity;
  let dataArr = [];
  if (observationEnt) {
    dataArr = Array.isArray(observationEnt)
      ? dataArr.concat(observationEnt)
      : dataArr.concat([observationEnt]);
    let chracteristic =
      observationEnt.imagingObservationCharacteristicCollection;
    if (chracteristic) {
      dataArr = Array.isArray(chracteristic.ImagingObservationCharacteristic)
        ? dataArr.concat(chracteristic.ImagingObservationCharacteristic)
        : dataArr.concat([chracteristic.ImagingObservationCharacteristic]);
    }
  }
  if (physicalEnt) {
    dataArr = Array.isArray(physicalEnt)
      ? dataArr.concat(physicalEnt)
      : dataArr.concat([physicalEnt]);
  }
  const listArr = [];
  dataArr.forEach((comment, i) => {
    listArr.push(
      <li
        className="aimEntity-item"
        key={aimData.uniqueIdentifier.root + "ind-" + i}
      >
        <span className="aimEntity-question">{comment.label.value}:</span>
        <span className="aimEntity-answer">
          {comment.typeCode["iso:displayName"].value}
        </span>
      </li>
    );
  });
  return <div className="aimEntity-list">{listArr}</div>;
};

export default aimEntityData;
