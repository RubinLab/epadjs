import http from "./httpService";
import { apiUrl } from "../config.json";

export function getStudies(projectId, subjectId) {
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
