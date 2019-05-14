import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
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
  SHOW_ANNOTATION_DOCK,
  OPEN_PROJECT_MODAL,
  CLEAR_GRID,
  CLEAR_SELECTION,
  SELECT_SERIE,
  SELECT_STUDY,
  SELECT_PATIENT,
  GET_PATIENT,
  SELECT_ANNOTATION,
  LOAD_COMPLETED,
  START_LOADING,
  ADD_TO_GRID,
  DISPLAY_SINGLE_AIM,
  JUMP_TO_AIM,
  UPDATE_PATIENT,
  CLOSE_SERIE
} from "./types";
const initialState = {
  openSeries: [],
  aimsList: {},
  activePort: null,
  loading: false,
  error: false,
  patients: {},
  listOpen: false,
  dockOpen: false,
  showGridFullAlert: false,
  showProjectModal: false,
  selectedProjects: {},
  selectedPatients: {},
  selectedStudies: {},
  selectedSeries: {},
  selectedAnnotations: {},
  patientLoading: false,
  patientLoadingError: null
};

const asyncReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLOSE_SERIE:
      let delSeriesUID = action.payload.serie.seriesUID;
      let delStudyUID = action.payload.serie.studyUID;
      let delPatientID = action.payload.serie.patientID;
      const delAims = { ...state.aimsList };
      delete delAims[delSeriesUID];
      let delGrid = state.openSeries.slice(0, action.payload.index);
      delGrid = delGrid.concat(
        state.openSeries.slice(action.payload.index + 1)
      );
      let shouldPatientExist = false;
      for (let item of delGrid) {
        if (item.patientID === delPatientID) {
          shouldPatientExist = true;
          break;
        }
      }
      const delPatients = { ...state.patients };
      if (shouldPatientExist) {
        delPatients[delPatientID].studies[delStudyUID].series[
          delSeriesUID
        ].isDisplayed = false;
      } else {
        delete delPatients[delPatientID];
      }
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
        patients: delPatients,
        activePort: delActivePort
      };
    case LOAD_ANNOTATIONS:
      return Object.assign({}, state, {
        loading: true,
        error: false
      });
    case LOAD_ANNOTATIONS_SUCCESS:
      let indexKey = state.openSeries.length - 1;
      let { summaryData, aimsData, serID, patID, ref } = action.payload;
      const newResult = Object.assign({}, state, {
        patients: {
          ...state.patients,
          [patID]: summaryData
        },
        loading: false,
        error: false,
        activePort: indexKey,
        aimsList: { ...state.aimsList, [serID]: aimsData },
        openSeries: state.openSeries.concat([ref])
      });
      return newResult;
    case VIEWPORT_FULL:
      const viewPortStatus = !state.showGridFullAlert;
      return { ...state, showGridFullAlert: viewPortStatus };
    case OPEN_PROJECT_MODAL:
      const projectModalStatus = !state.showProjectModal;
      return { ...state, showProjectModal: projectModalStatus };
    case LOAD_SERIE_SUCCESS:
      let indexNum = state.openSeries.length - 1;
      const ptID = action.payload.ref.patientID;
      const stID = action.payload.ref.studyUID;
      const srID = action.payload.ref.seriesUID;
      const { ann } = action.payload;
      let changedPatients;
      const result = Object.assign({}, state, {
        loading: false,
        error: false,
        activePort: indexNum,
        aimsList: {
          ...state.aimsList,
          [action.payload.serID]: action.payload.aimsData
        }
      });
      return !changedPatients
        ? result
        : { ...result, patients: changedPatients };
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
      return Object.assign({}, state, { activePort: action.portIndex });
    case SHOW_ANNOTATION_WINDOW:
      const showStatus = state.listOpen;
      return Object.assign({}, state, { listOpen: !showStatus });
    case SHOW_ANNOTATION_DOCK:
      const displayAnnDock = state.dockOpen;
      return Object.assign({}, state, { dockOpen: !displayAnnDock });
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
      if (action.selectionType === "annotation") {
        selectionState.selectedSeries = {};
        selectionState.selectedStudies = {};
        selectionState.selectedPatients = {};
      } else if (action.selectionType === "serie") {
        selectionState.selectedAnnotations = {};
        selectionState.selectedStudies = {};
        selectionState.selectedPatients = {};
      } else if (action.selectionType === "study") {
        selectionState.selectedAnnotations = {};
        selectionState.selectedSeries = {};
        selectionState.selectedPatients = {};
      } else if (action.selectionType === "patient") {
        selectionState.selectedAnnotations = {};
        selectionState.selectedSeries = {};
        selectionState.selectedStudies = {};
      } else {
        selectionState.selectedAnnotations = {};
        selectionState.selectedSeries = {};
        selectionState.selectedStudies = {};
        selectionState.selectedPatients = {};
      }
      return selectionState;
    case SELECT_PATIENT:
      let patientsNew = {
        ...state.selectedPatients
      };
      patientsNew[action.patient.subjectID]
        ? delete patientsNew[action.patient.subjectID]
        : (patientsNew[action.patient.subjectID] = action.patient);
      return { ...state, selectedPatients: patientsNew };
    case SELECT_STUDY:
      let newStudies = {
        ...state.selectedStudies
      };
      newStudies[action.study.studyUID]
        ? delete newStudies[action.study.studyUID]
        : (newStudies[action.study.studyUID] = action.study);
      return { ...state, selectedStudies: newStudies };
    case LOAD_COMPLETED:
      return { ...state, loading: false };
    case START_LOADING:
      return { ...state, loading: true };
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
    case DISPLAY_SINGLE_AIM:
      let aimPatient = { ...state.patients[action.payload.patientID] };
      let aimOpenSeries = [...state.openSeries];
      let aimAimsList = { ...state.aimsList[action.payload.seriesUID] };
      //update patient data
      for (let stItem in aimPatient.studies) {
        if (stItem === action.payload.studyUID) {
          for (let srItem in aimPatient.studies[stItem].series) {
            if (srItem === action.payload.seriesUID) {
              for (let annItem in aimPatient.studies[stItem].series[srItem]
                .annotations) {
                if (annItem === action.payload.aimID) {
                  aimPatient.studies[stItem].series[srItem].annotations[
                    annItem
                  ].isDisplayed = true;
                } else {
                  aimPatient.studies[stItem].series[srItem].annotations[
                    annItem
                  ].isDisplayed = false;
                }
              }
            }
          }
        }
      }
      //update aimsList data
      let allAims = Object.keys(
        aimPatient.studies[action.payload.studyUID].series[
          action.payload.seriesUID
        ].annotations
      );

      allAims.forEach(ann => {
        if (ann === action.payload.aimID) {
          aimAimsList[ann].isDisplayed = true;
          aimAimsList[ann].showLabel = true;
        } else {
          aimAimsList[ann].isDisplayed = false;
          aimAimsList[ann].showLabel = false;
        }
      });

      //update Openseries data
      aimOpenSeries[action.payload.index].aimID = action.payload.aimID;

      return {
        ...state,
        aimsList: {
          ...state.aimsList,
          [action.payload.seriesUID]: aimAimsList
        },
        patients: { ...state.patients, [action.payload.patientID]: aimPatient },
        openSeries: aimOpenSeries
      };
    case ADD_TO_GRID:
      let newOpenSeries = state.openSeries.concat(action.reference);
      return { ...state, openSeries: newOpenSeries };
    case UPDATE_PATIENT:
      let updatedPt = { ...state.patients[action.payload.patient] };
      if (action.payload.type === "study") {
        let selectedSt = updatedPt.studies[action.payload.study];
        for (let serie in selectedSt.series) {
          selectedSt.series[serie].isDisplayed = action.payload.status;
        }
      } else if (
        action.payload.type === "serie" ||
        action.payload.type === "annotation"
      ) {
        let selectedSr =
          updatedPt.studies[action.payload.study].series[action.payload.serie];
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
      let updatedGrid = [...state.openSeries];
      updatedGrid[index].aimID = aimID;
      return { ...state, openSeries: updatedGrid };
    default:
      return state;
  }
};

export default asyncReducer;
