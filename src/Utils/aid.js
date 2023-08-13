import { commonLabels } from "../components/annotationsList/types";
import { DISP_MODALITIES } from "../constants";
/**
 * For creating DICOM uids
 * Taken from dcmjs MetaDictionary
 * https://github.com/dcmjs-org/dcmjs/blob/master/src/DicomMetaDictionary.js#L5
 */

export const findSelectedCheckboxes = () => {
  let checkboxes = document.getElementsByClassName('__search-checkbox');
  checkboxes = Array.from(checkboxes);
  const selected = checkboxes.filter(el => el.checked).map(el => el.id);
  return selected;
}

const handleSelectDeselectAll = (checked) => {
  let checkboxes = document.getElementsByClassName('__search-checkbox');
  checkboxes = Array.from(checkboxes);
  checkboxes.forEach(el => el.checked = checked);
}

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

export function arrayToMap(arrayObj) {
  const tempmap = new Map();
  arrayObj.forEach((temp) => {
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
const makeRandomString = (length) => {
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

export const clearCarets = (string) => {
  if (string) {
    for (let i = 0; i < string.length; i++) {
      string = string.replace("^", " ");
    }
    return string;
  }
};

export const extractTreeData = (datasets, requirements) => {
  const result = {};
  if (datasets) {
    datasets.forEach((data) => {
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
  const { SeriesInstanceUID, SeriesDescription, PatientID, StudyInstanceUID } =
    data;
  const result = {
    SeriesInstanceUID,
    SeriesDescription: clearCarets(SeriesDescription),
    PatientID,
    StudyInstanceUID,
    imageCount: 1,
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
    PatientID,
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
        imageCount: 1,
      },
    },
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
    SeriesDescription,
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
            imageCount: 1,
          },
        },
      },
    },
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
    dataset.forEach((el) => {
      const {
        PatientID,
        PatientName,
        StudyInstanceUID,
        StudyDescription,
        SeriesInstanceUID,
        SeriesDescription,
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
        data: el,
      });
    });
  }
  return result;
};

const checkMissingTags = (dataset, requirementsObj) => {
  const missingTags = [];
  const requirements = Object.keys(requirementsObj);
  requirements.forEach((req) => {
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

export const convertDateFormat = (str, attr) => {
  try {
    let result = "";
    const dateArr = [];
    dateArr.push(str.substring(0, 4));
    dateArr.push(str.substring(4, 6));
    dateArr.push(str.substring(6, 8));
    if (attr === "date") {
      const timeArr = [];
      timeArr.push(str.substring(8, 10));
      timeArr.push(str.substring(10, 12));
      timeArr.push(str.substring(12));
      result = dateArr.join("-") + " " + timeArr.join(":");
    }
    if (attr === "studyDate") {
      result = dateArr.join("-") + " 00:00:00";
    }
    return result ? result : str;
  } catch (err) {
    console.error(err);
    return str;
  }
};

export const persistColorInSaveAim = (oldList, newList, colors) => {
  const newDataKeys = Object.keys(newList);
  const newDataValues = Object.values(newList);
  const stateKeys = Object.keys(oldList);
  const stateValues = Object.values(oldList);
  const colorAimsList = {};
  const usedColors = new Set();

  // transfer the colors of existing aim
  stateKeys.forEach((el, i) => {
    const index = newDataKeys.indexOf(el);
    if (index >= 0) {
      newDataValues[index].color = stateValues[i].color;
      colorAimsList[el] = newDataValues[index];
      const color = stateValues[i].color.button.background;
      if (color !== "#aaaaaa" || color !== "#c0c0c0") {
        if (usedColors.size === colors.length) {
          usedColors.clear();
        }
        usedColors.add(color);
      }
      newDataKeys.splice(index, 1);
      newDataValues.splice(index, 1);
    }
  });

  // assign colors to new aim
  newDataKeys.forEach((el, i) => {
    let color;
    let colorIndex = usedColors.size;
    if (colorIndex === colors.length) {
      colorIndex = 0;
      usedColors.clear();
    } else {
      colorIndex = usedColors.size;
    }
    const { imgAimUID, markupColor } = newDataValues[i];
    if (imgAimUID) {
      if (markupColor) {
        color = {
          button: { background: "#aaaaaa", color: "black" },
          label: { background: markupColor, color: "white" },
        };
      } else {
        color = colors[colorIndex];
        usedColors.add(color?.button?.background);
      }
    } else {
      color = commonLabels;
    }

    newDataValues[i].color = color;
    colorAimsList[el] = newDataValues[i];
  });
  return colorAimsList;
};

export const persistColorInDeleteAim = (oldList, newList, colorList) => {
  const colorAimsList = {};

  const newDataKeys = Object.keys(newList);
  const newDataValues = Object.values(newList);

  const stateKeys = Object.keys(oldList);
  const stateValues = Object.values(oldList);

  newDataKeys.forEach((el, i) => {
    const index = stateKeys.indexOf(el);
    if (index >= 0) {
      newDataValues[i].color = stateValues[index].color;
      colorAimsList[el] = newDataValues[i];
    }
  });

  return colorAimsList;
};

export const isSupportedModality = (serie) => {
  // To be on the safe side do not filter
  if (!serie.examType) return true;
  return DISP_MODALITIES.includes(serie.examType);
};

export const getAllowedTermsOfTemplateComponent = (template, componentLabel) => {
  const {Component:components} = template[0];
  let allowedTerms;
  let termMeanings = [];
  for(let i=0; i<components.length; i++){
    if(components[i].label === componentLabel){
      allowedTerms = components[i].AllowedTerm;
      break;
    } 
  }
  if(!allowedTerms)
    return [];
  allowedTerms.forEach(term => {
    termMeanings.push(term.codeMeaning);
  })
  return termMeanings;
}