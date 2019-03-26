import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
  LOAD_ANNOTATIONS_ERROR,
  VIEWPORT_FULL_ERROR
} from "./types";
import { getSeries } from "../../services/seriesServices";
import { getStudies } from "../../services/studyServices";
import { getAnnotationsJSON } from "../../services/annotationServices";
// TODO
// study selection logic will be changed according to remaining available viewport
// test cases 1- select a project check if all series are selected
// test cases 2- select a serie
// in the client check the length of the viewports

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

const getRequiredFields = (arr, type) => {
  let result = [];
  if (arr) {
    arr.forEach(element => {
      let obj;
      if (type === "study") {
        obj = {
          studyUID: element.studyUID,
          studyDescription: element.studyDescription,
          isDisplayed: true
        };
      } else if (type === "serie") {
        obj = {
          seriesUID: element.seriesUID,
          seriesDescription: element.seriesDescription,
          isDisplayed: true
        };
      } else {
        obj = {
          annotationID:
            element.imageAnnotations.ImageAnnotation.uniqueIdentifier.root,
          isDisplayed: true,
          name: element.imageAnnotations.ImageAnnotation.name.value,
          comment: element.imageAnnotations.ImageAnnotation.comment.value,
          markupEntityCollection:
            element.imageAnnotations.ImageAnnotation.markupEntityCollection
        };
      }
      result.push(obj);
    });
  }
  return result;
};

const getStudiesData = async (dataObj, projectID, patientID) => {
  try {
    const {
      data: {
        ResultSet: { Result: studies }
      }
    } = await getStudies(projectID, patientID);
    dataObj[patientID]["studies"] = getRequiredFields(studies, "study");
    return new Promise((resolve, reject) => {
      resolve(dataObj);
    });
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(new Error("Error while getting study data ", err.response));
    });
  }
};

const getSeriesData = async (projectID, patientID, studyID) => {
  try {
    const {
      data: {
        ResultSet: { Result: series }
      }
    } = await getSeries(projectID, patientID, studyID);
    const formattedSeries = getRequiredFields(series, "serie");
    return new Promise((resolve, reject) => {
      resolve(formattedSeries);
    });
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(new Error("Error while getting series data ", err.response));
    });
  }
};

const getAnnotationData = async (projectID, patientID, studyID, seriesID) => {
  try {
    const {
      data: {
        imageAnnotations: { ImageAnnotationCollection: annotations }
      }
    } = await getAnnotationsJSON(projectID, patientID, studyID, seriesID);
    let formattedAnnotation = [];
    if (annotations) {
      formattedAnnotation.push(getRequiredFields(annotations, "annotation"));
    }
    return new Promise((resolve, reject) => {
      resolve(formattedAnnotation);
    });
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(new Error("Error while getting annotations data ", err.response));
    });
  }
};

//gets one patient and all the studys under it
// getAnnotationListDataFromSeries(seri, viewPortArray.length, study) - on serie level
export const getAnnotationListData = (viewport, serie, study) => {
  return async (dispatch, getState) => {
    // create and object with patient details
    dispatch(loadAnnotations());
    const { projectID, patientID, patientName } = serie || study;
    let displayData = {};
    displayData[patientID] = {
      projectID: projectID,
      patientID: patientID,
      patientName: patientName,
      studies: []
    };
    // make call to get study and populate the studies data
    try {
      await getStudiesData(displayData, projectID, patientID);
    } catch (error) {
      dispatch(annotationsLoadingError(error));
    }
    // make the call to get series and populate studies with series data
    const studies = displayData[patientID]["studies"];
    studies.forEach(async study => {
      let series;
      try {
        series = await getSeriesData(projectID, patientID, study.studyUID);
        study.series = series;
        //make the call to get annotations and populate series annotations data
        study.series.forEach(async serie => {
          try {
            const annotations = await getAnnotationData(
              projectID,
              patientID,
              study.studyUID,
              serie.seriesUID
            );
            serie.annotations = annotations;
          } catch (error) {
            dispatch(annotationsLoadingError(error));
          }
        });
      } catch (error) {
        dispatch(annotationsLoadingError(error));
      }
    });
    dispatch(annotationsLoaded(displayData));
  };
};
