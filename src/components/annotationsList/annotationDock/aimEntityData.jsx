import React from 'react';

const aimEntityData = ({ aimData, id }) => {
  let observationEnt = aimData.imagingObservationEntityCollection
    ? aimData.imagingObservationEntityCollection.ImagingObservationEntity
    : null;
  let physicalEnt = aimData.imagingPhysicalEntityCollection
    ? aimData.imagingPhysicalEntityCollection.ImagingPhysicalEntity
    : null;
  let dataArr = [];
  if (observationEnt) {
    dataArr = Array.isArray(observationEnt)
      ? dataArr.concat(observationEnt)
      : dataArr.concat([observationEnt]);
    let characteristic =
      observationEnt[0].imagingObservationCharacteristicCollection;

    if (characteristic) {
      dataArr = Array.isArray(characteristic.ImagingObservationCharacteristic)
        ? dataArr.concat(characteristic.ImagingObservationCharacteristic)
        : dataArr.concat([characteristic.ImagingObservationCharacteristic]);
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
      <li className="aimEntity-item" key={id + 'ind-' + i}>
        <span className="aimEntity-question">{comment.label.value}:</span>
        <span className="aimEntity-answer">
          {comment.typeCode[0]['iso:displayName'].value}
        </span>
      </li>
    );
  });
  return <div className="aimEntity-list">{listArr}</div>;
};

export default aimEntityData;
