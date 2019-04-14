import React from "react";

const aimEntityData = ({ aimData }) => {
  let observationEnt =
    aimData.imagingObservationEntityCollection.ImagingObservationEntity;
  let physicalEnt =
    aimData.imagingPhysicalEntityCollection.ImagingPhysicalEntity;
  console.log(aimData);

  let dataArr = [];
  if (observationEnt) {
    dataArr = Array.isArray(observationEnt)
      ? dataArr.concat(observationEnt)
      : dataArr.concat([observationEnt]);
  }
  if (physicalEnt) {
    dataArr = Array.isArray(physicalEnt)
      ? dataArr.concat(physicalEnt)
      : dataArr.concat([physicalEnt]);
  }
  console.log("aimdata", dataArr);
  const listArr = [];
  dataArr.forEach((comment, i) => {
    listArr.push(
      <li
        className="aimEntity-item"
        key={aimData.uniqueIdentifier.root + "ind-" + i}
      >
        <span className="aimEntity-question">{comment.label.value}: </span>
        <span className="aimEntity-answer">
          {comment.typeCode["iso:displayName"].value}
        </span>
      </li>
    );
  });
  return <div className="aimEntity-list">{listArr}</div>;
};

export default aimEntityData;
