import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
  LOAD_ANNOTATIONS_ERROR,
  LOAD_PATIENT,
  LOAD_PATIENT_SUCCESS,
  LOAD_PATIENT_ERROR,
  VIEWPORT_FULL,
  UPDATE_ANNOTATION_DISPLAY,
  TOGGLE_ALL_ANNOTATIONS,
  TOGGLE_ALL_LABELS,
  TOGGLE_LABEL,
  CHANGE_ACTIVE_PORT,
  LOAD_SERIE_SUCCESS,
  SHOW_ANNOTATION_WINDOW,
  OPEN_PROJECT_MODAL,
  CLEAR_GRID,
  DISPLAY_SINGLE_AIM,
  JUMP_TO_AIM,
  SELECT_SERIE,
  SELECT_STUDY,
  SELECT_ANNOTATION,
  SELECT_PATIENT,
  CLEAR_SELECTION,
  GET_PATIENT,
  ADD_TO_GRID,
  LOAD_COMPLETED,
  START_LOADING,
  UPDATE_PATIENT,
  CLOSE_SERIE,
  UPDATE_IMAGEID,
  CLEAR_AIMID,
  UPDATE_PATIENT_AIM_SAVE,
  UPDATE_PATIENT_AIM_DELETE,
  GET_NOTIFICATIONS,
  CLEAR_ACTIVE_AIMID,
  UPDATE_IMAGE_INDEX,
  colors,
  commonLabels,
} from "./types";

import { getSeries } from "../../services/seriesServices";
import { getStudies, getStudyAims } from "../../services/studyServices";
import {
  getAnnotations,
  getAnnotationsJSON,
} from "../../services/annotationServices";
import { getImageIdAnnotations } from "../aimEditor/aimHelper.js";
export const clearGrid = item => {
  return { type: CLEAR_GRID };
};

export const clearActivePortAimID = () => {
  return { type: CLEAR_ACTIVE_AIMID };
};

export const clearAimId = () => {
  return {
    type: CLEAR_AIMID,
  };
};

export const updateImageIndex = imageIndex => {
  return { type: UPDATE_IMAGE_INDEX, imageIndex };
};
export const updateImageId = imageID => {
  return {
    type: UPDATE_IMAGEID,
    imageID,
  };
};

export const closeSerie = () => {
  return {
    type: CLOSE_SERIE,
  };
};

export const getNotificationsData = (uploadedPid, lastEventId) => {
  return {
    type: GET_NOTIFICATIONS,
    payload: { uploadedPid, lastEventId },
  };
};

export const updatePatient = (
  type,
  status,
  patient,
  study,
  serie,
  annotation
) => {
  return {
    type: UPDATE_PATIENT,
    payload: { type, status, patient, study, serie, annotation },
  };
};

export const updatePatientOnAimSave = aimRefs => {
  return { type: UPDATE_PATIENT_AIM_SAVE, aimRefs };
};

export const updatePatientOnAimDelete = aimRefs => {
  return { type: UPDATE_PATIENT_AIM_DELETE, aimRefs };
};

export const clearSelection = selectionType => {
  return { type: CLEAR_SELECTION, selectionType };
};

export const loadCompleted = () => {
  return { type: LOAD_COMPLETED };
};
export const startLoading = () => {
  return { type: START_LOADING };
};
export const loadPatient = () => {
  return { type: LOAD_PATIENT };
};
export const loadPatientError = err => {
  return { type: LOAD_PATIENT_ERROR, err };
};

export const loadPatientSuccess = patient => {
  return { type: LOAD_PATIENT_SUCCESS, patient };
};
export const jumpToAim = (seriesUID, aimID, index) => {
  return {
    type: JUMP_TO_AIM,
    payload: { seriesUID, aimID, index },
  };
};
export const displaySingleAim = (
  patientID,
  studyUID,
  seriesUID,
  aimID,
  index
) => {
  return {
    type: DISPLAY_SINGLE_AIM,

    payload: { patientID, studyUID, seriesUID, aimID },
  };
};

