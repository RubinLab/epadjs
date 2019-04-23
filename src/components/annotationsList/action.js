import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
  LOAD_ANNOTATIONS_ERROR,
  VIEWPORT_FULL,
  UPDATE_ANNOTATION,
  TOGGLE_ALL_ANNOTATIONS,
  TOGGLE_ALL_LABELS,
  TOGGLE_LABEL,
  CHANGE_ACTIVE_PORT,
  LOAD_SERIE_SUCCESS,
  SHOW_ANNOTATION_WINDOW,
  SHOW_ANNOTATION_DOCK,
  OPEN_PROJECT_MODAL,
  CLEAR_GRID,
  SELECT_SERIE,
  SELECT_STUDY,
  SELECT_ANNOTATION,
  CLEAR_SELECTION,
  GET_PATIENT,
  colors
} from "./types";

import { getSeries } from "../../services/seriesServices";
import { getStudies } from "../../services/studyServices";
import {
  getAnnotations,
  getAnnotationsJSON
} from "../../services/annotationServices";

export const clearGrid = item => {
  return { type: CLEAR_GRID };
};

export const clearSelection = () => {
  return { type: CLEAR_SELECTION };
};
export const selectStudy = selectedStudyObj => {
  const {
    studyUID,
    patientID,
    projectID,
    studyDescription,
    patientName
  } = selectedStudyObj;
  return {
    type: SELECT_STUDY,
    study: { studyUID, patientID, projectID, studyDescription, patientName }
  };
};

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

