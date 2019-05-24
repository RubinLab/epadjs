import http from "./httpService";
import { apiUrl, wadoUrl } from "../config.json";

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
      series.studyUID +
      "/series/" +
      series.seriesUID +
      "/images/"
  );
}

//  seems like this doesn't belong to here but olny services know details about paths&server side
export function getWadoImagePath(series, imageId) {
  return (
    wadoUrl +
    "?requestType=WADO&studyUID=" +
    series.studyUID +
    "&seriesUID=" +
    series.seriesUID +
    "&objectUID=" +
    imageId +
    "&contentType=application%2Fdicom"
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
