import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
  LOAD_ANNOTATIONS_ERROR
} from "./types";

const initialState = {
  annotations: [],
  loading: false,
  error: false
};

const asyncReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_ANNOTATIONS:
      return Object.assign({}, state, {
        annotations: [],
        loading: true,
        error: false
      });
    case LOAD_ANNOTATIONS_SUCCESS:
      return Object.assign({}, state, {
        annotations: action.data,
        loading: false,
        error: false
      });

    case LOAD_ANNOTATIONS_ERROR:
      return Object.assign({}, state, {
        loading: false,
        error: action.error
      });
    default:
      return state;
  }
};

export default asyncReducer;
