import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
  LOAD_ANNOTATIONS_ERROR,
  UPDATE_ANNOTATION,
  VIEWPORT_FULL,
  TOGGLE_ALL_ANNOTATIONS,
  TOGGLE_ALL_LABELS,
  TOGGLE_LABEL,
  CHANGE_ACTIVE_PORT,
  LOAD_SERIE_SUCCESS,
  SHOW_ANNOTATION_WINDOW,
  SHOW_ANNOTATION_DOCK,
  OPEN_PROJECT_MODAL,
  CLEAR_GRID,
  CLEAR_SELECTION,
  SELECT_SERIE,
  SELECT_STUDY,
  GET_PATIENT,
  SELECT_ANNOTATION
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
  selectedStudies: [],
  selectedSeries: [],
  selectedAnnotations: []
};

const asyncReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_ANNOTATIONS:
      return Object.assign({}, state, {
        loading: true,
        error: false
      });
    case LOAD_ANNOTATIONS_SUCCESS:
      let indexKey = state.openSeries.length;
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
      let indexNum = state.openSeries.length;
      const ptID = action.payload.ref.patientID;
      const stID = action.payload.ref.studyUID;
      const srID = action.payload.ref.seriesUID;
      const { ann } = action.payload;
      let changedPatient = Object.assign({}, state.patients[ptID]);
      // let displayStatus = ann ? ann === aim.uniqueIdentifier.root : !ann;

      if (ann) {
        changedPatient.studies[stID].series[srID].annotations[
          ann
        ].isDisplayed = true;
      } else {
        changedPatient.studies[stID].series[srID].displayAnns = true;
        // changedPatient.studies[stID].series[srID].isLabelDisplayed = true;
        for (let annotation in changedPatient.studies[stID].series[srID]
          .annotations) {
          changedPatient.studies[stID].series[srID].annotations[
            annotation
          ].isDisplayed = true;
        }
      }
      const changedPatients = { ...state.patients, [ptID]: changedPatient };
      const result = Object.assign({}, state, {
        loading: false,
        error: false,
        activePort: indexNum,
        aimsList: {
          ...state.aimsList,
          [action.payload.serID]: action.payload.aimsData
        },
        openSeries: state.openSeries.concat([action.payload.ref]),
        patients: changedPatients
      });

      return result;
    case LOAD_ANNOTATIONS_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.error
      });
    case UPDATE_ANNOTATION:
      let { serie, study, patient, annotation, isDisplayed } = action.payload;
      let updatedPatient = Object.assign({}, state.patients[patient]);

      let updatedSerieAimArr = Object.values(
        updatedPatient.studies[study].series[serie].annotations
      );
      updatedSerieAimArr.forEach(ann => {
        if (ann.aimID === annotation) {
          ann.isDisplayed = isDisplayed;
        }
      });

      const newPatients = {
        ...state.patients,
        [patient]: updatedPatient
      };
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
        },
        patients: newPatients
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
      let { patientID, studyID, serieID, displayStatus } = action.payload;
      let toggleAnnPatients = Object.assign({}, state.patients);
      const newSerie =
        toggleAnnPatients[patientID].studies[studyID].series[serieID];
      let annotationsInSerie = newSerie.annotations;
      for (let ann in annotationsInSerie) {
        annotationsInSerie[ann].isDisplayed = displayStatus;
      }
      const newValue = !toggleAnnPatients[patientID].studies[studyID].series[
        serieID
      ].displayAnns;
      newSerie.displayAnns = newValue;
      if (!newValue) {
        // newSerie.isLabelDisplayed = newValue;
      }
      return Object.assign({}, state, { patients: toggleAnnPatients });
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
      let selectionArr = [];
      if (state.selectedStudies.length > 0) {
        selectionArr = state.selectedStudies.concat([]);
      } else if (state.selectedSeries.length > 0) {
        selectionArr = state.selectedSeries.concat([]);
      } else {
        selectionArr = state.selectedAnnotations.concat([]);
      }

      //keep the patient if already there
      selectionArr.forEach(item => {
        if (state.patients[item.patientID]) {
          clearedPatients[item.patientID] = {
            ...state.patients[item.patientID]
          };
        }
      });

      for (let patient in clearedPatients) {
        for (let study in clearedPatients[patient]) {
          for (let serie in clearedPatients[patient][study]) {
            serie.displayAnns = false;
            for (let ann in clearedPatients[patient][study][serie]) {
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
      return {
        ...state,
        selectedAnnotations: [],
        selectedSeries: [],
        selectedStudies: []
      };
    case SELECT_STUDY:
      let newStudies = state.selectedStudies.concat([action.study]);
      return { ...state, selectedStudies: newStudies };
    case GET_PATIENT:
      let addedNewPatient = { ...state.patients };
      addedNewPatient[action.patient.patientID] = action.patient;
      console.log(addedNewPatient);
      return { ...state, patients: addedNewPatient };
    default:
      return state;
  }
};

export default asyncReducer;
