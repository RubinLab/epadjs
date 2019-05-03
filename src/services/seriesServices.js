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
      "/studies/" +
      series.studyId +
      "/series/" +
      series.seriesId +
      "/images/"
  );
}

export function downloadSeries(series) {
  const url =
    apiUrl +
    "/projects/" +
    series.projectID +
    "/subjects/" +
    series.patientID +
    "/studies/" +
    series.studyUID +
    "/series/" +
    series.seriesUID +
    "?&format=stream&includeAims=true";
  return http.get(url, { responseType: "blob" });
}