export const selectPatient = selectedPatientObj => {
   let {
    projectID,
    subjectName,
    numberOfAnnotations,
    index
  } = selectedPatientObj;
  projectID = projectID ? projectID : "lite";
  const patientID = selectedPatientObj.subjectID;
  return {
    type: SELECT_PATIENT,
    patient: { projectID, patientID, numberOfAnnotations, subjectName, index },
  };
};

export const selectStudy = selectedStudyObj => {
  let {
    studyUID,
    patientID,
    projectID,
    studyDescription,
    patientName,
    numberOfSeries,
    numberOfAnnotations,
  } = selectedStudyObj;
  projectID = projectID ? projectID : "lite";

  return {
    type: SELECT_STUDY,
    study: {
      studyUID,
      patientID,
      projectID,
      studyDescription,
      patientName,
      numberOfSeries,
      numberOfAnnotations,
    },
  };
};

export const selectSerie = (selectedSerieObj, studyDescription) => {
  const {
    seriesUID,
    studyUID,
    patientID,
    projectID,
    patientName,
    seriesDescription,
    numberOfAnnotations,
  } = selectedSerieObj;

  return {
    type: SELECT_SERIE,

    serie: {
      seriesUID,
      studyUID,
      patientID,
      projectID,
      patientName,
      seriesDescription,
      studyDescription,
      numberOfAnnotations,
    },
  };
};

export const selectAnnotation = (
  selectedAnnotationObj,
  studyDescription,
  seriesDescription
) => {
  const {
    aimID,

    seriesUID,

    studyUID,

    subjectID,

    projectID,

    patientName,

    name,
  } = selectedAnnotationObj;

  return {
    type: SELECT_ANNOTATION,

    annotation: {
      aimID,

      seriesUID,

      studyUID,

      subjectID,

      projectID,

      patientName,
      name,
      studyDescription,
      seriesDescription,
    },
  };
};

export const addToGrid = (serie, annotation) => {
  let { patientID, studyUID, seriesUID, projectID } = serie;
  projectID = projectID ? projectID : "lite";
  if (annotation)
    patientID = serie.originalSubjectID || serie.subjectID || serie.patientID;
  let reference = {
    projectID,
    patientID,
    studyUID,
    seriesUID,
    aimID: annotation,
    imageIndex: 0,
  };
  return { type: ADD_TO_GRID, reference };
};

export const showAnnotationWindow = () => {
  return { type: SHOW_ANNOTATION_WINDOW };
};

const loadAnnotations = () => {
  return {
    type: LOAD_ANNOTATIONS,
  };
};

// export const getPatient = patient => {
//   return {
//     type: GET_PATIENT,
//     patient
//   };
// };
export const openProjectSelectionModal = () => {
  return {
    type: OPEN_PROJECT_MODAL,
  };
};
const annotationsLoaded = () => {
  return {
    type: LOAD_ANNOTATIONS_SUCCESS,
  };
};

export const annotationsLoadingError = error => {
  return {
    type: LOAD_ANNOTATIONS_ERROR,
  };
};

export const alertViewPortFull = () => {
  return {
    type: VIEWPORT_FULL,
  };
};

export const updateAnnotationDisplay = (
  patient,
  study,
  serie,
  annotation,
  isDisplayed
) => {
  return {
    type: UPDATE_ANNOTATION_DISPLAY,
    payload: { patient, study, serie, annotation, isDisplayed },
  };
};

export const toggleAllAnnotations = (seriesUID, displayStatus) => {
  return {
    type: TOGGLE_ALL_ANNOTATIONS,
    payload: { seriesUID, displayStatus },
  };
};

export const toggleAllLabels = (serieID, checked) => {
  return {
    type: TOGGLE_ALL_LABELS,
    payload: { serieID, checked },
  };
};

export const toggleSingleLabel = (serieID, aimID) => {
  return {
    type: TOGGLE_LABEL,
    payload: { serieID, aimID },
  };
};

export const changeActivePort = portIndex => {
  return {
    type: CHANGE_ACTIVE_PORT,
    portIndex,
  };
};

