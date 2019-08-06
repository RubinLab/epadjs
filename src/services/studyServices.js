import http from "./httpService";
import { isLite, apiUrl } from "../config.json";

export function getStudies(projectId, subjectId) {
  if (isLite)
    return http.get(
      apiUrl + "/projects/lite/subjects/" + subjectId + "/studies"
    );
  else
    return http.get(
      apiUrl + "/projects/" + projectId + "/subjects/" + subjectId + "/studies/"
    );
}

export function downloadStudies(study) {
  const url =
    apiUrl +
    "/projects/" +
    study.projectID +
    "/subjects/" +
    study.patientID +
    "/studies/" +
    study.studyUID +
    "?format=stream&includeAims=true";
  return http.get(url, { responseType: "blob" });
}

export function deleteStudy(study) {
  if (isLite) {
    const url =
      apiUrl +
      "/projects/lite/subjects/" +
      study.patientID +
      "/studies/" +
      study.studyUID;
    return http.delete(url);
  }
}

export function getStudyAims(subjectID, studyUID) {
  if (isLite) {
    return http.get(
      apiUrl +
        "/projects/lite/subjects/" +
        subjectID +
        "/studies/" +
        studyUID +
        "/aims"
    );
  }
}

export function saveStudy(projectID, subjectID, abbreviation, description) {
  // http://epad-dev8.stanford.edu:8080/epad/v2/projects/test1id/subjects/test/studies/test2_?description=test2
  const url =
    apiUrl +
    "/projects/" +
    projectID +
    "/subjects/" +
    subjectID +
    "/studies/" +
    abbreviation +
    "?description=" +
    description;
  return http.put(url);
}
