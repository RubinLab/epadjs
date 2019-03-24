import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
  LOAD_ANNOTATIONS_ERROR,
  VIEWPORT_FULL_ERROR
} from "./types";
import { getSeries } from "../../services/seriesServices";
import { getStudies } from "../../services/studyServices";

// TODO
// study selection logic will be changed according to remaining available viewport
// test cases 1- select a project check if all series are selected
// test cases 2- select a serie

export const loadAnnotations = () => {
  return {
    type: LOAD_ANNOTATIONS
  };
};

export const annotationsLoaded = data => {
  return {
    type: LOAD_ANNOTATIONS_SUCCESS,
    data
  };
};

export const annotationsLoadingError = error => {
  return {
    type: LOAD_ANNOTATIONS_ERROR,
    error
  };
};

export const viewPortFullError = error => {
  return {
    type: VIEWPORT_FULL_ERROR,
    error
  };
};

const getFields = (arr, type, selectedID, allSelected) => {
  let result = [];
  arr.forEach(element => {
    let obj =
      type === "study"
        ? {
            id: element.studyUID,
            desc: element.studyDescription
          }
        : {
            id: element.seriesUID,
            desc: element.seriesDescription
          };
    selectedID === obj.id || allSelected
      ? (obj["isDisplayed"] = true)
      : (obj["isDisplayed"] = false);
    result.push(obj);
  });
  return result;
};
//tek bir patien getiriyor ama o patientin altindaki butun studyleri getiriyor

// in the client check the length of the viewports

// getAnnotationListDataFromSeries(seri, viewPortArray.length, study) - on serie level
export const getAnnotationListData = (viewport, serie, study) => {
  return async (dispatch, getState) => {
    // create and object with patient details
    dispatch(loadAnnotations());
    const { projectID, patientID, patientName } = serie || study;
    let displayData = {};
    displayData[patientID] = {
      id: patientID,
      name: patientName,
      studies: []
    };
    // make call to get study and populate the studies array
    try {
      console.log("here", displayData);
      const {
        data: {
          ResultSet: { Result: studies }
        }
      } = await getStudies(projectID, patientID);
      // then fill the object with studies add isDisplayed flag set to false
      displayData[patientID]["studies"] = getFields(studies, "study");
      console.log("display data", displayData);
    } catch (error) {
      dispatch(annotationsLoadingError(error.response));
    }
    // make the call to get series
    displayData[patientID]["studies"].forEach(async element => {
      console.log(element);
      try {
        const {
          data: {
            ResultSet: { Result: series }
          }
        } = await getSeries(projectID, patientID, element.id);
        //if study is clicked set its flag true and all series under it needs to be true
        if (study && study.studyUID === element.id) {
          element.isDisplayed = true;
          element["series"] = getFields(series, "serie", null, true);
        } else {
          element["series"] = getFields(series, "serie");
        }
        console.log("display data wirh series", displayData);
      } catch (error) {
        dispatch(annotationsLoadingError(error.response));
      }
    });
  };
};

//set only the selected series isDisplayed as true
// await
// make the to get all the annotations filled the correct seriesisDisplayed all true

// export const getAnnotations = seri => {
//   return (dispatch, getState) => {
//     dispatch(loadAnnotations());
//     const seriesData = getSeriesByID(seri);
//     return seriesData
//       .then(response => {
//         console.log("inpromise", response.data);
//         dispatch(annotationsLoaded(response.data));
//       })
//       .catch(err => dispatch(annotationsLoadingError(err.response)));
//   };
// };
