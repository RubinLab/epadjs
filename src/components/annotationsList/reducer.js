import {
  LOAD_ANNOTATIONS_ERROR,
  LOAD_PATIENT,
  LOAD_PATIENT_SUCCESS,
  LOAD_PATIENT_ERROR,
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
  UPDATE_PATIENT,
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
  colors,
  commonLabels
} from './types';
import {
  persistColorInSaveAim,
  persistColorInDeleteAim
} from '../../Utils/aid';
import { MdSatellite } from 'react-icons/md';
const initialState = {
  openSeries: [],
  aimsList: {},
  activePort: null,
  loading: false,
  error: false,
  patients: {},
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
  notificationAction: '',
  reports: [],
  isSegUploaded: {},
  patientFilter: {}
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

      case SAVE_PATIENT_FILTER:
        return {
          ...state,
          patientFilter: action.patientFilter
        };
      case UPDATE_IMAGE_INDEX:
        const updatedOpenSeries = state.openSeries.map(serie => {
          const newSerie = { ...serie };
          if (serie.imageAnnotations) {
            newSerie.imageAnnotations = { ...serie.imageAnnotations };
          }
          return newSerie;
        });

        updatedOpenSeries[state.activePort].imageIndex = action.imageIndex;
        return { ...state, openSeries: updatedOpenSeries };
      case GET_NOTIFICATIONS:
        const {
          uploadedPid,
          lastEventId,
          refresh,
          notificationAction
        } = action.payload;
        return {
          ...state,
          uploadedPid,
          lastEventId,
          refresh,
          notificationAction
        };
      case UPDATE_PATIENT_AIM_DELETE:
        let patientAimDelete = { ...state.patients };
        ({ aimRefs } = action);
        delete patientAimDelete[aimRefs.subjectID].studies[aimRefs.studyUID]
          .series[aimRefs.seriesUID].annotations[aimRefs.aimID];
        return { ...state, patient: patientAimDelete };
      case UPDATE_PATIENT_AIM_SAVE:
        let patientAimSave = { ...state.patients };
        ({ aimRefs } = action);
        aimRefs = action.aimRefs;
        patientAimSave[aimRefs.patientID].studies[aimRefs.studyUID].series[
          aimRefs.seriesUID
        ].annotations[aimRefs.aimID] = { ...aimRefs };
        return { ...state, patient: patientAimSave };
      case CLEAR_AIMID:
        aimIDClearedOPenSeries = state.openSeries.map(serie => {
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
        aimIDClearedOPenSeries = state.openSeries.map(serie => {
          const newSerie = { ...serie };
          if (serie.imageAnnotations) {
            newSerie.imageAnnotations = { ...serie.imageAnnotations };
          }
          return newSerie;
        });
        aimIDClearedOPenSeries[state.activePort].aimID = null;

        return { ...state, openSeries: aimIDClearedOPenSeries };
      case UPDATE_IMAGEID:
        const openSeriesToUpdate = state.openSeries.map(serie => {
          const newSerie = { ...serie };
          if (serie.imageAnnotations) {
            newSerie.imageAnnotations = { ...serie.imageAnnotations };
          }
          return newSerie;
        });
        openSeriesToUpdate[state.activePort].imageID = action.imageID;

        return { ...state, openSeries: openSeriesToUpdate };
      case CLOSE_SERIE:
        let delSeriesUID = state.openSeries[state.activePort].seriesUID;
        let delStudyUID = state.openSeries[state.activePort].studyUID;
        let delPatientID = state.openSeries[state.activePort].patientID;
        const delAims = { ...state.aimsList };
        delete delAims[delSeriesUID];
        let delGrid = state.openSeries.slice(0, state.activePort);
        delGrid = delGrid.concat(state.openSeries.slice(state.activePort + 1));
        let shouldPatientExist = false;
        for (let item of delGrid) {
          if (item.patientID === delPatientID) {
            shouldPatientExist = true;
            break;
          }
        }
        // const delPatients = { ...state.patients };
        // if (shouldPatientExist) {
        //   delPatients[delPatientID].studies[delStudyUID].series[
        //     delSeriesUID
        //   ].isDisplayed = false;
        // } else {
        //   delete delPatients[delPatientID];
        // }
        let delActivePort;
        if (delGrid.length === 0) {
          delActivePort = null;
        } else {
          delActivePort = delGrid.length - 1;
        }

        return {
          ...state,
          openSeries: delGrid,
          aimsList: delAims,
          // patients: delPatients,
          activePort: delActivePort
        };
      case VIEWPORT_FULL:
        const viewPortStatus = !state.showGridFullAlert;
        return { ...state, showGridFullAlert: viewPortStatus };
      case LOAD_SERIE_SUCCESS:
        let imageAddedSeries = state.openSeries.map(serie => {
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
            }
          }
        }
        for (let serie of imageAddedSeries) {
          if (serie.seriesUID !== action.payload.serID) {
            serie.aimID = null;
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

        const result = Object.assign({}, state, {
          loading: false,
          error: false,
          aimsList: {
            ...state.aimsList,
            [action.payload.ref.seriesUID]: colorAimsList
          },
          openSeries: imageAddedSeries
        });
        return result;
      case LOAD_ANNOTATIONS_ERROR:
        return Object.assign({}, state, {
          loading: false,
          error: action.error
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
                isDisplayed
              }
            }
          }
        });

      case CHANGE_ACTIVE_PORT:
        //get openseries iterate over the
        const changedPortSeries = state.openSeries.map(serie => {
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
          aimsList: toggleAnns
        });
      case TOGGLE_ALL_LABELS:
        const toggledLabelSerie = { ...state.aimsList };
        const anns = toggledLabelSerie[action.payload.serieID];
        for (let ann in anns) {
          anns[ann].showLabel = action.payload.checked;
        }
        return Object.assign({}, state, { aimsList: toggledLabelSerie });

      case TOGGLE_LABEL:
        const singleLabelToggled = { ...state.aimsList };
        const allAnns = singleLabelToggled[action.payload.serieID];
        for (let ann in allAnns) {
          if (ann === action.payload.aimID) {
            const currentStatus = allAnns[ann].showLabel;
            allAnns[ann].showLabel = !currentStatus;
          }
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
        for (let item in selectionObj) {
          if (state.patients[item.patientID]) {
            clearedPatients[item.patientID] = {
              ...state.patients[item.patientID]
            };
          }
        }
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
          patients: clearedPatients,
          openSeries: [],
          aimsList: {},
          activePort: 0
        };
      case CLEAR_SELECTION:
        let selectionState = { ...state };
        if (action.selectionType === 'annotation') {
          selectionState.selectedSeries = {};
          selectionState.selectedStudies = {};
          selectionState.selectedPatients = {};
          selectionState.selectedProject = null;
        } else if (action.selectionType === 'serie') {
          selectionState.selectedAnnotations = {};
          selectionState.selectedStudies = {};
          selectionState.selectedPatients = {};
          selectionState.selectedProject = null;
        } else if (action.selectionType === 'study') {
          selectionState.selectedAnnotations = {};
          selectionState.selectedSeries = {};
          selectionState.selectedPatients = {};
          selectionState.selectedProject = null;
        } else if (action.selectionType === 'patient') {
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
          ...state.selectedPatients
        };
        patientsNew[action.patient.patientID]
          ? delete patientsNew[action.patient.patientID]
          : (patientsNew[action.patient.patientID] = action.patient);
        return { ...state, selectedPatients: patientsNew };
      case SELECT_STUDY:
        let newStudies = {
          ...state.selectedStudies
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
          ...state.selectedSeries
        };
        newSeries[action.serie.seriesUID]
          ? delete newSeries[action.serie.seriesUID]
          : (newSeries[action.serie.seriesUID] = action.serie);
        // state.selectedStudies.concat([action.study]);
        return { ...state, selectedSeries: newSeries };
      case SELECT_ANNOTATION:
        let newAnnotations = {
          ...state.selectedAnnotations
        };
        newAnnotations[action.annotation.aimID]
          ? delete newAnnotations[action.annotation.aimID]
          : (newAnnotations[action.annotation.aimID] = action.annotation);

        return { ...state, selectedAnnotations: newAnnotations };
      case LOAD_PATIENT:
        return { ...state, patientLoading: true };
      case LOAD_PATIENT_ERROR:
        return {
          ...state,
          patientLoadingError: action.err,
          patientLoading: false
        };
      case LOAD_PATIENT_SUCCESS:
        let addedNewPatient = { ...state.patients };

        addedNewPatient[action.patient.patientID] = action.patient;
        return {
          ...state,
          patients: addedNewPatient,
          patientLoading: false,
          patientLoadingError: false
        };
      // case DISPLAY_SINGLE_AIM:
      //   let aimPatient = { ...state.patients[action.payload.patientID] };
      //   let aimOpenSeries = state.openSeries.map((serie) => {
      //     const newSerie = { ...serie };
      //     if (serie.imageAnnotations) {
      //       newSerie.imageAnnotations = { ...serie.imageAnnotations };
      //     }
      //     return newSerie;
      //   });
      //   let aimAimsList = { ...state.aimsList[action.payload.seriesUID] };
      //   //update patient data
      //   for (let stItem in aimPatient.studies) {
      //     if (stItem === action.payload.studyUID) {
      //       for (let srItem in aimPatient.studies[stItem].series) {
      //         if (srItem === action.payload.seriesUID) {
      //           for (let annItem in aimPatient.studies[stItem].series[srItem]
      //             .annotations) {
      //             if (annItem === action.payload.aimID) {
      //               aimPatient.studies[stItem].series[srItem].annotations[
      //                 annItem
      //               ].isDisplayed = true;
      //             } else {
      //               aimPatient.studies[stItem].series[srItem].annotations[
      //                 annItem
      //               ].isDisplayed = false;
      //             }
      //           }
      //         }
      //       }
      //     }
      //   }
      //   //update aimsList data
      //   let allAims = Object.keys(
      //     aimPatient.studies[action.payload.studyUID].series[
      //       action.payload.seriesUID
      //     ].annotations
      //   );

      //   allAims.forEach((ann) => {
      //     if (ann === action.payload.aimID) {
      //       aimAimsList[ann].isDisplayed = true;
      //       aimAimsList[ann].showLabel = true;
      //     } else {
      //       aimAimsList[ann].isDisplayed = false;
      //       aimAimsList[ann].showLabel = false;
      //     }
      //   });
      //   //update Openseries data
      //   aimOpenSeries[action.payload.index].aimID = action.payload.aimID;

      //   return {
      //     ...state,
      //     aimsList: {
      //       ...state.aimsList,
      //       [action.payload.seriesUID]: aimAimsList,
      //     },
      //     patients: {
      //       ...state.patients,
      //       [action.payload.patientID]: aimPatient,
      //     },
      //     openSeries: aimOpenSeries,
      //   };
      case ADD_TO_GRID:
        const seriesInfo = { ...action.reference };
        const { projectMap } = state;
        if (projectMap[seriesInfo.projectID]) {
          seriesInfo.projectName = projectMap[seriesInfo.projectID].projectName;
          seriesInfo.defaultTemplate =
            projectMap[seriesInfo.projectID].defaultTemplate;
        } else {
          seriesInfo.projectName = 'lite';
          seriesInfo.defaultTemplate = null;
        }
        let newOpenSeries = state.openSeries.concat(seriesInfo);

        return {
          ...state,
          openSeries: newOpenSeries,
          activePort: newOpenSeries.length - 1
        };
      case UPDATE_PATIENT:
        let updatedPt = { ...state.patients[action.payload.patient] };
        if (action.payload.type === 'study') {
          let selectedSt = updatedPt.studies[action.payload.study];
          for (let serie in selectedSt.series) {
            selectedSt.series[serie].isDisplayed = action.payload.status;
          }
        } else if (
          action.payload.type === 'serie' ||
          action.payload.type === 'annotation'
        ) {
          let selectedSr =
            updatedPt.studies[action.payload.study].series[
              action.payload.serie
            ];
          selectedSr.isDisplayed = action.payload.status;
          for (let ann in selectedSr.annotations) {
            selectedSr.annotations[ann].isDisplayed = action.payload.status;
          }
        }
        let updatedPtPatients = { ...state.patients };
        updatedPtPatients[action.payload.patient] = updatedPt;
        return { ...state, patients: updatedPtPatients };
      case JUMP_TO_AIM:
        let { aimID, index } = action.payload;
        let serUID = action.payload.seriesUID;
        let updatedGrid = state.openSeries.map(serie => {
          const newSerie = { ...serie };
          if (serie.imageAnnotations) {
            newSerie.imageAnnotations = { ...serie.imageAnnotations };
          }
          return newSerie;
        });
        updatedGrid[index].aimID = aimID;

        // return { ...state, openSeries: updatedGrid, aimsList: {...state.aimsList} };
        return Object.assign({}, state, {
          openSeries: updatedGrid,
          aimsList: {
            ...state.aimsList,
            [serUID]: {
              ...state.aimsList[serUID],
              [aimID]: {
                ...state.aimsList[serUID][aimID],
                isDisplayed: true
              }
            }
          }
        });
      case GET_PROJECT_MAP:
        return {
          ...state,
          projectMap: action.projectMap
        };
      case SET_SEG_LABEL_MAP_INDEX: {
        const { aimID, labelMapIndex } = action.payload;
        return {
          ...state,
          aimSegLabelMaps: { ...state.aimSegLabelMaps, [aimID]: labelMapIndex }
        };
      }
      case GET_TEMPLATES:
        return { ...state, templates: action.templates };
      case SEG_UPLOAD_STARTED: {
        let segUid = action.payload;
        return Object.assign({}, state, {
          isSegUploaded: { ...state.isSegUploaded, [segUid]: false }
        });
      }
      case SEG_UPLOAD_COMPLETED: {
        let segUid = action.payload;
        return Object.assign({}, state, {
          isSegUploaded: { ...state.isSegUploaded, [segUid]: true }
        });
      }
      case SEG_UPLOAD_REMOVE: {
        let segUid = action.payload;
        const { [segUid]: value, ...theRest } = state.isSegUploaded;
        return Object.assign({}, state, {
          isSegUploaded: { ...theRest }
        });
      }
      case AIM_DELETE: {
        const { aimRefs } = action.payload;
        const { seriesUID } = aimRefs;
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
        newOpenSeries[serieToUpdateIndex] = updatedSerie;
        return { ...state, openSeries: [...newOpenSeries] };
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
