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
  CLEAR_ACTIVE_AIMID,
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
  colors,
  commonLabels,
} from "./types";
import {
  persistColorInSaveAim,
  persistColorInDeleteAim,
} from "../../Utils/aid";
import { MdSatellite } from "react-icons/md";
const initialState = {
  openSeries: [],
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
  openStudies: {},
  searchTableIndex: 0,
  otherSeriesAimsList: {},
  refreshMap: {},
  subpath: []
};

const asyncReducer = (state = initialState, action) => {
  try {
    let aimIDClearedOPenSeries = [];
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
      case CHECK_MULTIFRAME:
        const series = _.cloneDeep(state.openSeries);
        series[state.activePort].hasMultiframe = action.payload.hasMultiframe;
        series[state.activePort].multiFrameIndex = action.payload.multiframeIndex;
        return { ...state, openSeries: series };
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
        aimIDClearedOPenSeries = state.openSeries.map((serie) => {
          const newSerie = { ...serie };
          if (serie.imageAnnotations) {
            newSerie.imageAnnotations = { ...serie.imageAnnotations };
          }
          return newSerie;
        });
        for (let serie of aimIDClearedOPenSeries) {
          serie.aimID = null;
        }

        return { ...state, openSeries: aimIDClearedOPenSeries };
      case CLEAR_ACTIVE_AIMID:
        aimIDClearedOPenSeries = state.openSeries.map((serie) => {
          const newSerie = { ...serie };
          if (serie.imageAnnotations) {
            newSerie.imageAnnotations = { ...serie.imageAnnotations };
          }
          return newSerie;
        });
        aimIDClearedOPenSeries[state.activePort].aimID = null;

        return { ...state, openSeries: aimIDClearedOPenSeries };
      case UPDATE_IMAGEID:
        const openSeriesToUpdate = state.openSeries.map((serie) => {
          const newSerie = { ...serie };
          if (serie.imageAnnotations) {
            newSerie.imageAnnotations = { ...serie.imageAnnotations };
          }
          return newSerie;
        });
        const port = action.port || state.activePort;
        openSeriesToUpdate[port].imageID = action.imageID;

        return { ...state, openSeries: openSeriesToUpdate };
      case CLOSE_SERIE: // tested
        let delSeriesUID = state.openSeries[state.activePort].seriesUID;
        let delStudyUID = state.openSeries[state.activePort].studyUID;
        let delOpenStudies = { ...state.openStudies };
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
        let delOtherSeriesAimsList;
        if (delGrid.length === 0) {
          delActivePort = null;
          delOtherSeriesAimsList = {};
        } else {
          delActivePort = delGrid.length - 1;
        }

        if (!shouldStudyExist) {
          delete delOpenStudies[delStudyUID];
          return {
            ...state,
            openSeries: delGrid,
            aimsList: delAims,
            openStudies: delOpenStudies,
            activePort: delActivePort,
            otherSeriesAimsList: delOtherSeriesAimsList,
          };
        }

        return {
          ...state,
          openSeries: delGrid,
          aimsList: delAims,
          // patients: delPatients,
          activePort: delActivePort,
          // otherSeriesAimsList: delOtherAims,
          subpath: delSubpath
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
        let imageAddedSeries = state.openSeries.map((serie) => {
          const newSerie = { ...serie };
          if (serie.imageAnnotations) {
            newSerie.imageAnnotations = { ...serie.imageAnnotations };
          }
          return newSerie;
        });
        let annCalc = Object.keys(action.payload.imageData);
        if (annCalc.length > 0) {
          for (let i = 0; i < imageAddedSeries.length; i++) {
            if (imageAddedSeries[i].seriesUID === action.payload.serID) {
              imageAddedSeries[i].imageAnnotations = action.payload.imageData;
              if (!imageAddedSeries[i].numberOfAnnotations) imageAddedSeries[i].numberOfAnnotations = action.payload.ref.numberOfAnnotations;
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
        const oldStudySeries = _.cloneDeep(state.openStudies);
        const newStudySeries = { ...oldStudySeries, ...action.payload.seriesOfStudy };
        // const serArr = Object.values(action.payload.seriesOfStudy);
        // serArr.forEach(el => {

        // });
        const result = Object.assign({}, state, {
          loading: false,
          error: false,
          aimsList: {
            ...state.aimsList,
            [action.payload.ref.seriesUID]: colorAimsList,
          },
          otherSeriesAimsList: { ...state.otherSeriesAimsList, ...action.payload.otherSeriesAimsData },
          openSeries: imageAddedSeries,
          openStudies: newStudySeries
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
        const changedPortSeries = state.openSeries.map((serie) => {
          const newSerie = { ...serie };
          if (serie.imageAnnotations) {
            newSerie.imageAnnotations = { ...serie.imageAnnotations };
          }
          return newSerie;
        });
        for (let i = 0; i < changedPortSeries.length; i++) {
          if (i !== action.portIndex) {
            changedPortSeries[i].aimID = null;
          }
        }

        return Object.assign({}, state, {
          activePort: action.portIndex,
          openSeries: changedPortSeries,
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
          openStudies: {}
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

        if (arePortsOccupied) newOpenSeries[action.port] = seriesInfo;
        else newOpenSeries = newOpenSeries.concat([seriesInfo]);

        const newActivePort = arePortsOccupied ? state.activePort : newOpenSeries.length - 1;
        return {
          ...state,
          openSeries: newOpenSeries,
          activePort: newActivePort
        };

      case REPLACE_IN_GRID:
        const replacedOpenSeries = [...state.openSeries];
        const newAimsList = { ...state.aimsList };
        delete newAimsList[replacedOpenSeries[state.activePort].seriesUID];
        replacedOpenSeries[state.activePort].seriesUID = action.payload.seriesUID;
        replacedOpenSeries[state.activePort].examType = action.payload.examType;
        return {
          ...state,
          openSeries: replacedOpenSeries,
          aimsList: newAimsList
        };

      case ADD_STUDY_TO_GRID:
        const newStudy = { ...action.seriesOfStudy };
        let newOpenStudies = { ...state.openStudies, ...newStudy };
        return {
          ...state,
          openStudies: newOpenStudies
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
        let updatedGrid = state.openSeries.map((serie) => {
          const newSerie = { ...serie };
          if (serie.imageAnnotations) {
            newSerie.imageAnnotations = { ...serie.imageAnnotations };
          }
          return newSerie;
        });
        updatedGrid[index].aimID = aimID;

        // return { ...state, openSeries: updatedGrid, aimsList: {...state.aimsList} };
        return Object.assign({}, state, {
          activePort: index,
          openSeries: updatedGrid,
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
        const { seriesUID } = aimRefs;
        const deepOther = _.cloneDeep(state.otherSeriesAimsList);
        const deepOtherArrKeys = Object.keys(deepOther);
        const deepOtherArrValues = Object.values(deepOther);
        let serieToUpdateIndex;
        const newOpenSeries = [...state.openSeries];
        const serieToUpdate = newOpenSeries.find((serie, index) => {
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

        deepOtherArrValues.forEach((el => {
          if (el[aimRefs.aimID]) delete el[aimRefs.aimID];
        }))

        const reformedOtherSeries = deepOtherArrKeys.reduce((all, item, index) => {
          all[item] = deepOtherArrValues[index];
          return all;
        }, {});

        newOpenSeries[serieToUpdateIndex] = updatedSerie;
        return { ...state, openSeries: [...newOpenSeries], otherSeriesAimsList: reformedOtherSeries };
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
