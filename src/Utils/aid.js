/**
 * For creating DICOM uids
 * Taken from dcmjs MetaDictionary
 * https://github.com/dcmjs-org/dcmjs/blob/master/src/DicomMetaDictionary.js#L5
 */

export function styleEightDigitDate(rawDate) {
  if (rawDate.length !== 8) {
    return rawDate;
  }
  const year = rawDate.substring(0, 4);
  const month = rawDate.substring(4, 6);
  const day = rawDate.substring(6);
  return `${month}/${day}/${year}`;
}

export function generateUid() {
  let uid = '2.25.' + Math.floor(1 + Math.random() * 9);
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

export function arrayToMap(arrayObj) {
  const tempmap = new Map();
  arrayObj.forEach(temp => {
    tempmap.set(temp, temp);
  });
  return tempmap;
}

export function isEmpty(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

// from http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
const makeRandomString = length => {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

const pad = (num, size) => {
  var s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
};

// https://github.com/cornerstonejs/dicomParser/blob/master/examples/simpleDeIdentify/index.html
export const makeDeIdentifiedValue = (length, vr) => {
  if (vr === 'LO' || vr === 'SH' || vr === 'PN') {
    if (!length) length = 8;
    return makeRandomString(length);
  } else if (vr === 'DA') {
    var now = new Date();
    return (
      now.getYear() + 1900 + pad(now.getMonth() + 1, 2) + pad(now.getDate(), 2)
    );
  } else if (vr === 'TM') {
    var now = new Date();
    return (
      pad(now.getHours(), 2) +
      pad(now.getMinutes(), 2) +
      pad(now.getSeconds(), 2)
    );
  } else if (vr === 'UI') {
    return newUID();
  }
  console.log('unknown VR:' + vr);
};

const newUID = () => {
  //dcmjs
  //uid=DicomMetaDictionary.uid();
  //static uid() method from https://raw.githubusercontent.com/pieper/dcmjs/3fd2dbaa0e487db05cb48b1cc26a480ca5b1146a/src/DicomMetaDictionary.js
  let uid = '2.25.' + Math.floor(1 + Math.random() * 9);
  for (let index = 0; index < 38; index++) {
    uid = uid + Math.floor(Math.random() * 10);
  }
  return uid;
};

export const clearCarets = string => {
  if (string) {
    for (let i = 0; i < string.length; i++) {
      string = string.replace('^', ' ');
    }
    return string;
  }
};

export const extractTreeData = (datasets, requirements) => {
  const result = {};
  if (datasets) {
    datasets.forEach(data => {
      const { PatientID, StudyInstanceUID, SeriesInstanceUID } = data;
      const patient = result[PatientID];
      if (patient) {
        const study = patient.studies[StudyInstanceUID];
        if (study) {
          const series = study.series[SeriesInstanceUID];
          if (series) {
            series.imageCount += 1;
            const missingTags = checkMissingTags(data, requirements);
            if (missingTags.length > 0 && !series.tagRequired) {
              series.tagRequired = missingTags;
              series.data = data;
            }
          } else {
            result[PatientID].studies[StudyInstanceUID].series[
              SeriesInstanceUID
            ] = createSeries(data, requirements);
          }
        } else {
          result[PatientID].studies[StudyInstanceUID] = createStudy(
            data,
            requirements
          );
        }
      } else {
        result[PatientID] = createPatient(data, requirements);
      }
    });
    // this.setState({ treeData: result });
    return result;
  }
};

// extractTreeData
const createSeries = (data, requirements) => {
  const {
    SeriesInstanceUID,
    SeriesDescription,
    PatientID,
    StudyInstanceUID
  } = data;
  const result = {
    SeriesInstanceUID,
    SeriesDescription: clearCarets(SeriesDescription),
    PatientID,
    StudyInstanceUID,
    imageCount: 1
  };
  const missingTags = checkMissingTags(data, requirements);
  if (missingTags.length > 0) {
    result.tagRequired = missingTags;
    result.data = data;
  }
  return result;
};

const createStudy = (data, requirements) => {
  const {
    StudyInstanceUID,
    StudyDescription,
    SeriesInstanceUID,
    SeriesDescription,
    PatientID
  } = data;
  const result = {
    StudyInstanceUID,
    StudyDescription: clearCarets(StudyDescription),
    series: {
      [SeriesInstanceUID]: {
        SeriesInstanceUID,
        SeriesDescription: clearCarets(SeriesDescription),
        PatientID,
        StudyInstanceUID,
        imageCount: 1
      }
    }
  };
  const series = result.series[SeriesInstanceUID];
  const missingTags = checkMissingTags(data, requirements);
  if (missingTags.length > 0) {
    series.tagRequired = missingTags;
    series.data = data;
  }
  return result;
};

const createPatient = (data, requirements) => {
  const {
    PatientID,
    PatientName,
    StudyInstanceUID,
    StudyDescription,
    SeriesInstanceUID,
    SeriesDescription
  } = data;

  const result = {
    PatientID,
    PatientName: clearCarets(PatientName),
    studies: {
      [StudyInstanceUID]: {
        StudyInstanceUID,
        StudyDescription: clearCarets(StudyDescription),
        series: {
          [SeriesInstanceUID]: {
            SeriesInstanceUID,
            SeriesDescription: clearCarets(SeriesDescription),
            PatientID,
            StudyInstanceUID,
            imageCount: 1
          }
        }
      }
    }
  };
  const series = result.studies[StudyInstanceUID].series[SeriesInstanceUID];
  const missingTags = checkMissingTags(data, requirements);
  if (missingTags.length > 0) {
    series.tagRequired = missingTags;
    series.data = data;
  }
  return result;
};

export const extractTableData = (dataset, requirementsObj) => {
  const result = [];
  const isDataArray = Array.isArray(dataset);
  if (isDataArray) {
    dataset.forEach(el => {
      const {
        PatientID,
        PatientName,
        StudyInstanceUID,
        StudyDescription,
        SeriesInstanceUID,
        SeriesDescription
      } = el;
      const missingTags = checkMissingTags(el, requirementsObj);
      result.push({
        PatientID,
        PatientName: clearCarets(PatientName),
        StudyInstanceUID,
        StudyDescription: clearCarets(StudyDescription),
        SeriesInstanceUID,
        SeriesDescription: clearCarets(SeriesDescription),
        missingTags,
        data: el
      });
    });
  }
  return result;
};

const checkMissingTags = (dataset, requirementsObj) => {
  const missingTags = [];
  const requirements = Object.keys(requirementsObj);
  requirements.forEach(req => {
    const tag = req.substring(0, req.length - 2);
    if (!dataset[tag]) {
      missingTags.push(tag);
    }
  });
  return missingTags;
};

export const checkIfSeriesOpen = (array, selectedUID, UIDlevel) => {
  let isOpen = false;
  let index;
  array.forEach((port, i) => {
    if (port[UIDlevel] === selectedUID) {
      isOpen = true;
      index = i;
    }
  });
  return { isOpen, index };
};

