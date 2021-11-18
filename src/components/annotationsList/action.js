import {
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
  CLEAR_GRID,
  DISPLAY_SINGLE_AIM,
  JUMP_TO_AIM,
  SELECT_SERIE,
  SELECT_STUDY,
  SELECT_ANNOTATION,
  SELECT_PATIENT,
  SELECT_PROJECT,
  CLEAR_SELECTION,
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
  GET_PROJECT_MAP,
  SET_SEG_LABEL_MAP_INDEX,
  GET_TEMPLATES,
  SEG_UPLOAD_STARTED,
  SEG_UPLOAD_COMPLETED,
  SEG_UPLOAD_REMOVE,
  AIM_DELETE,
  colors,
  commonLabels
} from "./types";

import { getSeries } from "../../services/seriesServices";
import { getStudies, getStudyAims } from "../../services/studyServices";
import {
  getAnnotations,
  getAnnotationsJSON,
  getSubjectsAnnotations
} from "../../services/annotationServices";
import { getAllTemplates } from "../../services/templateServices";
import { getImageIdAnnotations } from "aimapi";
import { ConsoleWriter } from "istanbul-lib-report";

// Invoked at leftsidebar
// one of the first actions once the user sign in
export const getProjectMap = projectMap => {
  return { type: GET_PROJECT_MAP, projectMap };
};

export const getTemplates = () => {
  return async (dispatch, getState) => {
    try {
      const templates = {};
      const { data: templatesJSONs } = await getAllTemplates();
      for (let temp of templatesJSONs) {
        const { codeValue } = temp.TemplateContainer.Template[0];
        templates[codeValue] = temp;
      }
      dispatch({ type: GET_TEMPLATES, templates });
    } catch (err) {
      console.error("getting template JSONs", err);
    }
  };
};

// closes all ports in display view
export const clearGrid = item => {
  return { type: CLEAR_GRID };
};

export const clearActivePortAimID = () => {
  return { type: CLEAR_ACTIVE_AIMID };
};

// clears aimID of the all open series
export const clearAimId = () => {
  return {
    type: CLEAR_AIMID
  };
};

// commented out at Nov 11,
// this action is not used anywhere by the time of comment out
// export const updateImageIndex = (imageIndex) => {
//   return { type: UPDATE_IMAGE_INDEX, imageIndex };
// };

// imageId is used to display annotation details
// at right side bar
export const updateImageId = imageID => {
  return {
    type: UPDATE_IMAGEID,
    imageID
  };
};

export const closeSerie = () => {
  return {
    type: CLOSE_SERIE
  };
};

// store data so components can update horizantally
export const getNotificationsData = (
  uploadedPid,
  lastEventId,
  refresh,
  notificationAction
) => {
  return {
    type: GET_NOTIFICATIONS,
    payload: { uploadedPid, lastEventId, refresh, notificationAction }
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
    payload: { type, status, patient, study, serie, annotation }
  };
};

export const updatePatientOnAimSave = aimRefs => {
  return { type: UPDATE_PATIENT_AIM_SAVE, aimRefs };
};

export const updatePatientOnAimDelete = aimRefs => {
  return { type: UPDATE_PATIENT_AIM_DELETE, aimRefs };
};

// clear selected patients/studies/series/annotations from the store
export const clearSelection = selectionType => {
  return { type: CLEAR_SELECTION, selectionType };
};

// flag for rerendering UI - showing spinners etc.
export const loadCompleted = () => {
  return { type: LOAD_COMPLETED };
};

// flag for rerendering UI - showing spinners etc.
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

//fill aimID to jump on click eyeicon/annotations etc
export const jumpToAim = (seriesUID, aimID, index) => {
  return {
    type: JUMP_TO_AIM,
    payload: { seriesUID, aimID, index }
  };
};

// commented out at Nov 11,
// this action is not used anywhere by the time of comment out
// export const displaySingleAim = (
//   patientID,
//   studyUID,
//   seriesUID,
//   aimID,
//   index
// ) => {
//   return {
//     type: DISPLAY_SINGLE_AIM,
//     payload: { patientID, studyUID, seriesUID, aimID },
//   };
// };

// invoked when patient select checkbox clicked
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
    patient: { projectID, patientID, numberOfAnnotations, subjectName, index }
  };
};

