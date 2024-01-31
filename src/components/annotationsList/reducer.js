import _ from 'lodash';
import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
  LOAD_ANNOTATIONS_ERROR,
  // LOAD_PATIENT,
  // LOAD_PATIENT_SUCCESS,
  // LOAD_PATIENT_ERROR,
  UPDATE_ANNOTATION_DISPLAY,
  VIEWPORT_FULL,
  TOGGLE_ALL_ANNOTATIONS,
  TOGGLE_ALL_LABELS,
  TOGGLE_LABEL,
  CHANGE_ACTIVE_PORT,
  LOAD_SERIE_SUCCESS,
  SHOW_ANNOTATION_WINDOW /*???*/,
  CLEAR_GRID,
  CLEAR_SELECTION,
  SELECT_SERIE,
  SELECT_STUDY,
  SELECT_PATIENT,
  SELECT_PROJECT,
  SELECT_ANNOTATION,
  LOAD_COMPLETED,
  START_LOADING,
  ADD_TO_GRID,
  DISPLAY_SINGLE_AIM,
  JUMP_TO_AIM,
  // UPDATE_PATIENT,
  CLOSE_SERIE,
  UPDATE_IMAGEID,
  CLEAR_AIMID,
  UPDATE_PATIENT_AIM_SAVE,
  UPDATE_PATIENT_AIM_DELETE,
  GET_NOTIFICATIONS,
  // UPDATE_IMAGE_INDEX,
  GET_PROJECT_MAP,
  SET_SEG_LABEL_MAP_INDEX,
  GET_TEMPLATES,
  SEG_UPLOAD_STARTED,
  SEG_UPLOAD_COMPLETED,
  SEG_UPLOAD_REMOVE,
  AIM_DELETE,
  SAVE_PATIENT_FILTER,
  ADD_STUDY_TO_GRID,
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
import {
  persistColorInSaveAim,
  persistColorInDeleteAim,
} from "../../Utils/aid";
import { teachingFileTempCode } from "../../constants";
const initialState = {
  openSeries: [],
  openSeriesAddition: [],
  aimsList: {},
  activePort: null,
  loading: false,
  error: false,
  // patients: {},
  showGridFullAlert: false,
  showProjectModal: false,
  selectedProject: null,
  selectedPatients: {},
  selectedStudies: {},
  selectedSeries: {},
  selectedAnnotations: {},
  patientLoading: false,
  patientLoadingError: null,
  uploadedPid: null,
  lastEventId: null,
  projectMap: {},
  templates: {},
  aimSegLabelMaps: {},
  notificationAction: "",
  reports: [],
  isSegUploaded: {},
  patientFilter: {},
  searchTableIndex: 0,
  otherSeriesAimsList: {},
  refreshMap: {},
  subpath: [],
  multiFrameAimJumpData: null,
  seriesData: {}
};