export const singleSerieLoaded = (ref, aimsData, serID, imageData, ann) => {
  return {
    type: LOAD_SERIE_SUCCESS,
    payload: { ref, aimsData, serID, imageData, ann },
  };
};

const getAimListFields = (aims, ann) => {
  try {
    if (!Array.isArray(aims)) aims = [aims];
    const result = {};
    aims.forEach((aim, index) => {
      const studyRef =
        aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
          .imageReferenceEntityCollection.ImageReferenceEntity[0].imageStudy;
      const imgAimUID =
        studyRef.imageSeries.imageCollection.Image[0].sopInstanceUid.root;
      const serieAimUID = studyRef.imageSeries.instanceUid.root;
      const studyAimUID = studyRef.instanceUid.root;

      if (index >= colors.length) {
        index = index % colors.length;
      }

      const color = imgAimUID ? { ...colors[index] } : commonLabels;
      let type = imgAimUID
        ? "image"
        : serieAimUID && !imgAimUID
        ? "serie"
        : "study";

      let aimName =
        aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0].name
          .value;
      let ind = aimName.indexOf("~");
      if (ind >= 0) {
        aimName = aimName.substring(0, ind);
      }

      let displayStatus = ann
        ? ann === aim.ImageAnnotationCollection.uniqueIdentifier.root
        : !ann;

      const {
        name,
        comment,
        imagingObservationEntityCollection,
        imagingPhysicalEntityCollection,
        inferenceEntityCollection,
        segmentationEntityCollection,
        typeCode,
      } = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0];
      const aimFields = {
        name,
        comment,
        imagingObservationEntityCollection,
        imagingPhysicalEntityCollection,
        inferenceEntityCollection,
        segmentationEntityCollection,
        typeCode,
      };
      const user = aim.ImageAnnotationCollection.user.name.value;
      const id = aim.ImageAnnotationCollection.uniqueIdentifier.root;
      result[aim.ImageAnnotationCollection.uniqueIdentifier.root] = {
        name: aimName,
        id,
        user,
        // json1: aim,
        json: aimFields,
        isDisplayed: displayStatus,
        showLabel: false,
        cornerStoneTools: [],
        color,
        type,
      };
    });
    return result;
  } catch (err) {
    console.log("Error in parsing aim attributes", err);
  }
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
        let {
          seriesUID,
          seriesDescription,
          studyUID,
          patientID,
          projectID,
        } = element;
        projectID = projectID ? projectID : "lite";
        const isDisplayed = seriesUID === selectedID || selectedID === studyUID;

        obj = {
          seriesUID,
          seriesDescription,
          studyUID,
          patientID,
          projectID,
          isDisplayed,
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
          isDisplayed,
        };
        result[aimID] = obj;
      }
    });
  }
  return result;
};

