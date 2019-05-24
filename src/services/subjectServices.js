import http from "./httpService";

import { isLite, apiUrl } from "../config.json";
import { getCurrentUser } from "./authService";

export function getSubjects(projectId) {
  if (isLite) {
    projectId = "lite";
    return http.get(apiUrl + "/projects/" + projectId + "/subjects");
  } else return http.get(apiUrl + "/projects/" + projectId + "/subjects/");
}

export function downloadSubjects(subject) {
  const url =
    apiUrl +
    "/projects/" +
    subject.projectID +
    "/subjects/" +
    subject.subjectID +
    "?format=stream&includeAims=true";
  return http.get(url, { responseType: "blob" });
}
