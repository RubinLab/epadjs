import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
  LOAD_ANNOTATIONS_ERROR,
  VIEWPORT_FULL_PROJECTS,
  UPDATE_ANNOTATION,
  TOGGLE_ALL_ANNOTATIONS,
  TOGGLE_ALL_LABELS,
  CHANGE_ACTIVE_PORT,
  LOAD_SERIE_SUCCESS,
  SHOW_ANNOTATION_WINDOW,
  SHOW_ANNOTATION_DOCK,
  colors
} from "./types";

import { getSeries } from "../../services/seriesServices";
import { getStudies } from "../../services/studyServices";
import {
  getAnnotations,
  getAnnotationsJSON
} from "../../services/annotationServices";

export const showAnnotationWindow = () => {
  return { type: SHOW_ANNOTATION_WINDOW };
};

export const showAnnotationDock = () => {
  return { type: SHOW_ANNOTATION_DOCK };
};
const loadAnnotations = () => {
  return {
    type: LOAD_ANNOTATIONS
  };
};

const annotationsLoaded = (summaryData, aimsData, serID, patID, ref) => {
  return {
    type: LOAD_ANNOTATIONS_SUCCESS,
    payload: { summaryData, aimsData, serID, patID, ref }
  };
};

const annotationsLoadingError = error => {
  return {
    type: LOAD_ANNOTATIONS_ERROR
  };
};

export const viewPortFull = () => {
  return {
    type: VIEWPORT_FULL_PROJECTS
  };
};

export const updateAnnotation = (
  serie,
  study,
  patient,
  annotation,
  isDisplayed
) => {
  return {
    type: UPDATE_ANNOTATION,
    payload: { serie, study, patient, annotation, isDisplayed }
  };
};

export const toggleAllAnnotations = (
  patientID,
  studyID,
  serieID,
  displayStatus
) => {
  return {
    type: TOGGLE_ALL_ANNOTATIONS,
    payload: { patientID, studyID, serieID, displayStatus }
  };
};

export const toggleAllLabels = (
  ptLabelID,
  stLabelID,
  srLabelID,
  labelDisplay
) => {
  return {
    type: TOGGLE_ALL_LABELS,
    payload: { ptLabelID, stLabelID, srLabelID, labelDisplay }
  };
};

export const changeActivePort = portIndex => {
  return {
    type: CHANGE_ACTIVE_PORT,
    portIndex
  };
};

export const singleSerieLoaded = (ref, aimsData, serID, ann) => {
  return {
    type: LOAD_SERIE_SUCCESS,
    payload: { ref, aimsData, serID, ann }
  };
};

const getAimListFields = (aims, ann) => {
  if (!Array.isArray(aims)) aims = [aims];
  const result = {};

  aims.forEach((aim, index) => {
    if (index >= colors.length) {
      index = index % colors.length;
    }
    let displayStatus = ann ? ann === aim.uniqueIdentifier.root : !ann;
    result[aim.uniqueIdentifier.root] = {
      json: aim,
      isDisplayed: displayStatus,
      showLabel: displayStatus,
      cornerStoneTools: [],
      color: { ...colors[index] }
    };
  });
  return result;
};

const getRequiredFields = (arr, type, selectedID) => {
  let result = {};
  if (arr) {
    arr.forEach(element => {
      let obj;
      if (type === "study") {
        const { studyUID, studyDescription } = element;
        obj = { studyUID, studyDescription };
        result[studyUID] = obj;
      } else if (type === "serie") {
        const {
          seriesUID,
          seriesDescription,
          studyUID,
          patientID,
          projectID
        } = element;
        // const isDisplayed = seriesUID === selectedID;
        obj = { seriesUID, seriesDescription, studyUID, patientID, projectID };
        result[seriesUID] = obj;
      } else {
        const { seriesUID, studyUID, name, aimID, comment } = element;
        const isDisplayed = seriesUID === selectedID;
        obj = {
          seriesUID,
          studyUID,
          name,
          aimID,
          comment,
          isDisplayed,
          showLabel: true
        };
        result[aimID] = obj;
      }
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
    //create an empty object to be "studies" property in the data
    //iterate over the studies array create key/value pairs
    dataObj["studies"] = getRequiredFields(studies, "study");
    return new Promise((resolve, reject) => {
      resolve(dataObj);
    });
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(
        new Error(
          `Error while getting study data ${err}`,
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
          `Error while getting series data ${err}`,
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
  console.log(
    "in annotation http call",
    projectID,
    "=",
    patientID,
    "=",
    studyID,
    "=",
    seriesID,
    "=",
    selectedID
  );
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
          `Error while getting annotations data ${err}`,
          "src/components/annotationList/action.js"
        )
      );
    });
  }
};

export const getSingleSerie = (serie, annotation) => {
  return async (dispatch, getState) => {
    dispatch(loadAnnotations());
    let aimsData = {};
    let { patientID, studyUID, seriesUID, projectID } = serie;
    let reference = {
      patientID,
      studyUID,
      seriesUID,
      aimID: annotation
    };
    try {
      const {
        data: {
          imageAnnotations: { ImageAnnotationCollection: aims }
        }
      } = await getAnnotationsJSON(projectID, patientID, studyUID, seriesUID);
      aimsData = getAimListFields(aims);
    } catch (err) {
      dispatch(annotationsLoadingError(err));
    }
    dispatch(singleSerieLoaded(reference, aimsData, seriesUID, annotation));
  };
};
// gets one patient and all the studys->series->annotations under it
export const getAnnotationListData = (serie, annotation) => {
  return async (dispatch, getState) => {
    // create an object with patient details
    dispatch(loadAnnotations());
    let { projectID, patientID, patientName, seriesUID, studyUID } = serie;
    let selectedID = serie.seriesUID;
    let summaryData = {
      // seriesUID,
      projectID,
      patientID,
      patientName
      // studyUID
    };
    let aimsData = {};
    // make call to get study and populate the studies data
    try {
      await getStudiesData(summaryData, projectID, patientID);
    } catch (error) {
      dispatch(annotationsLoadingError(error));
    }
    // make call to get series and populate studies with series data
    const studies = Object.values(summaryData["studies"]);
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
        const seriesArr = Object.values(study.series);
        seriesArr.forEach(async serie => {
          try {
            const annotations = await getAnnotationData(
              projectID,
              patientID,
              study.studyUID,
              serie.seriesUID,
              selectedID
            );
            console.log("annotations in big fuction", annotations);
            serie.annotations = annotations;
          } catch (error) {
            console.log("-------- error ------------");
            dispatch(annotationsLoadingError(error));
          }
        });
      } catch (error) {
        dispatch(annotationsLoadingError(error));
      }
    });

    const reference = {
      patientID,
      studyUID,
      seriesUID,
      aimID: annotation
    };

    try {
      const {
        data: {
          imageAnnotations: { ImageAnnotationCollection: aims }
        }
      } = await getAnnotationsJSON(projectID, patientID, studyUID, seriesUID);
      aimsData = getAimListFields(aims);
    } catch (err) {
      dispatch(annotationsLoadingError(err));
    }
    dispatch(
      annotationsLoaded(summaryData, aimsData, seriesUID, patientID, reference)
    );
  };
};
