import _ from 'lodash';
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
  // UPDATE_PATIENT,
  CLOSE_SERIE,
  UPDATE_IMAGEID,
  CLEAR_AIMID,
  // UPDATE_PATIENT_AIM_SAVE,
  // UPDATE_PATIENT_AIM_DELETE,
  GET_NOTIFICATIONS,
  UPDATE_IMAGE_INDEX,
  GET_PROJECT_MAP,
  SET_SEG_LABEL_MAP_INDEX,
  GET_TEMPLATES,
  SEG_UPLOAD_STARTED,
  SEG_UPLOAD_COMPLETED,
  SEG_UPLOAD_REMOVE,
  AIM_DELETE,
  SAVE_PATIENT_FILTER,
  REPLACE_IN_GRID,
  UPDATE_SEARCH_TABLE_INDEX,
  REFRESH_MAP,
  AIM_SAVE,
  SUBPATH,
  CHECK_MULTIFRAME,
  CLEAR_MULTIFRAME_AIM_JUMP,
  SET_SERIES_DATA,
  FILL_DESC,
  colors,
  commonLabels,
} from "./types";

import { getSeries } from "../../services/seriesServices";
import { getStudies, getStudyAims } from "../../services/studyServices";
import {
  getAnnotations,
  getAnnotationsJSON,
  getSubjectsAnnotations,
} from "../../services/annotationServices";
import { getAllTemplates } from "../../services/templateServices";
import { getImageIdAnnotations } from "aimapi";
import { ConsoleWriter } from "istanbul-lib-report";
import aimEntityData from "./annotationDock/aimEntityData";
import { setToolOptionsForElement } from 'cornerstone-tools';

const wadoUrl = sessionStorage.getItem('wadoUrl');

export const fillSeriesDescfullData = (data) => {
  return { type: FILL_DESC, data };
}

export const setSeriesData = (projectID, patientID, studyUID, seriesData, filled, mfMerged) => {
  const data = seriesData.map(el => {
    el.filled = filled;
    return el;
  });

  return { type: SET_SERIES_DATA, payload: { projectID, patientID, studyUID, data, mfMerged } };
}

export const clearMultiFrameAimJumpFlags = () => {
  return { type: CLEAR_MULTIFRAME_AIM_JUMP };
}

export const updateGridWithMultiFrameInfo = (hasMultiframe, multiframeIndex, multiFrameMap, multiframeSeriesData, portInx) => {
  return { type: CHECK_MULTIFRAME, payload: { hasMultiframe, multiframeIndex, multiFrameMap, multiframeSeriesData, portInx } };
}

export const updateSubpath = (subpath, portIndex) => {
  return { type: SUBPATH, payload: { subpath, portIndex } }
}

export const updateSearchTableIndex = searchTableIndex => {
  return { type: UPDATE_SEARCH_TABLE_INDEX, searchTableIndex }
}

export const savePatientFilter = (patientSearch, pageSize, pageIndex) => {
  return {
    type: SAVE_PATIENT_FILTER,
    patientFilter: { patientSearch, pageSize, pageIndex },
  };
};