const getStudiesData = async (dataObj, projectID, patientID, selectedID) => {
  try {
    const { data: studies } = await getStudies(projectID, patientID);
    //create an empty object to be "studies" property in the data
    //iterate over the studies array create key/value pairs
    dataObj["studies"] = getRequiredFields(studies, "study", selectedID);
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
    const { data: series } = await getSeries(projectID, patientID, studyID);
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
    const { data: annotations } = await getAnnotations({
      projectId,
      subjectId,
      studyId,
      seriesId,
    });
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
  console.log(serie);
  return async (dispatch, getState) => {
    await dispatch(loadAnnotations());
    let { patientID, studyUID, seriesUID, numberOfAnnotations } = serie;
    let reference = {
      patientID,
      studyUID,
      seriesUID,
      numberOfAnnotations,
      aimID: annotation,
    };
    const { aimsData, imageData } = await getSingleSerieData(serie, annotation);

    await dispatch(
      singleSerieLoaded(reference, aimsData, seriesUID, imageData, annotation)
    );
  };
};

export const updateSingleSerie = (serie, annotation) => {
  return async (dispatch, getState) => {
    let { patientID, studyUID, seriesUID, numberOfAnnotations } = serie;
    let reference = {
      patientID,
      studyUID,
      seriesUID,
      numberOfAnnotations,
      aimID: annotation,
    };
    const { aimsData, imageData } = await getSingleSerieData(serie, annotation);
    await dispatch(
      singleSerieLoaded(reference, aimsData, seriesUID, imageData, annotation)
    );
  };
};

const extractStudyAims = arr => {
  let studyAims = [];
  arr.forEach(aim => {
    const serieUID =
      aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
        .imageReferenceEntityCollection.ImageReferenceEntity[0].imageStudy
        .imageSeries.instanceUid.root;
    if (!serieUID) {
      studyAims.push(aim);
    }
  });
  return studyAims;
};

const getSingleSerieData = (serie, annotation) => {
  return new Promise((resolve, reject) => {
    let aimsData;
    let serieAims = [];
    let studyAims = [];
    let imageData;
    let { studyUID, seriesUID, projectID, patientID } = serie;
    projectID = projectID ? projectID : "lite";
    patientID = patientID ? patientID : serie.subjectID;
    const promises = [];

    promises.push(
      getAnnotationsJSON(projectID, patientID, studyUID, seriesUID)
    );
    console.log("1", projectID, "2", patientID, "3", studyUID, "4", seriesUID);
    promises.push(getStudyAims(patientID, studyUID, projectID));
    Promise.all(promises)
      .then(async result => {
        serieAims = result[0].data;
        studyAims = extractStudyAims(result[1].data);
        aimsData = serieAims.concat(studyAims);
        imageData = getImageIdAnnotations(serieAims);
        aimsData = getAimListFields(aimsData, annotation);
        resolve({ aimsData, imageData });
      })
      .catch(err => reject("Error while getting annotation data", err));
  });
};

export const getWholeData = (serie, study, annotation) => {
  return async (dispatch, getState) => {
    dispatch(loadPatient());
    let { projectID, patientID, patientName, studyUID } =
      serie || study || annotation;
    projectID = projectID ? projectID : "lite";

    if (annotation) patientID = annotation.subjectID;
    let selectedID;
    let seriesUID;
    if (serie) {
      selectedID = serie.seriesUID;
      seriesUID = serie.seriesUID;
    } else if (study) {
      selectedID = study.studyUID;
    } else if (annotation) {
      selectedID = annotation.seriesUID;
    }
    let summaryData = {
      projectID,
      patientID,
      patientName,
    };
    // make call to get study and populate the studies data
    try {
      study
        ? await getStudiesData(summaryData, projectID, patientID, selectedID)
        : await getStudiesData(summaryData, projectID, patientID);
    } catch (error) {
      dispatch(loadPatientError(error));
    }
    // make call to get series and populate studies with series data
    const studies = Object.values(summaryData["studies"]);
    for (let st of studies) {
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
            dispatch(loadPatientError(error));
            // dispatch(annotationsLoadingError(error));
          }
        }
      } catch (error) {
        dispatch(loadPatientError(error));
      }
    }
    // return summaryData;
    dispatch(loadPatientSuccess(summaryData));
  };
};

// gets one patient and all the studys->series->annotations under it
// export const getAnnotationListData = (serie, study, annotation) => {
//   return async (dispatch, getState) => {
//     let { projectID, patientID, patientName, studyUID } = serie || study;
//     projectID = projectID ? projectID : "lite";

//     let selectedID;
//     let seriesUID;
//     if (serie) {
//       selectedID = serie.seriesUID;
//       seriesUID = serie.seriesUID;
//     } else if (study) {
//       selectedID = study.studyUID;
//     }
//     let summaryData = await dispatch(getWholeData(serie, study, annotation));

//     let aimsData = await dispatch(
//       getSingleSerieData({ projectID, patientID, studyUID, seriesUID })
//     );

//     const reference = {
//       patientID,
//       studyUID,
//       seriesUID,
//       aimID: annotation
//     };

//     dispatch(
//       annotationsLoaded(summaryData, aimsData, seriesUID, patientID, reference)
//     );
//   };
// };
