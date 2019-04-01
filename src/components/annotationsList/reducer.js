import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
  LOAD_ANNOTATIONS_ERROR,
  UPDATE_ANNOTATION,
  TOGGLE_ALL_ANNOTATIONS
} from "./types";

const initialState = {
  openSeries: {},
  aimsList: {},
  activePort: null,
  loading: false,
  error: false
};

const asyncReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_ANNOTATIONS:
      return Object.assign({}, state, {
        loading: true,
        error: false
      });
    case LOAD_ANNOTATIONS_SUCCESS:
      const indexKey = Object.keys(state.openSeries).length;
      const { id } = action.payload;
      return Object.assign({}, state, {
        openSeries: {
          ...state.openSeries,
          [indexKey]: action.payload.summaryData
        },
        loading: false,
        error: false,
        activePort: indexKey,
        aimsList: { ...state.aimsList, [id]: action.payload.aimsData }
      });
    case LOAD_ANNOTATIONS_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.error
      });
    case UPDATE_ANNOTATION:
      const { serie, study, annotation, isDisplayed } = action.payload;
      let newOpenSeries = Object.assign({}, state.openSeries);
      const openSeriesArr = Object.values(newOpenSeries);
      let index;
      for (let i = 0; i < openSeriesArr.length; i++) {
        if (openSeriesArr[i].seriesUID === serie) {
          index = i;
          openSeriesArr[i]["studies"][study]["series"][serie]["annotations"][
            annotation
          ].isDisplayed = isDisplayed;
        }
      }
      newOpenSeries = {
        ...state.openSeries,
        [index]: openSeriesArr[index]
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
        openSeries: newOpenSeries
      });
    case TOGGLE_ALL_ANNOTATIONS:
      //update openSeries
      const { serieID, studyID, displayStatus } = action.payload;
      let changedOpenSeries = { ...state.openSeries };
      const openSeriesArray = Object.values(changedOpenSeries);

      for (let i = 0; i < openSeriesArray.length; i++) {
        if (openSeriesArray[i].seriesUID === serieID) {
          const annotations =
            openSeriesArray[i]["studies"][studyID]["series"][serieID][
              "annotations"
            ];
          for (let annotation in annotations) {
            annotations[annotation].isDisplayed = displayStatus;
          }
          changedOpenSeries[i] = openSeriesArray[i];
        } else {
          changedOpenSeries[i] = openSeriesArray[i];
        }
      }

      //update aimlist
      const newAimList = Object.assign({}, state.aimsList);
      for (let aim in newAimList[serieID]) {
        newAimList[serieID][aim].isDisplayed = displayStatus;
      }
      return Object.assign({}, state, {
        aimsList: newAimList,
        openSeries: changedOpenSeries
      });
    default:
      return state;
  }
};

export default asyncReducer;
