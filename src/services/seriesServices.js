import http from "./httpService";

import { isLite, apiUrl } from "../config.json";


export function getSeries(projectId, subjectId, studyId) {
  if (isLite)
    return http.get(

      apiUrl +

        "/projects/lite/subjects/" +
        subjectId +
        "/studies/" +
        studyId +
        "/series?&filterDSO=true"
    );
  else
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
  if (isLite)
    return http.get(
      apiUrl +

        "/projects/lite/subjects/" +
        series.subjectId +
        "/studies/" +
        series.studyId +
        "/series/" +
        series.seriesId +
        "/images"
    );
  else
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
