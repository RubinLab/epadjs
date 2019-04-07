import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
  LOAD_ANNOTATIONS_ERROR,
  UPDATE_ANNOTATION,
  VIEWPORT_FULL_PROJECTS,
  TOGGLE_ALL_ANNOTATIONS,
  CHANGE_ACTIVE_PORT,
  LOAD_SERIE_SUCCESS,
  SHOW_ANNOTATION_WINDOW
} from "./types";

const initialState = {
  openSeries: [],
  aimsList: {},
  activePort: null,
  loading: false,
  error: false,
  patients: {},
  listOpen: false
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
      return Object.assign({}, state, {
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
        for (let annotation in changedPatient.studies[stID].series[srID]
          .annotations) {
          changedPatient.studies[stID].series[srID].annotations[
            annotation
          ].isDisplayed = true;
        }
      }
      const changedPatients = { ...state.patients, [ptID]: changedPatient };
      return Object.assign({}, state, {
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
    // case TOGGLE_ALL_ANNOTATIONS:
    //   //update openSeries
    //   let { serieID, studyID, displayStatus } = action.payload;
    //   let changedOpenSeries = { ...state.openSeries };
    //   let openSeriesArray = Object.values(changedOpenSeries);

    //   for (let i = 0; i < openSeriesArray.length; i++) {
    //     if (openSeriesArray[i].seriesUID === serieID) {
    //       let annotations =
    //         openSeriesArray[i]["studies"][studyID]["series"][serieID][
    //           "annotations"
    //         ];
    //       for (let annotation in annotations) {
    //         annotations[annotation].isDisplayed = displayStatus;
    //       }
    //       changedOpenSeries[i] = openSeriesArray[i];
    //     } else {
    //       changedOpenSeries[i] = openSeriesArray[i];
    //     }
    //   }

    //   //update aimlist
    //   let newAimList = Object.assign({}, state.aimsList);
    //   for (let aim in newAimList[serieID]) {
    //     newAimList[serieID][aim].isDisplayed = displayStatus;
    //   }
    //   return Object.assign({}, state, {
    //     aimsList: newAimList,
    //     openSeries: changedOpenSeries
    //   });
    default:
      return state;
  }
};

export default asyncReducer;
