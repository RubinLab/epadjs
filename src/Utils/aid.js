/**
 * For creating DICOM uids
 * Taken from dcmjs MetaDictionary
 * https://github.com/dcmjs-org/dcmjs/blob/master/src/DicomMetaDictionary.js#L5
 */
export function generateUid() {
  let uid = "2.25." + Math.floor(1 + Math.random() * 9);
  for (let index = 0; index < 38; index++) {
    uid = uid + Math.floor(Math.random() * 10);
  }
  return uid;
}

export function persistExpandView(expanded, data, newData, id) {
  const expandMap = {};
  let counter = 0;
  newData.forEach((el, i) => {
    if (counter < data.length) {
      if (el[id] === data[counter][id]) {
        expandMap[i] = expanded[counter];
        counter += 1;
      } else {
        expandMap[i] = false;
      }
    }
  });
  return expandMap;
}
