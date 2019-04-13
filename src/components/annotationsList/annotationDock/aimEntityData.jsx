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
  dataArr.forEach(comment => {
    listArr.push(
      <li className="aimEntity-item">
        <span className="aimEntity-question">{comment.label.value}: </span>
        <span className="aimEntity-answer">
          {comment.typeCode["iso:displayName"].value}
        </span>
      </li>
    );
  });
  return (
    <>
      <div className="aimEntity-list">{listArr}</div>
      <div className="annotation-labelData">
        <span className="annotation-lessionName">Lession 1</span>
        <span className="annotation-userName">Me </span>
      </div>
    </>
  );
};

export default aimEntityData;