// invoked when project dropdown used
export const selectProject = projectID => {
  return {
    type: SELECT_PROJECT,
    projectID
  };
};

// invoked when study select checkbox clicked
export const selectStudy = selectedStudyObj => {
  let {
    studyUID,
    patientID,
    projectID,
    studyDescription,
    patientName,
    numberOfSeries,
    numberOfAnnotations
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
      numberOfAnnotations
    }
  };
};

// invoked when series select checkbox clicked
export const selectSerie = (selectedSerieObj, studyDescription) => {
  const {
    seriesUID,
    studyUID,
    patientID,
    projectID,
    patientName,
    seriesDescription,
    numberOfAnnotations,
    examType
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
      examType
    }
  };
};

// invoked when annotation select checkbox clicked
export const selectAnnotation = (
  selectedAnnotationObj,
  studyDescription,
  seriesDescription,
  examType
) => {
  const {
    aimID,

    seriesUID,

    studyUID,

    subjectID,

    projectID,

    patientName,

    name
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
      examType
    }
  };
};

// opens a new port to display series
// adds series details to the array
export const addToGrid = (serie, annotation) => {
  let { patientID, studyUID, seriesUID, projectID, patientName } = serie;
  projectID = projectID ? projectID : "lite";
  if (annotation)
    patientID = serie.originalSubjectID || serie.subjectID || serie.patientID;
  let reference = {
    projectID,
    patientID,
    studyUID,
    seriesUID,
    patientName,
    aimID: annotation
    // imageIndex: 0
  };
  return { type: ADD_TO_GRID, reference };
};

// toggle annotation details at the right side bar in display view
export const showAnnotationWindow = () => {
  return { type: SHOW_ANNOTATION_WINDOW };
};

// it saves the error message to the store
// TODO: check if the stored error message is used somewhere
export const annotationsLoadingError = error => {
  return {
    type: LOAD_ANNOTATIONS_ERROR
  };
};

// TODO: we are showing series selection modal by October 2021
// Check if this flag is still needed
export const alertViewPortFull = () => {
  return {
    type: VIEWPORT_FULL
  };
};

// toggles show hide annotation on image at display view right bar
export const updateAnnotationDisplay = (
  patient,
  study,
  serie,
  annotation,
  isDisplayed
) => {
  return {
    type: UPDATE_ANNOTATION_DISPLAY,
    payload: { patient, study, serie, annotation, isDisplayed }
  };
};

// invoked at display view right bar
export const toggleAllAnnotations = (seriesUID, displayStatus) => {
  return {
    type: TOGGLE_ALL_ANNOTATIONS,
    payload: { seriesUID, displayStatus }
  };
};

// invoked at display view right bar
export const toggleAllLabels = (serieID, checked) => {
  return {
    type: TOGGLE_ALL_LABELS,
    payload: { serieID, checked }
  };
};

// invoked at display view right bar
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

// helpeer method
export const singleSerieLoaded = (ref, aimsData, serID, imageData, ann) => {
  return {
    type: LOAD_SERIE_SUCCESS,
    payload: { ref, aimsData, serID, imageData, ann }
  };
};

// helper method internal use in action
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

      const markupColor =
        aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
          ?.markupEntityCollection?.MarkupEntity[0]?.lineColor?.value; //if aim has markup colors make the first markup"s color aim"s color
      let color;

      if (imgAimUID) {
        if (markupColor) {
          color = {
            button: { background: "#aaaaaa", color: "black" },
            label: { background: markupColor, color: "white" }
          };
        } else color = colors[index];
      } else color = commonLabels;

      let type = imgAimUID
        ? "image"
        : serieAimUID && !imgAimUID
        ? "serie"
        : "study";

      let aimName =
        aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]?.name
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
        trackingUniqueIdentifier
      } = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0];
      const aimFields = {
        name,
        comment,
        imagingObservationEntityCollection,
        imagingPhysicalEntityCollection,
        inferenceEntityCollection,
        segmentationEntityCollection,
        typeCode,
        trackingUniqueIdentifier: trackingUniqueIdentifier?.root
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
        showLabel: true,
        cornerStoneTools: [],
        // color,
        type,
        imgAimUID,
        markupColor
      };
    });
    return result;
  } catch (err) {
    console.error("Error in parsing aim attributes", err);
  }
};

// helper method internal use in action
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
          significanceOrder,
          examType
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
          significanceOrder,
          examType
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

