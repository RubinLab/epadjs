import React from 'react';

const aimEntityData = ({ aimData, id }) => {
  let observationEnt = aimData.imagingObservationEntityCollection
    ? aimData.imagingObservationEntityCollection.ImagingObservationEntity
    : null;
  let physicalEnt = aimData.imagingPhysicalEntityCollection
    ? aimData.imagingPhysicalEntityCollection.ImagingPhysicalEntity
    : null;
  let dataArr = [];
  if (observationEnt && observationEnt.length) {
    dataArr = Array.isArray(observationEnt)
      ? dataArr.concat(observationEnt)
      : dataArr.concat([observationEnt]);

    observationEnt.forEach(el => {
      const characteristicCol = el.imagingObservationCharacteristicCollection;
      if (
        characteristicCol &&
        characteristicCol.ImagingObservationCharacteristic
      ) {
        const characteristics = Array.isArray(
          characteristicCol.ImagingObservationCharacteristic
        )
          ? characteristicCol.ImagingObservationCharacteristic
          : [characteristicCol.ImagingObservationCharacteristic];

        characteristics.forEach(chr => {
          dataArr.push(chr);

          if (
            chr.characteristicQuantificationCollection &&
            chr.characteristicQuantificationCollection
              .CharacteristicQuantification
          ) {
            const quanCol = chr.characteristicQuantificationCollection;
            const quantification = Array.isArray(
              quanCol.CharacteristicQuantification
            )
              ? quanCol.CharacteristicQuantification
              : [quanCol.CharacteristicQuantification];
            quantification.forEach(qt => {
              dataArr.push(qt);
            });
          }
        });
      }
    });
  }

  if (physicalEnt) {
    dataArr = Array.isArray(physicalEnt)
      ? dataArr.concat(physicalEnt)
      : dataArr.concat([physicalEnt]);
  }

  const listArr = [];
  dataArr.forEach((comment, i) => {
    const value =
      comment.typeCode && Array.isArray(comment.typeCode)
        ? comment.typeCode[0]['iso:displayName'].value
        : comment.typeCode &&
          comment.typeCode.constructor === Object &&
          comment.typeCode['iso:displayName']
          ? comment.typeCode['iso:displayName'].value
          : comment['xsi:type'] && comment['xsi:type'] === 'Scale'
            ? comment.valueLabel.value
            : '';

    listArr.push(
      <li key={i}>
        <b>{comment.label.value}:</b> {value}
      </li>
    );
  });
  return <ul>{listArr}</ul>;
};

export default aimEntityData;
