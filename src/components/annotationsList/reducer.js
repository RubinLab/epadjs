import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
  LOAD_ANNOTATIONS_ERROR,
  UPDATE_ANNOTATION
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
      const { serie, annotation, isDisplayed } = action.payload;
      const newAnn = { annotation };
      return Object.assign({}, state, {
        aimsList: {
          ...state.aimsList,
          [serie]: {
            ...state.aimsList[serie],
            [annotation]: { ...state.aimsList[serie][annotation], isDisplayed }
          }
        }
      });
    default:
      return state;
  }
};

export default asyncReducer;