// TODO: it may be deleted after getWholeData discarded
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

// TODO: it may be deleted after getWholeData discarded
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

// TODO: it may be deleted after getWholeData discarded
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
      seriesId
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

// action to open series
export const getSingleSerie = (serie, annotation) => {
  return async (dispatch, getState) => {
    try {
      // await dispatch(loadAnnotations());
      let { patientID, studyUID, seriesUID, numberOfAnnotations } = serie;
      let reference = {
        patientID,
        studyUID,
        seriesUID,
        numberOfAnnotations,
        aimID: annotation
      };
      const { aimsData, imageData } = await getSingleSerieData(
        serie,
        annotation
      );
      await dispatch(
        singleSerieLoaded(reference, aimsData, seriesUID, imageData, annotation)
      );
    } catch (err) {
      console.error(err);
    }
  };
};

// TODO: check with getWholeData, this may be unnecessary
export const updateSingleSerie = (serie, annotation) => {
  return async (dispatch, getState) => {
    let { patientID, studyUID, seriesUID, numberOfAnnotations } = serie;
    let reference = {
      patientID,
      studyUID,
      seriesUID,
      numberOfAnnotations,
      aimID: annotation
    };
    const { aimsData, imageData } = await getSingleSerieData(serie, annotation);
    await dispatch(
      singleSerieLoaded(reference, aimsData, seriesUID, imageData, annotation)
    );
  };
};

//Helper method - sorts study aims and series aims
const extractNonMarkupAims = (arr, seriesID) => {
  let studyAims = [];
  let serieAims = [];
  // let imageAims = {};
  arr.forEach(aim => {
    const series =
      aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
        .imageReferenceEntityCollection.ImageReferenceEntity[0].imageStudy
        .imageSeries;
    const serieUID = series.instanceUid.root;
    if (!serieUID) {
      studyAims.push(aim);
    } else if (serieUID === seriesID) {
      serieAims.push(aim);
      // if (
      //   (!aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
      //     .markupEntityCollection ||
      //     aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
      //       .markupEntityCollection.MarkupEntity.length === 0) &&
      //   (!aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
      //     .segmentationEntityCollection ||
      //     aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0]
      //       .segmentationEntityCollection.SegmentationEntity.length === 0)
      // ) {
      // imageAims[series.imageCollection.Image[0].sopInstanceUid.root] = [
      //   { aimUid: aim.ImageAnnotationCollection.uniqueIdentifier.root }
      // ];
      // }
    }
  });
  return { studyAims, serieAims };
};

// helper methods - calls backend and get data
const getSingleSerieData = (serie, annotation) => {
  return new Promise((resolve, reject) => {
    let aimsData;
    let imageData;
    let { studyUID, seriesUID, projectID, patientID } = serie;
    projectID = projectID ? projectID : "lite";
    patientID = patientID ? patientID : serie.subjectID;
    getStudyAims(patientID, studyUID, projectID)
      .then(async result => {
        const { studyAims, serieAims } = extractNonMarkupAims(
          result.data.rows,
          seriesUID
        );
        aimsData = serieAims.concat(studyAims);
        imageData = {
          ...getImageIdAnnotations(serieAims)
        };
        aimsData = getAimListFields(aimsData, annotation);
        resolve({ aimsData, imageData });
      })
      .catch(err => reject("Error while getting annotation data", err));
  });
};

// TODO : will come back
export function getWholeData(serie, study, annotation) {
  return async (dispatch, getState) => {
    try {
      // console.log("2 serie, study, annotation", serie, study, annotation);
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
        patientName
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
    } catch (err) {
      console.error(err);
    }
  };
}

export const setSegLabelMapIndex = (aimID, labelMapIndex) => {
  return {
    type: SET_SEG_LABEL_MAP_INDEX,
    payload: { aimID, labelMapIndex }
  };
};

export const segUploadStarted = segUid => {
  return { type: SEG_UPLOAD_STARTED, payload: segUid };
};

export const segUploadCompleted = segUid => {
  return { type: SEG_UPLOAD_COMPLETED, payload: segUid };
};

export const segUploadRemove = segUid => {
  return { type: SEG_UPLOAD_REMOVE, payload: segUid };
};

export const aimDelete = aimRefs => {
  return { type: AIM_DELETE, payload: aimRefs };
};
