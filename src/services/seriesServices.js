import http from "./httpService";
import { isLite, apiUrl, wadoUrl } from "../config.json";

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
        series.subjectUID +
        "/studies/" +
        series.studyUID +
        "/series/" +
        series.seriesUID +
        "/images"
    );
  else
    return http.get(
      apiUrl +
        "/projects/" +
        series.projectUID +
        "/subjects/" +
        series.subjectUID +
        "/studies/" +
        series.studyUID +
        "/series/" +
        series.seriesUID +
        "/images/"
    );
}

//  seems like this doesn't belong to here but olny services know details about paths&server side
export function getWadoImagePath(series, imageId) {
  if (isLite) {
    return (
      wadoUrl +
      "/studies/" +
      series.studyUID +
      "/series/" +
      series.seriesUID +
      "/instances/" +
      imageId
    );
  } else
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

export function deleteSeries(series) {
  if (isLite) {
    const url =
      apiUrl +
      "/projects/lite/subjects/" +
      series.patientID +
      "/studies/" +
      series.studyUID +
      "/series/" +
      series.seriesUID;
    return http.delete(url);
  }
}

export function saveSeries(
  projectID,
  subjectID,
  studyID,
  abbreviation,
  description
) {
  //http://epad-dev8.stanford.edu:8080/epad/v2/projects/test1id/subjects/test/studies/test2_/series/test2?description=test2
  const url =
    apiUrl +
    "/projects/" +
    projectID +
    "/subjects/" +
    subjectID +
    "/studies/" +
    studyID +
    "/series/" +
    abbreviation +
    "?description=" +
    description;
  return http.put(url);
}
