import http from "./httpService";
import { apiUrl } from "../config.json";

export function getStudies(projectId, subjectId) {
  return http.get(
    apiUrl + "/projects/" + projectId + "/subjects/" + subjectId + "/studies/"
  );
}

export function downloadStudy(study) {
  return http.get(
    apiUrl +
      "/projects/" +
      study.projectId +
      "/subjects/" +
      study.subjectId +
      "/studies/" +
      study.studyUID +
      "?format=stream&includeAims=true"
  );
}