const asyncReducer = (state = initialState, action) => {
  try {
    let aimRefs = {};
    switch (action.type) {
      // case UPDATE_IMAGE_INDEX:
      //   const updatedOpenSeries = state.openSeries.map((serie) => {
      //     const newSerie = { ...serie };
      //     if (serie.imageAnnotations) {
      //       newSerie.imageAnnotations = { ...serie.imageAnnotations };
      //     }
      //     return newSerie;
      //   });
      //   updatedOpenSeries[state.activePort].imageIndex = action.imageIndex;
      //   return { ...state, openSeries: updatedOpenSeries };
      case FILL_DESC:
        const descFilledOpenSeriesAddition = _.cloneDeep(state.openSeriesAddition);
        const descFilledSeriesData = _.cloneDeep(state.seriesData);
        for (let i = 0; i < action.data.length; i++) {
          const { projectID: fillPID, patientID: fillPatID, studyUID: fillStUID } = action.data[i];
          for (let k = 0; k < descFilledOpenSeriesAddition.length; k++) {
            if (descFilledOpenSeriesAddition[k].seriesUID === action.data[i].seriesUID) {
              // descFilledOpenSeriesAddition[k].seriesDescription = action.data[i].seriesDescription;
              descFilledOpenSeriesAddition[k] = { ...descFilledOpenSeriesAddition[k], ...action.data[i] };
              break;
            }
          }
          const stExists = descFilledSeriesData[fillPID] && descFilledSeriesData[fillPID][fillPatID] && descFilledSeriesData[fillPID][fillPatID][fillStUID];
          if (stExists) {
            for (let k = 0; k < descFilledSeriesData[fillPID][fillPatID][fillStUID].length; k++) {
              if (descFilledSeriesData[fillPID][fillPatID][fillStUID][k].seriesUID === action.data[i].seriesUID) {
                // descFilledSeriesData[fillPID][fillPatID][fillStUID][k].seriesDescription = action.data[i].seriesDescription;
                descFilledSeriesData[fillPID][fillPatID][fillStUID][k] = { ...descFilledSeriesData[fillPID][fillPatID][fillStUID][k], ...action.data[i] };
                break;
              }
            }
          }
        }
        return { ...state, seriesData: descFilledSeriesData, openSeriesAddition: descFilledOpenSeriesAddition };
      case SET_SERIES_DATA:
        const newSeriesData = _.cloneDeep(state.seriesData);
        const { projectID, patientID, studyUID, data, map } = action.payload;
        const projectExists = newSeriesData[projectID];
        const patientExists = projectExists && projectExists[patientID] ? projectExists[patientID] : false;
        const studyExists = patientExists && patientExists[studyUID] ? patientExists[studyUID] : false;
        let newMap = {};
        if (studyExists) {
          let newArr = newSeriesData[projectID][patientID][studyUID].reduce((all, item) => {
            if (item.multiFrameImage === true) all.push(item);
            return all;
          }, []);
          newArr = [...newArr, ...data];
          newMap = { ...newSeriesData[projectID][patientID][studyUID].map };
          newSeriesData[projectID][patientID][studyUID].list = newArr;
        } else if (patientExists) newSeriesData[projectID][patientID][studyUID].list = data;
        else if (projectExists) newSeriesData[projectID][patientID] = { [studyUID]: { 'list': data } };
        else newSeriesData[projectID] = { [patientID]: { [studyUID]: { 'list': data } } };
        newSeriesData[projectID][patientID][studyUID].map = { ...newMap, ...map };
        return { ...state, seriesData: newSeriesData };
      case CLEAR_MULTIFRAME_AIM_JUMP:
        const aimClearedSeries = _.cloneDeep(state.openSeries);
        const aimClearedSeriesAddition = _.cloneDeep(state.openSeriesAddition);
        aimClearedSeries[state.activePort].aimID = null;
        aimClearedSeriesAddition[state.activePort].aimID = null;
        return { ...state, openSeries: aimClearedSeries, multiFrameAimJumpData: null, openSeriesAddition: aimClearedSeriesAddition };
      case CHECK_MULTIFRAME:
        // const series = _.cloneDeep(state.openSeries);
        const seriesAddition = _.cloneDeep(state.openSeriesAddition);
        const { hasMultiframe, multiframeIndex, multiFrameMap, multiframeSeriesData } = action.payload;
        let seriesDataMulti = Object.values(multiframeSeriesData);
        const {
          projectID: multiPID,
          patientID: multiPatID,
          studyUID: multiStudyUID
        } = seriesDataMulti[0];
        let jumpArr = null;
        // check if framedata exists
        const fmData = seriesAddition[state.activePort].frameData;
        const aimSelected = state.openSeries[state.activePort].aimID || seriesAddition[state.activePort].aimID;
        if (aimSelected && hasMultiframe && fmData[aimSelected]) {
          const imgArr = fmData[aimSelected][0].split('/frames/');
          jumpArr = [multiFrameMap[imgArr[0]], parseInt(imgArr[1] - 1)];
        }
        seriesAddition[state.activePort].hasMultiframe = hasMultiframe;
        seriesAddition[state.activePort].multiFrameIndex = multiframeIndex;
        seriesAddition[state.activePort].multiFrameMap = multiFrameMap;
        const newState = { ...state };

        let newSeriesDataMulti = _.cloneDeep(state.seriesData);
        const multiPIDExists = newSeriesDataMulti[multiPID];
        const multiPatIDExists = multiPIDExists && newSeriesDataMulti[multiPID][multiPatID];
        const existingSeries = multiPIDExists && multiPatIDExists && newSeriesDataMulti[multiPID][multiPatID][multiStudyUID];
        let mfLookUpMap = {};
        if (!state.openSeriesAddition[state.activePort].multiFrameMap) {
          if (existingSeries) {
            // find the correct series to get description from
            const seriesToCopyFm = newSeriesDataMulti[multiPID][multiPatID][multiStudyUID].find((element) => element.seriesUID === seriesDataMulti[0].seriesUID);
            //prevent duplicate multiframe series to be added 
            mfLookUpMap = newSeriesDataMulti[multiPID][multiPatID][multiStudyUID].reduce((all, item, index) => {
              if (item.multiFrameImage) {
                const { projectID, patientID, studyUID, seriesUID, imageUID } = item;
                const key = `${projectID}-${patientID}-${studyUID}-${seriesUID}-${imageUID}`;
                all[key] = true;
              }
              return all;
            }, {})
            seriesDataMulti = seriesDataMulti.map((el) => {
              el.seriesDescription = seriesToCopyFm.seriesDescription;
              el.seriesNo = seriesToCopyFm.seriesNo;
              return el;
            })
            seriesDataMulti.forEach((el) => {
              const { projectID, patientID, studyUID, seriesUID, imageUID } = el;
              const key = `${projectID}-${patientID}-${studyUID}-${seriesUID}-${imageUID}`;
              if (!mfLookUpMap[key]) {
                newSeriesDataMulti[multiPID][multiPatID][multiStudyUID].push(el);
              }
            });
          } else {
            const desc = state.openSeriesAddition[state.activePort].seriesDescription;
            const srNo = state.openSeriesAddition[state.activePort].seriesNo;
            seriesDataMulti = seriesDataMulti.map((el) => {
              el.seriesDescription = desc ? desc : '';
              el.seriesNo = srNo ? srNo : null;
              return el;
            });

            if (multiPatIDExists) {
              newSeriesDataMulti[multiPID][multiPatID][multiStudyUID] = [state.openSeriesAddition[state.activePort], ...seriesDataMulti];
            } else if (multiPIDExists) {
              newSeriesDataMulti[multiPID][multiPatID] = { [multiStudyUID]: [state.openSeriesAddition[state.activePort], ...seriesDataMulti] };
            } else {
              newSeriesDataMulti[multiPID] = { [multiPatID]: { [multiStudyUID]: [state.openSeriesAddition[state.activePort], ...seriesDataMulti] } };
            }
          }
        }
        newState.seriesData = newSeriesDataMulti;
        // newState.openSeries= series;
        newState.openSeriesAddition = seriesAddition;
        newState.multiFrameAimJumpData = jumpArr;
        return newState;
      case AIM_SAVE: //tested
        const { seriesList, aimRefs } = action.payload;
        const clonedOtherAims = _.cloneDeep(state.otherSeriesAimsList);
        // to cover falsy isStudyAim value
        const isStudyAim = aimRefs.isStudyAim === true;
        seriesList.forEach((el, i) => {
          if (clonedOtherAims[el.seriesUID] && el.seriesUID !== aimRefs.seriesUID && !isStudyAim) {
            clonedOtherAims[el.seriesUID][aimRefs.aimID] = aimRefs;
          }
        })
        return { ...state, otherSeriesAimsList: clonedOtherAims };
      case SUBPATH:
        const { subpath, portIndex } = action.payload;
        const newSubpath = [...state.subpath];
        newSubpath[portIndex] = subpath;
        return { ...state, subpath: newSubpath };
      case REFRESH_MAP:
        const { feature, condition } = action.payload;
        const updatedRefreshMap = { ...state.refreshMap };
        updatedRefreshMap[feature] = condition;
        return { ...state, refreshMap: updatedRefreshMap };
      case UPDATE_SEARCH_TABLE_INDEX:
        return { ...state, searchTableIndex: action.searchTableIndex }
      case SAVE_PATIENT_FILTER:
        return {
          ...state,
          patientFilter: action.patientFilter,
        };
      case GET_NOTIFICATIONS:
        const { uploadedPid, lastEventId, refresh, notificationAction } =
          action.payload;
        return {
          ...state,
          uploadedPid,
          lastEventId,
          refresh,
          notificationAction,
        };
      // -----> Delete after v1.0 <-----
      // case UPDATE_PATIENT_AIM_DELETE:
      //   let patientAimDelete = { ...state.patients };
      //   ({ aimRefs } = action);
      //   delete patientAimDelete[aimRefs.subjectID].studies[aimRefs.studyUID]
      //     .series[aimRefs.seriesUID].annotations[aimRefs.aimID];
      //   return { ...state, patient: patientAimDelete };
      // case UPDATE_PATIENT_AIM_SAVE:
      //   let patientAimSave = { ...state.patients };
      //   ({ aimRefs } = action);
      //   aimRefs = action.aimRefs;
      //   patientAimSave[aimRefs.patientID].studies[aimRefs.studyUID].series[
      //     aimRefs.seriesUID
      //   ].annotations[aimRefs.aimID] = { ...aimRefs };
      //   return { ...state, patient: patientAimSave };
      case CLEAR_AIMID:
        let aimIDClearedOpenSeries = _.cloneDeep(state.openSeries);
        let aimIDClearedOpenSeriesAddition = state.openSeriesAddition.map((serie) => {
          const newSerie = _.cloneDeep(serie);
          if (serie.imageAnnotations) {
            newSerie.imageAnnotations = { ...serie.imageAnnotations };
          }
          newSerie.aimID = null;
          return newSerie;
        });

        for (let serie of aimIDClearedOpenSeries) {
          serie.aimID = null;
        }
        return { ...state, openSeries: aimIDClearedOpenSeries, openSeriesAddition: aimIDClearedOpenSeriesAddition };
      case UPDATE_IMAGEID:
        let openSeriesToUpdate = _.cloneDeep(state.openSeries);
        const port = action.port || state.activePort;
        openSeriesToUpdate[port].imageID = action.imageID;
        return { ...state, openSeries: openSeriesToUpdate };
      case CLOSE_SERIE: // tested
        let delSeriesUID = state.openSeries[state.activePort].seriesUID;
        let delStudyUID = state.openSeries[state.activePort].studyUID;
        let delPID = state.openSeries[state.activePort].projectID;
        let delPatientID = state.openSeries[state.activePort].patientID || state.openSeries[state.activePort].subjectID;
        let delOpenStudiesAddition = _.cloneDeep(state.openSeriesAddition);
        delOpenStudiesAddition.splice(state.activePort, 1);
        const delAims = { ...state.aimsList };
        delete delAims[delSeriesUID];
        let delGrid = state.openSeries.slice(0, state.activePort);
        let delSubpath = state.openSeries.slice(0, state.activePort);
        delGrid = delGrid.concat(state.openSeries.slice(state.activePort + 1));
        delSubpath = delSubpath.concat(state.subpath.slice(state.activePort + 1));
        let shouldStudyExist = false;
        for (let item of delGrid) {
          if (item.studyUID === delStudyUID) {
            shouldStudyExist = true;
            break;
          }
        }

        let delActivePort;
        let delOtherSeriesAimsList = _.cloneDeep(state.otherSeriesAimsList);;
        let delSeriesData = _.cloneDeep(state.seriesData);
        if (delGrid.length === 0) {
          delActivePort = null;
          delOtherSeriesAimsList = {};
          delSeriesData = {};
        } else {
          delActivePort = delGrid.length - 1;
        }

        if (!shouldStudyExist) {
          if (delGrid.length > 0) {
            delete delOtherSeriesAimsList[delPID][delStudyUID];
            delete delSeriesData[delPID][delPatientID][delStudyUID];
          }
          return {
            ...state,
            openSeries: delGrid,
            aimsList: delAims,
            activePort: delActivePort,
            otherSeriesAimsList: delOtherSeriesAimsList,
            seriesData: delSeriesData,
            openSeriesAddition: delOpenStudiesAddition
          };
        }

        return {
          ...state,
          openSeries: delGrid,
          aimsList: delAims,
          // patients: delPatients,
          activePort: delActivePort,
          // otherSeriesAimsList: delOtherAims,
          subpath: delSubpath,
          openSeriesAddition: delOpenStudiesAddition
        };
      case LOAD_ANNOTATIONS:
        return Object.assign({}, state, {
          loading: true,

          error: false,
        });
      case LOAD_ANNOTATIONS_SUCCESS:
        return { ...state, loading: false };
      case VIEWPORT_FULL:
        const viewPortStatus = !state.showGridFullAlert;
        return { ...state, showGridFullAlert: viewPortStatus };
      case LOAD_SERIE_SUCCESS:
        let imageAddedSeries = _.cloneDeep(state.openSeriesAddition);
        let annCalc = Object.keys(action.payload.imageData);
        const { projectID: pidFromRef, studyUID: stUIDFromRef } = action.payload.ref;
        let latestOtherSeriesAimsList = _.cloneDeep(state.otherSeriesAimsList);
        if (latestOtherSeriesAimsList[pidFromRef])
          latestOtherSeriesAimsList[pidFromRef][stUIDFromRef] = action.payload.otherSeriesAimsData[pidFromRef][stUIDFromRef];
        else latestOtherSeriesAimsList[pidFromRef] = action.payload.otherSeriesAimsData[pidFromRef];

        let numberOfimageAnnotationsMap = {};
        if (pidFromRef && latestOtherSeriesAimsList[pidFromRef] && latestOtherSeriesAimsList[pidFromRef][stUIDFromRef]) {
          numberOfimageAnnotationsMap = latestOtherSeriesAimsList[pidFromRef][stUIDFromRef]
            .reduce((all, item, index) => {
              all[item[0]] = item[2].length;
              return all;
            }, {})
        }
        if (annCalc.length > 0) {
          for (let i = 0; i < imageAddedSeries.length; i++) {
            if (imageAddedSeries[i].seriesUID === action.payload.serID) {
              imageAddedSeries[i].imageAnnotations = action.payload.imageData;
              imageAddedSeries[i].frameData = action.payload.frameData;
              imageAddedSeries[i].numberOfAnnotations = numberOfimageAnnotationsMap[action.payload.ref.seriesUID] ? numberOfimageAnnotationsMap[action.payload.ref.seriesUID] : 0;
              if (!imageAddedSeries[i].numberOfImages) imageAddedSeries[i].numberOfImages = action.payload.ref.numberOfImages;
              if (!imageAddedSeries[i].seriesDescription) imageAddedSeries[i].seriesDescription = action.payload.ref.seriesDescription;
              if (!imageAddedSeries[i].seriesNo) imageAddedSeries[i].seriesNo = action.payload.ref.seriesNo;
            }
          }
        }
        for (let serie of imageAddedSeries) {
          if (serie.seriesUID !== action.payload.serID) {
            // serie.aimID = null;
          }
        }

        let jumpArr1 = []
        if (imageAddedSeries.aimID && imageAddedSeries.hasMultiframe && imageAddedSeries.multiframeMap) {
          const imgArr = imageAddedSeries.frameData[state.openSeries.aimID].split('/frames/');
          jumpArr = [imageAddedSeries.multiFrameMap[imgArr[0]], parseInt(imgArr[1] - 1)];
        }
        const newDataKeys = Object.keys(action.payload.aimsData);
        const stateKeys = state.aimsList[action.payload.serID]
          ? Object.keys(state.aimsList[action.payload.serID])
          : [];

        const colorAimsList =
          newDataKeys.length >= stateKeys.length
            ? persistColorInSaveAim(
              state.aimsList[action.payload.serID] || {},
              action.payload.aimsData,
              colors
            )
            : persistColorInDeleteAim(
              state.aimsList[action.payload.serID] || {},
              action.payload.aimsData,
              colors
            );

        // check if openSeries[activeport] is significant and teaching file 
        // if so check if seriesData is filled  // if not fill the data
        const { significanceOrder: order, template: tempCode } = state.openSeries[state.activePort];
        const seriesDataForTeaching = _.cloneDeep(state.seriesData);
        if (order && tempCode === teachingFileTempCode) {
          const seriesDataForTFProject = state.seriesData[pidFromRef]
          const seriesDataForTFPatient = seriesDataForTFProject && state.seriesData[pidFromRef][action.payload.ref.patientID]
          const seriesDataForTFStudy = seriesDataForTFPatient && state.seriesData[pidFromRef][action.payload.ref.studyUID];
          if (!seriesDataForTFStudy) {
            if (seriesDataForTFPatient)
              seriesDataForTeaching[pidFromRef][action.payload.ref.patientID] = { [action.payload.ref.studyUID]: action.payload.seriesOfStudy[action.payload.ref.studyUID] };
            else seriesDataForTeaching[pidFromRef] = { [action.payload.ref.patientID]: { [action.payload.ref.studyUID]: action.payload.seriesOfStudy[action.payload.ref.studyUID] } };
          }
        }

        const result = Object.assign({}, state, {
          loading: false,
          error: false,
          aimsList: {
            ...state.aimsList,
            [action.payload.ref.seriesUID]: colorAimsList,
          },
          otherSeriesAimsList: latestOtherSeriesAimsList,
          openSeriesAddition: imageAddedSeries,
          multiFrameAimJumpData: jumpArr1,
          seriesData: seriesDataForTeaching
        });
        return result;
      case LOAD_ANNOTATIONS_ERROR:
        return Object.assign({}, state, {
          loading: false,
          error: action.error,
        });
      case UPDATE_ANNOTATION_DISPLAY:
        let { patient, study, serie, annotation, isDisplayed } = action.payload;
        return Object.assign({}, state, {
          aimsList: {
            ...state.aimsList,
            [serie]: {
              ...state.aimsList[serie],
              [annotation]: {
                ...state.aimsList[serie][annotation],
                isDisplayed,
              },
            },
          },
        });

      case CHANGE_ACTIVE_PORT:
        //get openseries iterate over the
        const changedPortSeriesAddition = state.openSeriesAddition.map((serie) => {
          const newSerie = _.cloneDeep(serie);
          newSerie.aimID = null;
          return newSerie;
        });

        const changedPortSeries = _.cloneDeep(state.openSeries);
        for (let i = 0; i < changedPortSeries.length; i++) {
          if (i !== action.portIndex) {
            changedPortSeries[i].aimID = null;
          }
        }

        return Object.assign({}, state, {
          activePort: action.portIndex,
          openSeriesAddition: changedPortSeriesAddition,
          openSeries: changedPortSeries
        });

      case TOGGLE_ALL_ANNOTATIONS:
        //update openSeries
        let { seriesUID, displayStatus } = action.payload;
        let toggleAnns = Object.assign({}, state.aimsList);
        for (let ann in toggleAnns[seriesUID]) {
          toggleAnns[seriesUID][ann].isDisplayed = displayStatus;
        }
        return Object.assign({}, state, {
          aimsList: toggleAnns,
        });
      case TOGGLE_ALL_LABELS:
        const toggledLabelSerie = { ...state.aimsList };
        const anns = toggledLabelSerie[action.payload.serieID];
        const studyAims = {};
        for (let ann in anns) {
          anns[ann].showLabel = action.payload.checked;
          if (anns[ann].type === 'study') {
            if (studyAims[ann]) delete studyAims[ann];
            else studyAims[ann] = true;
          }
        }
        if (Object.keys(studyAims).length > 0) {
          const ids = Object.keys(studyAims);
          for (let series in toggledLabelSerie) {
            if (series !== action.payload.serieID) {
              for (let id of ids) {
                toggledLabelSerie[series][id].showLabel = action.payload.checked;
              }
            }
          }
        }
        return Object.assign({}, state, { aimsList: toggledLabelSerie });

      case TOGGLE_LABEL:
        const singleLabelToggled = { ...state.aimsList };
        // if type is study
        if (singleLabelToggled[action.payload.serieID][action.payload.aimID].type === 'study') {
          const allSeries = Object.values(singleLabelToggled);
          const allSeriesIDs = Object.keys(singleLabelToggled);
          allSeries.forEach((series, i) => {
            const currentStatus = series[action.payload.aimID].showLabel;
            series[action.payload.aimID].showLabel = !currentStatus;
            singleLabelToggled[allSeriesIDs[i]] = series;
          })
        } else {
          const ann = singleLabelToggled[action.payload.serieID][action.payload.aimID];
          ann.showLabel = !ann.showLabel
        }
        return Object.assign({}, state, { aimsList: singleLabelToggled });
      case CLEAR_GRID:
        const clearedPatients = {};
        let selectionObj = [];
        if (Object.keys(state.selectedStudies).length > 0) {
          selectionObj = { ...state.selectedStudies };
        } else if (Object.keys(state.selectedSeries).length > 0) {
          selectionObj = { ...state.selectedSeries };
        } else {
          selectionObj = { ...state.selectedAnnotations };
        }
        //keep the patient if already there
        // for (let item in selectionObj) {
        //   if (state.patients[item.patientID]) {
        //     clearedPatients[item.patientID] = {
        //       ...state.patients[item.patientID]
        //     };
        //   }
        // }
        //update the state as not displayed
        for (let patient in clearedPatients) {
          for (let study in clearedPatients[patient]) {
            for (let serie in clearedPatients[patient].studies[study]) {
              serie.isDisplayed = false;
              for (let ann in clearedPatients[patient].studies[study].series[
                serie
              ]) {
                ann.isDisplayed = false;
              }
            }
          }
        }

        return {
          ...state,
          openSeries: [],
          aimsList: {},
          activePort: 0,
          seriesData: {},
          openSeriesAddition: []
        };
      case CLEAR_SELECTION:
        let selectionState = { ...state };
        if (action.selectionType === "annotation") {
          selectionState.selectedSeries = {};
          selectionState.selectedStudies = {};
          selectionState.selectedPatients = {};
          selectionState.selectedProject = null;
        } else if (action.selectionType === "serie") {
          selectionState.selectedAnnotations = {};
          selectionState.selectedStudies = {};
          selectionState.selectedPatients = {};
          selectionState.selectedProject = null;
        } else if (action.selectionType === "study") {
          selectionState.selectedAnnotations = {};
          selectionState.selectedSeries = {};
          selectionState.selectedPatients = {};
          selectionState.selectedProject = null;
        } else if (action.selectionType === "patient") {
          selectionState.selectedAnnotations = {};
          selectionState.selectedSeries = {};
          selectionState.selectedStudies = {};
          selectionState.selectedProject = null;
        } else {
          selectionState.selectedAnnotations = {};
          selectionState.selectedSeries = {};
          selectionState.selectedStudies = {};
          selectionState.selectedPatients = {};
          selectionState.selectedProject = null;
        }
        return selectionState;
      case SELECT_PATIENT:
        let patientsNew = {
          ...state.selectedPatients,
        };
        patientsNew[action.patient.patientID]
          ? delete patientsNew[action.patient.patientID]
          : (patientsNew[action.patient.patientID] = action.patient);
        return { ...state, selectedPatients: patientsNew };
      case SELECT_STUDY:
        let newStudies = {
          ...state.selectedStudies,
        };
        newStudies[action.study.studyUID]
          ? delete newStudies[action.study.studyUID]
          : (newStudies[action.study.studyUID] = action.study);
        return { ...state, selectedStudies: newStudies };
      case SELECT_PROJECT:
        return { ...state, selectedProject: action.projectID };
      case LOAD_COMPLETED:
        return { ...state, loading: false };
      case SELECT_SERIE:
        let newSeries = {
          ...state.selectedSeries,
        };
        newSeries[action.serie.seriesUID]
          ? delete newSeries[action.serie.seriesUID]
          : (newSeries[action.serie.seriesUID] = action.serie);
        // state.selectedStudies.concat([action.study]);
        return { ...state, selectedSeries: newSeries };
      case SELECT_ANNOTATION:
        let newAnnotations = {
          ...state.selectedAnnotations,
        };
        newAnnotations[action.annotation.aimID]
          ? delete newAnnotations[action.annotation.aimID]
          : (newAnnotations[action.annotation.aimID] = action.annotation);

        return { ...state, selectedAnnotations: newAnnotations };
      // -----> Delete after v1.0 <-----
      // case LOAD_PATIENT:
      //   return { ...state, patientLoading: true };
      // case LOAD_PATIENT_ERROR:
      //   return {
      //     ...state,
      //     patientLoadingError: action.err,
      //     patientLoading: false
      //   };
      // case LOAD_PATIENT_SUCCESS:
      //   let addedNewPatient = { ...state.patients };
      //   addedNewPatient[action.patient.patientID] = action.patient;
      //   return {
      //     ...state,
      //     patients: addedNewPatient,
      //     patientLoading: false,
      //     patientLoadingError: false
      //   };
      case ADD_TO_GRID:
        const seriesInfo = { ...action.reference };
        const { projectMap } = state;
        if (projectMap[seriesInfo.projectID]) {
          seriesInfo.projectName = projectMap[seriesInfo.projectID].projectName;
          seriesInfo.defaultTemplate =
            projectMap[seriesInfo.projectID].defaultTemplate;
        } else {
          seriesInfo.projectName = "lite";
          seriesInfo.defaultTemplate = null;
        }
        const arePortsOccupied = action.port !== undefined && typeof action.port === 'number';
        let newOpenSeries = [...state.openSeries];
        let newOpenSeriesAddtition = _.cloneDeep(state.openSeriesAddition);

        if (arePortsOccupied) {
          newOpenSeries[action.port] = seriesInfo;
          newOpenSeriesAddtition[action.port] = seriesInfo;
        } else {
          newOpenSeries = newOpenSeries.concat([seriesInfo]);
          newOpenSeriesAddtition = newOpenSeriesAddtition.concat([seriesInfo]);
        }

        const newActivePort = arePortsOccupied ? state.activePort : newOpenSeries.length - 1;
        return {
          ...state,
          openSeries: newOpenSeries,
          activePort: newActivePort,
          openSeriesAddition: newOpenSeriesAddtition
        };

      case REPLACE_IN_GRID:
        const replacedOpenSeries = [...state.openSeries];
        const newAimsList = { ...state.aimsList };
        delete newAimsList[replacedOpenSeries[state.activePort].seriesUID];
        replacedOpenSeries[state.activePort].seriesUID = action.payload.seriesUID;
        replacedOpenSeries[state.activePort].examType = action.payload.examType;
        const replacedOpenSeriesAddition = _.cloneDeep(state.openSeriesAddition);
        replacedOpenSeriesAddition[state.activePort].seriesUID = action.payload.seriesUID;
        replacedOpenSeriesAddition[state.activePort].examType = action.payload.examType;
        return {
          ...state,
          openSeries: replacedOpenSeries,
          aimsList: newAimsList,
          openSeriesAddition: replacedOpenSeriesAddition
        };

      // -----> Delete after v1.0 <-----
      // case UPDATE_PATIENT:
      //   let updatedPt = { ...state.patients[action.payload.patient] };
      //   if (action.payload.type === 'study') {
      //     let selectedSt = updatedPt.studies[action.payload.study];
      //     for (let serie in selectedSt.series) {
      //       selectedSt.series[serie].isDisplayed = action.payload.status;
      //     }
      //   } else if (
      //     action.payload.type === 'serie' ||
      //     action.payload.type === 'annotation'
      //   ) {
      //     let selectedSr =
      //       updatedPt.studies[action.payload.study].series[
      //         action.payload.serie
      //       ];
      //     selectedSr.isDisplayed = action.payload.status;
      //     for (let ann in selectedSr.annotations) {
      //       selectedSr.annotations[ann].isDisplayed = action.payload.status;
      //     }
      //   }
      //   let updatedPtPatients = { ...state.patients };
      //   updatedPtPatients[action.payload.patient] = updatedPt;
      //   return { ...state, patients: updatedPtPatients };
      case JUMP_TO_AIM:
        let { aimID, index } = action.payload;
        let serUID = action.payload.seriesUID;
        let updatedGrid = _.cloneDeep(state.openSeries)
        let updatedOpenSeriesAddition = _.cloneDeep(state.openSeriesAddition);
        updatedGrid[index].aimID = aimID;
        updatedOpenSeriesAddition[index].aimID = aimID;

        // return { ...state, openSeries: updatedGrid, aimsList: {...state.aimsList} };
        return Object.assign({}, state, {
          activePort: index,
          openSeries: updatedGrid,
          openSeriesAddition: updatedOpenSeriesAddition,
          aimsList: {
            ...state.aimsList,
            [serUID]: {
              ...state.aimsList[serUID],
              [aimID]: {
                ...state.aimsList[serUID][aimID],
                isDisplayed: true,
              },
            },
          },
        });
      case GET_PROJECT_MAP:
        return {
          ...state,
          projectMap: action.projectMap,
        };
      case SET_SEG_LABEL_MAP_INDEX: {
        const { aimID, labelMapIndex } = action.payload;
        return {
          ...state,
          aimSegLabelMaps: { ...state.aimSegLabelMaps, [aimID]: labelMapIndex },
        };
      }
      case GET_TEMPLATES:
        return { ...state, templates: action.templates };
      case SEG_UPLOAD_STARTED: {
        let segUid = action.payload;
        return Object.assign({}, state, {
          isSegUploaded: { ...state.isSegUploaded, [segUid]: false },
        });
      }
      case SEG_UPLOAD_COMPLETED: {
        let segUid = action.payload;
        return Object.assign({}, state, {
          isSegUploaded: { ...state.isSegUploaded, [segUid]: true },
        });
      }
      case SEG_UPLOAD_REMOVE: {
        let segUid = action.payload;
        const { [segUid]: value, ...theRest } = state.isSegUploaded;
        return Object.assign({}, state, {
          isSegUploaded: { ...theRest },
        });
      }
      case AIM_DELETE: { //tested
        const { aimRefs } = action.payload;
        const { seriesUID, studyUID, projectID, aimID } = aimRefs;
        const deepOther = _.cloneDeep(state.otherSeriesAimsList);
        const projectAims = deepOther[projectID];
        const deepOtherArrValues = projectAims ? Object.values(projectAims[studyUID]) : null;
        let serieToUpdateIndex;
        const newOpenSeriesAddition = _.cloneDeep(state.openSeriesAddition);
        const serieToUpdate = newOpenSeriesAddition.find((serie, index) => {
          if (serie.seriesUID === seriesUID) {
            serieToUpdateIndex = index;
            return serie.seriesUID;
          }
          return undefined;
        });
        const updatedSerie = { ...serieToUpdate };
        const { imageAnnotations } = updatedSerie;
        Object.entries(imageAnnotations).forEach(([key, value]) => {
          let i = value.length;
          while (i--) {
            const ann = value[i];
            if (ann.aimUid === aimRefs.aimID) value.splice(i, 1);
          }
        });

        if (deepOtherArrValues) {
          deepOtherArrValues.forEach((el => {
            if (el[aimRefs.aimID]) delete el[aimRefs.aimID];
          }))

          let reformedOtherSeries = deepOtherArrValues.reduce((all, item, index) => {
            if (item[0] === seriesUID) {
              let aimIndex = -1;
              for (let i = 0; i < item[2].length; i++) {
                if (item[2][i].aimID === aimID) {
                  aimIndex = i;
                  break;
                }
              }
              if (aimIndex > -1) {
                item[2].splice(aimIndex, 1);
              }
            }
            all[index] = item;
            return all;
          }, []);

          if (reformedOtherSeries[serieToUpdateIndex] && reformedOtherSeries[serieToUpdateIndex][2] && reformedOtherSeries[serieToUpdateIndex][2].length === 0) {
            updatedSerie.numberOfAnnotations = 0;
            if (deepOther[projectID][studyUID].length === 1) {
              delete deepOther[projectID][studyUID];
            } else {
              const arr1 = deepOther[projectID][studyUID].slice(0, serieToUpdateIndex + 1);
              const arr2 = deepOther[projectID][studyUID].slice(serieToUpdateIndex + 1);
              reformedOtherSeries = arr1.concat(arr2);
              deepOther[projectID][studyUID] = reformedOtherSeries;
            }
          }
          newOpenSeriesAddition[serieToUpdateIndex] = updatedSerie;
        }
        return { ...state, openSeriesAddition: newOpenSeriesAddition, otherSeriesAimsList: deepOther };
      }
      default:
        return state;
    }
  } catch (err) {
    console.error(err);
    return state;
  }
};

export default asyncReducer;