export const getPatient = patient => {
  return {
    type: GET_PATIENT,
    patient
  };
};
export const openProjectSelectionModal = () => {
  return {
    type: OPEN_PROJECT_MODAL
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

export const alertViewPortFull = () => {
  return {
    type: VIEWPORT_FULL
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

export const toggleAllLabels = (serieID, checked) => {
  return {
    type: TOGGLE_ALL_LABELS,
    payload: { serieID, checked }
  };
};

export const toggleSingleLabel = (serieID, aimID) => {
  return {
    type: TOGGLE_LABEL,
    payload: { serieID, aimID }
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

    let name = aim.imageAnnotations.ImageAnnotation.name.value;
    let ind = name.indexOf("~");
    name = name.substring(0, ind);
    let displayStatus = ann ? ann === aim.uniqueIdentifier.root : !ann;
    result[aim.uniqueIdentifier.root] = {
      name,
      json: aim,
      isDisplayed: displayStatus,
      showLabel: true,
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
        const displayAnns = seriesUID === selectedID || selectedID === studyUID;

        obj = {
          seriesUID,
          seriesDescription,
          studyUID,
          patientID,
          projectID,
          displayAnns
        };
        result[seriesUID] = obj;
      } else {
        const { seriesUID, studyUID, name, aimID, comment } = element;
        const isDisplayed = seriesUID === selectedID || selectedID === studyUID;
        obj = {
          seriesUID,
          studyUID,
          name,
          aimID,
          comment,
          isDisplayed
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
  projectId,
  subjectId,
  studyId,
  seriesId,
  selectedID
) => {
  try {
    const {
      data: {
        ResultSet: { Result: annotations }
      }
    } = await getAnnotations({ projectId, subjectId, studyId, seriesId });
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
    let { patientID, studyUID, seriesUID } = serie;
    let reference = {
      patientID,
      studyUID,
      seriesUID,
      aimID: annotation
    };
    const aimsData = await dispatch(getSingleSerieData(serie, annotation));
    dispatch(singleSerieLoaded(reference, aimsData, seriesUID, annotation));
  };
};

const getSingleSerieData = (serie, annotation) => {
  return async (dispatch, getState) => {
    dispatch(loadAnnotations());
    let aimsData = {};
    let { patientID, studyUID, seriesUID, projectID } = serie;
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
    return aimsData;
  };
};

export const getWholeData = (serie, study, annotation) => {
  return async (dispatch, getState) => {
    dispatch(loadAnnotations());
    console.log(study);
    let { projectID, patientID, patientName, studyUID } = serie || study;
    let selectedID;
    let seriesUID;
    if (serie) {
      selectedID = serie.seriesUID;
      seriesUID = serie.seriesUID;
    } else if (study) {
      selectedID = study.studyUID;
    }
    let summaryData = {
      // seriesUID,
      projectID,
      patientID,
      patientName
      // studyUID
    };
    console.log("in wholeData", summaryData);
    // make call to get study and populate the studies data
    try {
      await getStudiesData(summaryData, projectID, patientID);
    } catch (error) {
      dispatch(annotationsLoadingError(error));
    }
    // make call to get series and populate studies with series data
    const studies = Object.values(summaryData["studies"]);
    for (let st of studies) {
      // studies.forEach(async st => {
      let series;
      try {
        series = await getSeriesData(
          projectID,
          patientID,
          st.studyUID,
          selectedID
        );
        st.series = series;
        //make call to get annotations and populate series annotations data
        const seriesArr = Object.values(st.series);
        for (let serie of seriesArr) {
          // seriesArr.forEach(async serie => {
          try {
            const annotations = await getAnnotationData(
              projectID,
              patientID,
              st.studyUID,
              serie.seriesUID,
              selectedID
            );
            serie.annotations = annotations;
          } catch (error) {
            dispatch(annotationsLoadingError(error));
          }
          // });
        }
      } catch (error) {
        dispatch(annotationsLoadingError(error));
      }
      // });
    }
    return summaryData;
  };
};
// gets one patient and all the studys->series->annotations under it
export const getAnnotationListData = (serie, study, annotation) => {
  return async (dispatch, getState) => {
    let { projectID, patientID, patientName, studyUID } = serie || study;
    let selectedID;
    let seriesUID;
    if (serie) {
      selectedID = serie.seriesUID;
      seriesUID = serie.seriesUID;
    } else if (study) {
      selectedID = study.studyUID;
    }
    let summaryData = await dispatch(getWholeData(serie, study, annotation));

    let aimsData = await dispatch(
      getSingleSerieData({ projectID, patientID, studyUID, seriesUID })
    );

    const reference = {
      patientID,
      studyUID,
      seriesUID,
      aimID: annotation
    };

    dispatch(
      annotationsLoaded(summaryData, aimsData, seriesUID, patientID, reference)
    );
  };
};

/* BACK UP 

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
            serie.annotations = annotations;
          } catch (error) {
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
 */

/*

// gets one patient and all the studys->series->annotations under it
export const getAnnotationListData = (serie, study, annotation) => {
  return async (dispatch, getState) => {
    // create an object with patient details
    dispatch(loadAnnotations());
    let { projectID, patientID, patientName, studyUID } = serie || study;
    let selectedID;
    let seriesUID;
    if (serie) {
      selectedID = serie.seriesUID;
      seriesUID = serie.seriesUID;
    } else if (study) {
      selectedID = study.studyUID;
    }
    let summaryData = {
      // seriesUID,
      projectID,
      patientID,
      patientName
      // studyUID
    };
    // make call to get study and populate the studies data
    try {
      await getStudiesData(summaryData, projectID, patientID);
    } catch (error) {
      dispatch(annotationsLoadingError(error));
    }
    // make call to get series and populate studies with series data
    const studies = Object.values(summaryData["studies"]);
    studies.forEach(async st => {
      let series;
      try {
        series = await getSeriesData(
          projectID,
          patientID,
          st.studyUID,
          selectedID
        );
        st.series = series;
        console.log("series in final get big data", series);
        //make call to get annotations and populate series annotations data
        const seriesArr = Object.values(st.series);
        seriesArr.forEach(async serie => {
          try {
            const annotations = await getAnnotationData(
              projectID,
              patientID,
              st.studyUID,
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

    let aimsData = await dispatch(
      getSingleSerieData({ projectID, patientID, studyUID, seriesUID })
    );

    const reference = {
      patientID,
      studyUID,
      seriesUID,
      aimID: annotation
    };

    console.log("summ", summaryData);
    dispatch(
      annotationsLoaded(summaryData, aimsData, seriesUID, patientID, reference)
    );
  };
}; */
