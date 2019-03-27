import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
  LOAD_ANNOTATIONS_ERROR,
  VIEWPORT_FULL_ERROR
} from "./types";
import { getSeries } from "../../services/seriesServices";
import { getStudies } from "../../services/studyServices";
import {
  getAnnotations,
  getAnnotationsJSON
} from "../../services/annotationServices";
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

export const annotationsLoaded = (summaryData, aimsData, id) => {
  return {
    type: LOAD_ANNOTATIONS_SUCCESS,
    payload: { summaryData, aimsData, id }
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

const getAimListFields = aims => {
  const result = {};
  aims.forEach((aim, index) => {
    // console.log(index);
    result[aim.uniqueIdentifier.root] = {
      json: aim,
      isDisplayed: true,
      cornerStoneTools: []
    };
  });
  return result;
};

const getRequiredFields = (arr, type, selectedID) => {
  let result = [];
  if (arr) {
    arr.forEach(element => {
      let obj;
      if (type === "study") {
        const { studyUID, studyDescription } = element;
        obj = { studyUID, studyDescription };
      } else if (type === "serie") {
        const { seriesUID, seriesDescription } = element;
        const isDisplayed = seriesUID === selectedID;
        obj = { seriesUID, seriesDescription, isDisplayed };
      } else {
        const { seriesUID, name, aimID, comment } = element;
        const isDisplayed = seriesUID === selectedID;
        obj = { seriesUID, name, aimID, comment, isDisplayed };
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
    dataObj["studies"] = getRequiredFields(studies, "study");
    return new Promise((resolve, reject) => {
      resolve(dataObj);
    });
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(
        new Error(
          `Error while getting study data ${err.response}`,
          "src/components/annotationList/action.js"
        )
      );
    });
  }
};

const getSeriesData = async (projectID, patientID, studyID, selectedID) => {
  try {
    const {
      data: {
        ResultSet: { Result: series }
      }
    } = await getSeries(projectID, patientID, studyID);
    const formattedSeries = getRequiredFields(series, "serie", selectedID);
    return new Promise((resolve, reject) => {
      resolve(formattedSeries);
    });
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(
        new Error(
          `Error while getting series data ${err.response}`,
          "src/components/annotationList/action.js"
        )
      );
    });
  }
};

const getAnnotationData = async (
  projectID,
  patientID,
  studyID,
  seriesID,
  selectedID
) => {
  try {
    const {
      data: {
        ResultSet: { Result: annotations }
      }
    } = await getAnnotations(projectID, patientID, studyID, seriesID);
    let formattedAnnotation = [];
    if (annotations) {
      formattedAnnotation = getRequiredFields(
        annotations,
        "annotation",
        selectedID
      );
    }
    return new Promise((resolve, reject) => {
      resolve(formattedAnnotation);
    });
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(
        new Error(
          `Error while getting annotations data ${err.response}`,
          "src/components/annotationList/action.js"
        )
      );
    });
  }
};

// gets one patient and all the studys->series->annotations under it
export const getAnnotationListData = (viewport, serie, study) => {
  return async (dispatch, getState) => {
    // create an object with patient details
    dispatch(loadAnnotations());
    // console.log("serie data", serie);
    const { projectID, patientID, patientName, seriesUID, studyUID } =
      serie || study;
    const selectedID = serie.seriesUID;
    let summaryData = { seriesUID, projectID, patientID, patientName };
    let aimsData = {};
    // make call to get study and populate the studies data
    try {
      await getStudiesData(summaryData, projectID, patientID);
    } catch (error) {
      dispatch(annotationsLoadingError(error));
    }
    // make call to get series and populate studies with series data
    const studies = summaryData["studies"];
    studies.forEach(async study => {
      let series;
      try {
        series = await getSeriesData(
          projectID,
          patientID,
          study.studyUID,
          selectedID
        );
        study.series = series;
        //make call to get annotations and populate series annotations data
        study.series.forEach(async serie => {
          try {
            const annotations = await getAnnotationData(
              projectID,
              patientID,
              study.studyUID,
              serie.seriesUID,
              selectedID
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

    try {
      const {
        data: {
          imageAnnotations: { ImageAnnotationCollection: aims }
        }
      } = await getAnnotationsJSON(projectID, patientID, studyUID, seriesUID);
      // console.log("aims", aims);
      aimsData = getAimListFields(aims);
      console.log("aimsData", aimsData);
    } catch (err) {
      dispatch(annotationsLoadingError(err));
    }
    console.log("big data", aimsData);
    dispatch(annotationsLoaded(summaryData, aimsData, seriesUID));
  };
};
