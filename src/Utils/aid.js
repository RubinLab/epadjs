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

export function isEmpty(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

// from http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
const makeRandomString = length => {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

const pad = (num, size) => {
  var s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
};

// https://github.com/cornerstonejs/dicomParser/blob/master/examples/simpleDeIdentify/index.html
export const makeDeIdentifiedValue = (length, vr) => {
  if (vr === "LO" || vr === "SH" || vr === "PN") {
    if (!length) length = 8;
    return makeRandomString(length);
  } else if (vr === "DA") {
    var now = new Date();
    return (
      now.getYear() + 1900 + pad(now.getMonth() + 1, 2) + pad(now.getDate(), 2)
    );
  } else if (vr === "TM") {
    var now = new Date();
    return (
      pad(now.getHours(), 2) +
      pad(now.getMinutes(), 2) +
      pad(now.getSeconds(), 2)
    );
  } else if (vr === "UI") {
    return newUID();
  }
  console.log("unknown VR:" + vr);
};

const newUID = () => {
  //dcmjs
  //uid=DicomMetaDictionary.uid();
  //static uid() method from https://raw.githubusercontent.com/pieper/dcmjs/3fd2dbaa0e487db05cb48b1cc26a480ca5b1146a/src/DicomMetaDictionary.js
  let uid = "2.25." + Math.floor(1 + Math.random() * 9);
  for (let index = 0; index < 38; index++) {
    uid = uid + Math.floor(Math.random() * 10);
  }
  return uid;
};
