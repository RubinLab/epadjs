import {
  LOAD_ANNOTATIONS,
  LOAD_ANNOTATIONS_SUCCESS,
  LOAD_ANNOTATIONS_ERROR
} from "./types";
import { getSeriesByID } from "../../services/seriesServices";

export const loadAnnotations = () => {
  console.log("ann loading");
  return {
    type: LOAD_ANNOTATIONS
  };
};

export const annotationsLoaded = data => {
  console.log("ann loaded");

  return {
    type: LOAD_ANNOTATIONS_SUCCESS,
    data
  };
};

export const annotationsLoadingError = error => {
  console.log("ann error");

  return {
    type: LOAD_ANNOTATIONS_ERROR,
    error
  };
};

export const getAnnotations = (projectId, subjectId, studyId, seriesId) => {
  console.log("called once");
  return (dispatch, getState) => {
    console.log("called twice");
    dispatch(loadAnnotations());
    return getSeriesByID(projectId, subjectId, studyId, seriesId)
      .then(data => data.json())
      .then(data => {
        console.log("data in promise", data);
        dispatch(annotationsLoaded(data));
      })
      .catch(err => dispatch(annotationsLoadingError(err)));
  };
};