// Invoked at leftsidebar
// one of the first actions once the user sign in
export const getProjectMap = (projectMap) => {
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
export const clearGrid = (item) => {
  return { type: CLEAR_GRID };
};

// clears aimID of the all open series
export const clearAimId = () => {
  return {
    type: CLEAR_AIMID,
  };
};

// commented out at Nov 11,
// this action is not used anywhere by the time of comment out
// export const updateImageIndex = (imageIndex) => {
//   return { type: UPDATE_IMAGE_INDEX, imageIndex };
// };

// imageId is used to display annotation details
// at right side bar
export const updateImageId = (imageID, port) => {
  return {
    type: UPDATE_IMAGEID,
    imageID,
    port
  };
};

export const closeSerie = () => {
  return {
    type: CLOSE_SERIE,
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
    payload: { uploadedPid, lastEventId, refresh, notificationAction },
  };
};

// -----> Delete after v1.0 <-----
// export const updatePatient = (
//   type,
//   status,
//   patient,
//   study,
//   serie,
//   annotation
// ) => {
//   return {
//     type: UPDATE_PATIENT,
//     payload: { type, status, patient, study, serie, annotation }
//   };
// };

// -----> Delete after v1.0 <-----
// export const updatePatientOnAimSave = aimRefs => {
//   return { type: UPDATE_PATIENT_AIM_SAVE, aimRefs };
// };

// -----> Delete after v1.0 <-----
// export const updatePatientOnAimDelete = aimRefs => {
//   return { type: UPDATE_PATIENT_AIM_DELETE, aimRefs };
// };

// clear selected patients/studies/series/annotations from the store
export const clearSelection = (selectionType) => {
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

// -----> Delete after v1.0 <-----
// export const loadPatient = () => {
//   return { type: LOAD_PATIENT };
// };
// export const loadPatientError = err => {
//   return { type: LOAD_PATIENT_ERROR, err };
// };
// export const loadPatientSuccess = patient => {
//   return { type: LOAD_PATIENT_SUCCESS, patient };
// };

//fill aimID to jump on click eyeicon/annotations etc
export const jumpToAim = (seriesUID, aimID, index) => {
  return {
    type: JUMP_TO_AIM,
    payload: { seriesUID, aimID, index },
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
export const selectPatient = (selectedPatientObj) => {
  let { projectID, subjectName, numberOfAnnotations, index } =
    selectedPatientObj;
  projectID = projectID ? projectID : "lite";
  const patientID = selectedPatientObj.subjectID;
  return {
    type: SELECT_PATIENT,
    patient: { projectID, patientID, numberOfAnnotations, subjectName, index },
  };
};

// invoked when project dropdown used
export const selectProject = (projectID) => {
  return {
    type: SELECT_PROJECT,
    projectID,
  };
};

// invoked when study select checkbox clicked
export const selectStudy = (selectedStudyObj) => {
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
    examType,
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
      examType,
    },
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
      examType,
    },
  };
};

// opens a new port to display series
// adds series details to the array
export const addToGrid = (serie, annotation, port) => {
  let { patientID, studyUID, seriesUID, projectID, patientName, examType, modality, comment, seriesDescription, numberOfAnnotations, numberOfImages, seriesNo, template, significanceOrder } = serie;
  const modFmComment = comment ? comment.split('/')[0].trim() : '';
  examType = examType ? examType.toUpperCase() : modality ? modality.toUpperCase() : modFmComment.toUpperCase();

  projectID = projectID ? projectID : "lite";

  if (annotation) patientID = serie.originalSubjectID || serie.subjectID || serie.patientID;

  let reference = {
    projectID,
    patientID,
    studyUID,
    seriesUID,
    patientName,
    aimID: annotation,
    examType,
    seriesDescription,
    numberOfAnnotations,
    numberOfImages,
    seriesNo,
    template,
    significanceOrder
    // imageIndex: 0
  };
  return { type: ADD_TO_GRID, reference, port };
};

export const replaceInGrid = (serie) => {
  let { seriesUID, examType, multiFrameIndex } = serie;
  // return async(dispatch)=>{
  //   await dispatch(getSingleSerie(serie));
  return { type: REPLACE_IN_GRID, payload: { seriesUID, examType, multiFrameIndex } };
  // } 
}

// toggle annotation details at the right side bar in display view
export const showAnnotationWindow = () => {
  return { type: SHOW_ANNOTATION_WINDOW };
};

const loadAnnotations = () => {
  return {
    type: LOAD_ANNOTATIONS,
  };
};

const annotationsLoaded = () => {
  return {
    type: LOAD_ANNOTATIONS_SUCCESS,
  };
};

// it saves the error message to the store
// TODO: check if the stored error message is used somewhere
export const annotationsLoadingError = (error) => {
  return {
    type: LOAD_ANNOTATIONS_ERROR,
  };
};

// TODO: we are showing series selection modal by October 2021
// Check if this flag is still needed
export const alertViewPortFull = () => {
  return {
    type: VIEWPORT_FULL,
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
    payload: { patient, study, serie, annotation, isDisplayed },
  };
};

// invoked at display view right bar
export const toggleAllAnnotations = (seriesUID, displayStatus) => {
  return {
    type: TOGGLE_ALL_ANNOTATIONS,
    payload: { seriesUID, displayStatus },
  };
};

// invoked at display view right bar
export const toggleAllLabels = (serieID, checked) => {
  return {
    type: TOGGLE_ALL_LABELS,
    payload: { serieID, checked },
  };
};

// invoked at display view right bar
export const toggleSingleLabel = (serieID, aimID) => {
  return {
    type: TOGGLE_LABEL,
    payload: { serieID, aimID },
  };
};

export const changeActivePort = (portIndex) => {
  return {
    type: CHANGE_ACTIVE_PORT,
    portIndex,
  };
};

export const refreshPage = (feature, condition) => {
  return {
    type: REFRESH_MAP,
    payload: { feature, condition }
  }
}

// helpeer method
export const singleSerieLoaded = (ref, aimsData, serID, imageData, ann, otherSeriesAimsData, seriesOfStudy, frameData) => {
  return {
    type: LOAD_SERIE_SUCCESS,
    payload: { ref, aimsData, serID, imageData, ann, otherSeriesAimsData, seriesOfStudy, frameData },
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
            label: { background: markupColor, color: "white" },
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
        aimName = aimName && typeof aimName === 'string' ? aimName.substring(0, ind) : aimName;
      }

      // let displayStatus = ann
      //   ? ann === aim.ImageAnnotationCollection.uniqueIdentifier.root
      //   : !ann;

      const {
        name,
        comment,
        imagingObservationEntityCollection,
        imagingPhysicalEntityCollection,
        inferenceEntityCollection,
        segmentationEntityCollection,
        typeCode,
        trackingUniqueIdentifier,
      } = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0];
      let users = aim.ImageAnnotationCollection.user;
      if (!Array.isArray(users))
        users = [users];
      let flattenAuthorList = users.map(user => {
        return user.name.value;
      })
      const aimFields = {
        name,
        comment,
        imagingObservationEntityCollection,
        imagingPhysicalEntityCollection,
        inferenceEntityCollection,
        segmentationEntityCollection,
        typeCode,
        trackingUniqueIdentifier: trackingUniqueIdentifier?.root,
        users,
      };
      const id = aim.ImageAnnotationCollection.uniqueIdentifier.root;
      result[aim.ImageAnnotationCollection.uniqueIdentifier.root] = {
        name: aimName,
        id,
        user: flattenAuthorList.join(),
        // json1: aim,
        json: aimFields,
        isDisplayed: true,
        showLabel: false,
        cornerStoneTools: [],
        // color,
        type,
        imgAimUID,
        markupColor,
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
    arr.forEach((element) => {
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
          examType,
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
          examType,
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

// -----> Delete after v1.0 <-----
// TODO: it may be deleted after getWholeData discarded
// const getStudiesData = async (dataObj, projectID, patientID, selectedID) => {
//   try {
//     const { data: studies } = await getStudies(projectID, patientID);
//     //create an empty object to be "studies" property in the data
//     //iterate over the studies array create key/value pairs
//     dataObj["studies"] = getRequiredFields(studies, "study", selectedID);
//     return new Promise((resolve, reject) => {
//       resolve(dataObj);
//     });
//   } catch (err) {
//     return new Promise((resolve, reject) => {
//       reject(
//         new Error(
//           `Error while getting study data ${err}`,
//           "src/components/annotationList/action.js"
//         )
//       );
//     });
//   }
// };

const getSeriesData = async (projectID, patientID, studyID, selectedID) => {
  try {
    const { data: series } = await getSeries(projectID, patientID, studyID, false, "action.js, getSeriesData");
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

// -----> Delete after v1.0 <-----
// TODO: it may be deleted after getWholeData discarded
// const getAnnotationData = async (
//   projectId,
//   subjectId,
//   studyId,
//   seriesId,
//   selectedID
// ) => {
//   try {
//     const { data: annotations } = await getAnnotations({
//       projectId,
//       subjectId,
//       studyId,
//       seriesId
//     });
//     let formattedAnnotation = [];
//     if (annotations) {
//       formattedAnnotation = getRequiredFields(
//         annotations,
//         "annotation",
//         selectedID
//       );
//     }
//     return new Promise((resolve, reject) => {
//       resolve(formattedAnnotation);
//     });
//   } catch (err) {
//     return new Promise((resolve, reject) => {
//       reject(
//         new Error(
//           `Error while getting annotations data ${err}`,
//           "src/components/annotationList/action.js"
//         )
//       );
//     });
//   }
// };

// action to open series
export const getSingleSerie = (serie, annotation, wadoUrl, seriesData) => {
  return async (dispatch, getState) => {
    try {
      await dispatch(loadAnnotations());
      let { patientID, studyUID, seriesUID, numberOfAnnotations, projectID, subjectID } = serie;
      patientID = patientID ? patientID : subjectID;
      let reference = {
        patientID,
        studyUID,
        seriesUID,
        numberOfAnnotations,
        aimID: annotation,
        projectID
      };

      const { aimsData, imageData, otherSeriesAimsData, seriesOfStudy, serieRef, frameData } = await getSingleSerieData(
        serie,
        annotation,
        wadoUrl,
        seriesData
      );

      reference = { ...reference, ...serieRef };

      await dispatch(
        singleSerieLoaded(reference, aimsData, seriesUID, imageData, annotation, otherSeriesAimsData, seriesOfStudy, frameData)
      );

    } catch (err) {
      console.error(err);
    }
  };
};


const getSeriesAdditionalInfo = (uids) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { studyUID, projectID, patientID } = uids;
      const { data: series } = await getSeries(projectID, patientID, studyUID, false, "action, getSeriesAdditionalInfo");
      const additionalaDataArray = series.reduce((all, item) => {
        const filled = true;
        const { numberOfAnnotations, numberOfImages, seriesDescription, seriesNo, seriesUID } = item;
        all.push({ numberOfAnnotations, numberOfImages, seriesDescription, seriesNo, projectID, patientID, studyUID, filled, seriesUID });
        return all;
      }, []);
      resolve(additionalaDataArray);
    } catch (err) {
      console.log(err);
      reject("Error while getting getSeriesAdditionalInfo", err)
    }
  });
}

const addtionalSeriesDataLoaded = async () => {

}

export const getSeriesAdditional = (uids) => {
  return async (dispatch, getState) => {
    try {
      const seriesData = await getSeriesAdditionalInfo(
        uids
      );


      await dispatch(
        fillSeriesDescfullData(seriesData)
      );

    } catch (err) {
      console.error(err);
    }
  };
};

export const updateOtherAims = (aimrefs) => {
  return async (dispatch) => {
    try {
      // aimID,
      // patientID,
      // projectID,
      // seriesUID,
      // studyUID,
      // name,
      const { projectID, patientID, studyUID } = aimrefs;
      // projectId, subjectId, studyId
      const { data: seriesList } = await getSeries(projectID, patientID, studyUID, false, "action, updateOtherAims");
      await dispatch(otherAimsUpdated(seriesList, aimrefs));
    }
    catch (err) {
      console.error(err);
    }
  }
}

export const updateSingleSerie = (serie, annotation) => {
  return async (dispatch, getState) => {
    let { patientID, studyUID, seriesUID, numberOfAnnotations, projectID } = serie;
    let reference = {
      patientID,
      studyUID,
      seriesUID,
      numberOfAnnotations,
      aimID: annotation,
      projectID
    };
    const { aimsData, imageData, otherSeriesAimsData, seriesOfStudy } = await getSingleSerieData(serie, annotation);
    await dispatch(
      singleSerieLoaded(reference, aimsData, seriesUID, imageData, annotation, otherSeriesAimsData, seriesOfStudy)
    );
  };
};

//Helper method - sorts study aims and series aims
const extractNonMarkupAims = (arr, seriesID) => {
  let studyAims = [];
  let serieAims = [];
  let otherSeriesAims = [];
  // let imageAims = {};
  arr.forEach((aim) => {
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
    } else {
      otherSeriesAims.push(aim);
    }
  });
  return { studyAims, serieAims, otherSeriesAims };
};

const formAimData = (aim, projectID, patientID) => {
  const imgAnnItem = aim.ImageAnnotationCollection.imageAnnotations.ImageAnnotation[0];
  const imgRefEntity = imgAnnItem.imageReferenceEntityCollection.ImageReferenceEntity[0];
  const markupEntity = imgAnnItem.markupEntityCollection?.MarkupEntity;
  // const imgs = imgRefEntity.imageStudy.imageSeries?.imageCollection?.Image;
  const imgs = imgRefEntity.imageStudy.imageSeries?.imageCollection?.Image;
  const aimID = aim.ImageAnnotationCollection.uniqueIdentifier.root;
  const name = imgAnnItem.name.value;
  const comment = imgAnnItem.comment.value;
  let imgIDs;
  if (markupEntity) {
    imgIDs = markupEntity.reduce((all, item) => {
      const imgId = item.imageReferenceUid.root;
      const frameNo = item.referencedFrameNumber.value;
      all[`${imgId}/frames/${frameNo}`] = true;
      return all;
    }, {})
  } else {
    imgIDs = imgs.reduce((all, item) => {
      all[item.sopInstanceUid.root] = true;
      return all;
    }, {})
  }
  const study = imgAnnItem
    .imageReferenceEntityCollection.ImageReferenceEntity[0].imageStudy;
  const studyUID = study.instanceUid.root;
  const seriesUID = study.imageSeries.instanceUid.root;
  return { projectID, patientID, aimID, studyUID, seriesUID, name, comment, imgIDs };
}

const newGetOtherSeriesAimData = (arr, projectID, patientID) => {
  // StudyUID: [{seriesUID: 1.324234, seriesNo: 12, aimIDs: {id: {color: name: slice: }}]
  const seriesNovsUIDmap = {};
  const aims = arr.reduce((all, item, index) => {
    const aimData = formAimData(item, projectID, patientID);
    const { studyUID, seriesUID, comment, aimID } = aimData;
    const commentArr = comment.split('/');
    const seriesNo = commentArr[3] ? parseInt(commentArr[3]) : null;
    const imageNo = commentArr[2] ? parseInt(commentArr[2]) : null;
    // if (seriesNo && !seriesNovsUIDmap[`${seriesUID}-${studyUID}`]) seriesNovsUIDmap[`${seriesUID}-${studyUID}`] = seriesNo;
    if (seriesNo && !seriesNovsUIDmap[`${seriesUID}`]) seriesNovsUIDmap[`${seriesUID}`] = seriesNo;
    aimData.seriesNo = seriesNo;
    aimData.imageNo = imageNo;

    if (all[studyUID])
      if (all[studyUID][seriesUID]) all[studyUID][seriesUID][2][aimID] = aimData;
      else all[studyUID][seriesUID] = [seriesUID, seriesNo, { [aimID]: aimData }];
    else
      all[studyUID] = { [seriesUID]: [seriesUID, seriesNo, { [aimID]: aimData }] }
    return all;
  }, {});
  return { aims, seriesNovsUIDmap };
}

const sortAimsBasedOnName = (series) => {
  series.forEach(item => {
    item[2].sort((a, b) => {
      if (a.imageNo === b.imageNo) {
        if (a.name > b.name) return 1;
        else if (a.name < b.name) return -1;
        else return 0;
      } else return a.imageNo - b.imageNo;
    })
  })
}

const sortAims = (series) => {
  sortAimsBasedOnName(series);
  return series;
}

const getStudyAimsDataSorted = (arr, projectID, patientID) => {
  if (arr.length > 0) {
    const result = {};
    const { aims, seriesNovsUIDmap } = newGetOtherSeriesAimData(arr, projectID, patientID);
    const studyUID = Object.keys(aims);
    const seriesMap = Object.values(aims);
    // get series' values
    let series = Object.values(seriesMap[0]);
    // sort them seriesNo
    series.sort(function (a, b) {
      return a[1] - b[1];
    });
    // remove map with new sorted array
    series.forEach(el => {
      const aimArr = Object.values(el[2]);
      el[2] = aimArr;
    });
    result[projectID] = { [studyUID]: sortAims(series) }
    // aims[studyUID] = sortAims(series);
    // write a sorting function for slice numbers
    // and remove aimID map with sorted Array
    return result;
  }
}


const getSeriesAdditionalData = (arr, uid) => {
  if (arr) {
    const data = arr.filter((el) => el.seriesUID === uid);
    if (data.length > 0) {
      const { numberOfAnnotations, numberOfImages, seriesDescription, seriesNo, examType } = data[0];
      return { numberOfAnnotations, numberOfImages, seriesDescription, seriesNo, examType };
    } else return {};
  } else return {};
}

// if (!seriesData) promises.push(getSeries(projectID, patientID, studyUID, true));


const insertAdditionalData = (arr, ref, uid) => {
  if (arr) {
    arr.forEach(el => {
      if (el.seriesUID === uid) {
        el = { ...el, ...ref }
      }
    })
  }
  return arr;
}
// helper methods - calls backend and get data
const getSingleSerieData = (serie, annotation, wadoUrl, seriesData) => {
  return new Promise((resolve, reject) => {
    let aimsData;
    let imageData;
    let { studyUID, seriesUID, projectID, patientID, aimID } = serie;
    projectID = projectID ? projectID : "lite";
    patientID = patientID ? patientID : serie.subjectID;
    aimID = aimID ? aimID : annotation;

    //  TODO: getseries call should get its data from the initial data
    const promises = [getStudyAims(patientID, studyUID, projectID)];
    if (!seriesData) {
      promises.push(getSeries(projectID, patientID, studyUID, true, "action getSingleSerieData"));
    }

    Promise.all(promises)
      .then(async (result) => {
        const { studyAims, serieAims, otherSeriesAims } = extractNonMarkupAims(
          result[0].data.rows,
          seriesUID
        );
        aimsData = serieAims.concat(studyAims);
        let imageAimMap = getImageIdAnnotations(serieAims);
        const url = wadoUrl ? wadoUrl : sessionStorage.getItem('wadoUrl');
        const imgIds = Object.keys(imageAimMap);
        const aims = Object.values(imageAimMap);
        let frameData = {}
        if (url.includes('wadors')) {
          imageAimMap = aims.reduce((all, item, i) => {
            // Aimapi sends wadouri format including &frame= wadors format is handled here
            let img = imgIds[i].split('&frame=');
            let frameNo = img.length > 1 ? img[1] : 1;
            img = `${img[0]}/frames/${frameNo}`
            all[img] = all[img] ? [...all[img], ...item] : item;
            return all;
          }, {})

          // let max = 1;
          frameData = aims.reduce((all, aimsList, index) => {
            let img = imgIds[index].split('&frame=');
            let frameNo = img.length > 1 ? img[1] : 1;
            // if (frameNo > max) max = frameNo;
            img = `${img[0]}/frames/${frameNo}`
            aimsList.forEach((el, i) => {
              if (all[el.aimUid]) all[el.aimUid].push(img);
              else all[el.aimUid] = [img];
            })
            return all;
          }, {})
        }

        imageData = {
          ...imageAimMap,
        };

        const serData = seriesData ? seriesData : result[1] ? result[1].data : null;
        const serieRef = getSeriesAdditionalData(serData, seriesUID);
        aimsData = getAimListFields(aimsData, annotation);
        const allAims = [...serieAims, ...otherSeriesAims]
        const otherSeriesAimsData = allAims.length === 0 ? {} : getStudyAimsDataSorted(allAims, projectID, patientID);
        const seriesExtendedData = insertAdditionalData(serData, serieRef, seriesUID);

        const map = seriesExtendedData.reduce((all, item) => {
          all[item.seriesUID] = true;
          return all;
        }, {});

        const seriesOfStudy = { [studyUID]: { 'list': seriesExtendedData, map } }
        resolve({ aimsData, imageData, otherSeriesAimsData, seriesOfStudy, serieRef, frameData });
      })
      .catch((err) => {
        console.log(err);
        reject("Error while getting annotation data", err)
      });
  });
};

// -----> Delete after v1.0 <-----
// TODO : will come back
// export function getWholeData(serie, study, annotation) {
//   return async (dispatch, getState) => {
//     try {
//       // console.log("2 serie, study, annotation", serie, study, annotation);
//       dispatch(loadPatient());
//       let { projectID, patientID, patientName, studyUID } =
//         serie || study || annotation;
//       projectID = projectID ? projectID : "lite";

//       if (annotation) patientID = annotation.subjectID;
//       let selectedID;
//       let seriesUID;
//       if (serie) {
//         selectedID = serie.seriesUID;
//         seriesUID = serie.seriesUID;
//       } else if (study) {
//         selectedID = study.studyUID;
//       } else if (annotation) {
//         selectedID = annotation.seriesUID;
//       }
//       let summaryData = {
//         projectID,
//         patientID,
//         patientName
//       };
//       // make call to get study and populate the studies data
//       try {
//         study
//           ? await getStudiesData(summaryData, projectID, patientID, selectedID)
//           : await getStudiesData(summaryData, projectID, patientID);
//       } catch (error) {
//         dispatch(loadPatientError(error));
//       }
//       // make call to get series and populate studies with series data
//       const studies = Object.values(summaryData["studies"]);
//       for (let st of studies) {
//         let series;
//         try {
//           series = await getSeriesData(
//             projectID,
//             patientID,
//             st.studyUID,
//             selectedID
//           );
//           st.series = series;
//           //make call to get annotations and populate series annotations data
//           const seriesArr = Object.values(st.series);
//           for (let serie of seriesArr) {
//             try {
//               const annotations = await getAnnotationData(
//                 projectID,
//                 patientID,
//                 st.studyUID,
//                 serie.seriesUID,
//                 selectedID
//               );
//               serie.annotations = annotations;
//             } catch (error) {
//               dispatch(loadPatientError(error));
//               // dispatch(annotationsLoadingError(error));
//             }
//           }
//         } catch (error) {
//           dispatch(loadPatientError(error));
//         }
//       }
//       // return summaryData;
//       dispatch(loadPatientSuccess(summaryData));
//     } catch (err) {
//       console.error(err);
//     }
//   };
// }

export const setSegLabelMapIndex = (aimID, labelMapIndex) => {
  return {
    type: SET_SEG_LABEL_MAP_INDEX,
    payload: { aimID, labelMapIndex },
  };
};

export const segUploadStarted = (segUid) => {
  return { type: SEG_UPLOAD_STARTED, payload: segUid };
};

export const segUploadCompleted = (segUid) => {
  return { type: SEG_UPLOAD_COMPLETED, payload: segUid };
};

export const segUploadRemove = (segUid) => {
  return { type: SEG_UPLOAD_REMOVE, payload: segUid };
};

export const aimDelete = (aimRefs) => {
  return { type: AIM_DELETE, payload: aimRefs };
};


export const otherAimsUpdated = (seriesList, aimRefs) => {
  return { type: AIM_SAVE, payload: { seriesList, aimRefs } };
}