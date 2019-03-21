import http from "./httpService";
import { apiUrl } from "../config.json";

export function getSeries(projectId, subjectId, studyId) {
  return http.get(
    apiUrl +
      "/projects/" +
      projectId +
      "/subjects/" +
      subjectId +
      "/studies/" +
      studyId +
      "/series/?&filterDSO=true"
  );
}
export function getImageIds(series) {
  return http.get(
    apiUrl +
      "/projects/" +
      series.projectId +
      "/subjects/" +
      series.subjectId +
      "/studies/" +
      series.studyId +
      "/series/" +
      series.seriesId +
      "/images/"
  );
}

export function getSeriesByID(projectId, subjectId, studyId, seriesId) {
  return http.get(
    apiUrl +
      "/projects/" +
      projectId +
      "/subjects/" +
      subjectId +
      "/studies/" +
      studyId +
      "/series/" +
      seriesId +
      "/aims/?format=json"
  );
}
